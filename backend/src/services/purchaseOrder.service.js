const { prisma } = require('../config/database');

class PurchaseOrderService {
  // Generate unique PO number
  generatePONumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO-${dateStr}-${random}`;
  }

  // Calculate due date based on vendor payment terms
  calculateDueDate(poDate, paymentTerms) {
    const days = {
      'DAYS_7': 7,
      'DAYS_15': 15,
      'DAYS_30': 30,
      'DAYS_45': 45,
      'DAYS_60': 60,
    };
    const dueDate = new Date(poDate);
    dueDate.setDate(dueDate.getDate() + (days[paymentTerms] || 30));
    return dueDate;
  }

  // Calculate total amount from items
  calculateTotalAmount(items) {
    return items.reduce((sum, item) => {
      return sum + (item.quantity * parseFloat(item.unitPrice));
    }, 0);
  }

  async create(data, userId) {
    // Check if vendor exists and is active
    const vendor = await prisma.vendor.findFirst({
      where: { id: data.vendorId, isDeleted: false },
    });

    if (!vendor) {
      const error = new Error('Vendor not found');
      error.statusCode = 404;
      throw error;
    }

    if (vendor.status === 'Inactive') {
      const error = new Error('Cannot create PO for inactive vendor');
      error.statusCode = 400;
      throw error;
    }

    // Generate PO number
    let poNumber = this.generatePONumber();
    
    // Ensure uniqueness
    let exists = await prisma.purchaseOrder.findUnique({
      where: { poNumber },
    });
    
    while (exists) {
      poNumber = this.generatePONumber();
      exists = await prisma.purchaseOrder.findUnique({
        where: { poNumber },
      });
    }

    // Calculate total amount from items
    const totalAmount = this.calculateTotalAmount(data.items);

    // Calculate due date
    const poDate = data.poDate ? new Date(data.poDate) : new Date();
    const dueDate = this.calculateDueDate(poDate, vendor.paymentTerms);

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId: data.vendorId,
        poDate,
        totalAmount,
        dueDate,
        status: data.status || 'Draft',
        createdBy: userId,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        vendor: true,
        items: true,
      },
    });

    return purchaseOrder;
  }

  async findAll(query = {}) {
    const { vendorId, status, page = 1, limit = 20, search, startDate, endDate } = query;

    const where = { isDeleted: false };

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    if (search) {
      where.poNumber = { contains: search, mode: 'insensitive' };
    }

    if (startDate || endDate) {
      where.poDate = {};
      if (startDate) {
        where.poDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.poDate.lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 100);

    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: {
            select: {
              id: true,
              vendorName: true,
              email: true,
            },
          },
          items: true,
          payments: {
            where: { isDeleted: false, isVoided: false },
            select: {
              id: true,
              amountPaid: true,
            },
          },
        },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    // Add outstanding amount to each PO
    const enrichedPOs = purchaseOrders.map((po) => {
      const totalPaid = po.payments.reduce(
        (sum, payment) => sum + parseFloat(payment.amountPaid),
        0
      );
      return {
        ...po,
        totalPaid,
        outstandingAmount: parseFloat(po.totalAmount) - totalPaid,
      };
    });

    return {
      data: enrichedPOs,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findById(id) {
    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: { id, isDeleted: false },
      include: {
        vendor: true,
        items: true,
        payments: {
          where: { isDeleted: false },
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!purchaseOrder) {
      const error = new Error('Purchase Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Calculate payment history
    const validPayments = purchaseOrder.payments.filter((p) => !p.isVoided);
    const totalPaid = validPayments.reduce(
      (sum, payment) => sum + parseFloat(payment.amountPaid),
      0
    );

    return {
      ...purchaseOrder,
      totalPaid,
      outstandingAmount: parseFloat(purchaseOrder.totalAmount) - totalPaid,
      paymentHistory: purchaseOrder.payments,
    };
  }

  async updateStatus(id, status, userId) {
    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: { id, isDeleted: false },
    });

    if (!purchaseOrder) {
      const error = new Error('Purchase Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Validate status transition
    const validTransitions = {
      'Draft': ['Approved'],
      'Approved': ['PartiallyPaid', 'FullyPaid'],
      'PartiallyPaid': ['FullyPaid'],
      'FullyPaid': [],
    };

    if (!validTransitions[purchaseOrder.status]?.includes(status)) {
      const error = new Error(
        `Invalid status transition from ${purchaseOrder.status} to ${status}`
      );
      error.statusCode = 400;
      throw error;
    }

    const updatedPO = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        updatedBy: userId,
      },
      include: {
        vendor: true,
        items: true,
      },
    });

    return updatedPO;
  }

  async delete(id) {
    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: { id, isDeleted: false },
    });

    if (!purchaseOrder) {
      const error = new Error('Purchase Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Soft delete
    await prisma.purchaseOrder.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'Purchase Order deleted successfully' };
  }

  // Helper method to recalculate and update PO status based on payments
  async recalculateStatus(poId) {
    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: { id: poId, isDeleted: false },
      include: {
        payments: {
          where: { isDeleted: false, isVoided: false },
        },
      },
    });

    if (!purchaseOrder) {
      return null;
    }

    const totalPaid = purchaseOrder.payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amountPaid),
      0
    );

    const totalAmount = parseFloat(purchaseOrder.totalAmount);
    let newStatus = purchaseOrder.status;

    // Only update status if PO is approved or partially paid
    if (purchaseOrder.status !== 'Draft') {
      if (totalPaid >= totalAmount) {
        newStatus = 'FullyPaid';
      } else if (totalPaid > 0) {
        newStatus = 'PartiallyPaid';
      } else {
        newStatus = 'Approved';
      }

      if (newStatus !== purchaseOrder.status) {
        await prisma.purchaseOrder.update({
          where: { id: poId },
          data: { status: newStatus },
        });
      }
    }

    return newStatus;
  }
}

module.exports = new PurchaseOrderService();
