const { prisma } = require('../config/database');
const purchaseOrderService = require('./purchaseOrder.service');

class PaymentService {
  // Generate unique payment reference
  generateReferenceNumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PAY-${dateStr}-${random}`;
  }

  async create(data, userId) {
    // Validate PO exists
    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: { id: data.purchaseOrderId, isDeleted: false },
      include: {
        vendor: true,
        payments: {
          where: { isDeleted: false, isVoided: false },
        },
      },
    });

    if (!purchaseOrder) {
      const error = new Error('Purchase Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if vendor is active
    if (purchaseOrder.vendor.status === 'Inactive') {
      const error = new Error('Cannot record payment for inactive vendor');
      error.statusCode = 400;
      throw error;
    }

    // Check if PO is in Draft status
    if (purchaseOrder.status === 'Draft') {
      const error = new Error('Cannot record payment for Draft purchase order. Approve the PO first.');
      error.statusCode = 400;
      throw error;
    }

    // Calculate outstanding amount
    const totalPaid = purchaseOrder.payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amountPaid),
      0
    );
    const outstandingAmount = parseFloat(purchaseOrder.totalAmount) - totalPaid;

    // Validate payment amount
    if (parseFloat(data.amountPaid) <= 0) {
      const error = new Error('Payment amount must be positive');
      error.statusCode = 400;
      throw error;
    }

    if (parseFloat(data.amountPaid) > outstandingAmount) {
      const error = new Error(
        `Payment amount (${data.amountPaid}) exceeds outstanding amount (${outstandingAmount.toFixed(2)})`
      );
      error.statusCode = 400;
      throw error;
    }

    // Generate reference number
    let referenceNumber = this.generateReferenceNumber();
    
    // Ensure uniqueness
    let exists = await prisma.payment.findUnique({
      where: { referenceNumber },
    });
    
    while (exists) {
      referenceNumber = this.generateReferenceNumber();
      exists = await prisma.payment.findUnique({
        where: { referenceNumber },
      });
    }

    // Create payment using transaction
    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          referenceNumber,
          purchaseOrderId: data.purchaseOrderId,
          paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
          amountPaid: data.amountPaid,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          createdBy: userId,
        },
        include: {
          purchaseOrder: {
            include: {
              vendor: {
                select: {
                  id: true,
                  vendorName: true,
                },
              },
            },
          },
        },
      });

      return newPayment;
    });

    // Recalculate PO status
    await purchaseOrderService.recalculateStatus(data.purchaseOrderId);

    return payment;
  }

  async findAll(query = {}) {
    const { purchaseOrderId, page = 1, limit = 20, startDate, endDate, paymentMethod } = query;

    const where = { isDeleted: false };

    if (purchaseOrderId) {
      where.purchaseOrderId = purchaseOrderId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) {
        where.paymentDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.paymentDate.lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 100);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { paymentDate: 'desc' },
        include: {
          purchaseOrder: {
            select: {
              id: true,
              poNumber: true,
              totalAmount: true,
              vendor: {
                select: {
                  id: true,
                  vendorName: true,
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findById(id) {
    const payment = await prisma.payment.findFirst({
      where: { id, isDeleted: false },
      include: {
        purchaseOrder: {
          include: {
            vendor: true,
            items: true,
            payments: {
              where: { isDeleted: false, isVoided: false },
              orderBy: { paymentDate: 'asc' },
            },
          },
        },
      },
    });

    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }

    return payment;
  }

  async voidPayment(id, userId) {
    const payment = await prisma.payment.findFirst({
      where: { id, isDeleted: false },
    });

    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }

    if (payment.isVoided) {
      const error = new Error('Payment is already voided');
      error.statusCode = 400;
      throw error;
    }

    // Void the payment using transaction
    const voidedPayment = await prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id },
        data: {
          isVoided: true,
          updatedBy: userId,
        },
      });

      return updated;
    });

    // Recalculate PO status
    await purchaseOrderService.recalculateStatus(payment.purchaseOrderId);

    return voidedPayment;
  }

  async delete(id) {
    const payment = await prisma.payment.findFirst({
      where: { id, isDeleted: false },
    });

    if (!payment) {
      const error = new Error('Payment not found');
      error.statusCode = 404;
      throw error;
    }

    // Soft delete
    await prisma.payment.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Recalculate PO status
    await purchaseOrderService.recalculateStatus(payment.purchaseOrderId);

    return { message: 'Payment deleted successfully' };
  }
}

module.exports = new PaymentService();
