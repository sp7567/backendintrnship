const prisma = require('../config/database');

class VendorService {
  async create(data, userId) {
    // Check if vendor with same email exists
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        OR: [
          { email: data.email },
          { vendorName: data.vendorName },
        ],
        isDeleted: false,
      },
    });

    if (existingVendor) {
      const error = new Error(
        existingVendor.email === data.email
          ? 'Vendor with this email already exists'
          : 'Vendor with this name already exists'
      );
      error.statusCode = 409;
      throw error;
    }

    const vendor = await prisma.vendor.create({
      data: {
        vendorName: data.vendorName,
        contactPerson: data.contactPerson,
        email: data.email,
        phoneNumber: data.phoneNumber,
        paymentTerms: data.paymentTerms || 'DAYS_30',
        status: data.status || 'Active',
        createdBy: userId,
      },
    });

    return vendor;
  }

  async findAll(query = {}) {
    const { status, page = 1, limit = 20, search } = query;

    const where = { isDeleted: false };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { vendorName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 100);

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vendor.count({ where }),
    ]);

    return {
      data: vendors,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findById(id) {
    const vendor = await prisma.vendor.findFirst({
      where: { id, isDeleted: false },
      include: {
        purchaseOrders: {
          where: { isDeleted: false },
          include: {
            payments: {
              where: { isDeleted: false, isVoided: false },
            },
          },
        },
      },
    });

    if (!vendor) {
      const error = new Error('Vendor not found');
      error.statusCode = 404;
      throw error;
    }

    // Calculate payment summary
    let totalPOAmount = 0;
    let totalPaidAmount = 0;

    vendor.purchaseOrders.forEach((po) => {
      totalPOAmount += parseFloat(po.totalAmount);
      po.payments.forEach((payment) => {
        totalPaidAmount += parseFloat(payment.amountPaid);
      });
    });

    const paymentSummary = {
      totalPurchaseOrders: vendor.purchaseOrders.length,
      totalPOAmount,
      totalPaidAmount,
      outstandingAmount: totalPOAmount - totalPaidAmount,
    };

    return {
      ...vendor,
      paymentSummary,
    };
  }

  async update(id, data, userId) {
    const vendor = await prisma.vendor.findFirst({
      where: { id, isDeleted: false },
    });

    if (!vendor) {
      const error = new Error('Vendor not found');
      error.statusCode = 404;
      throw error;
    }

    // Check for duplicate email/name if being updated
    if (data.email || data.vendorName) {
      const existingVendor = await prisma.vendor.findFirst({
        where: {
          OR: [
            data.email ? { email: data.email } : undefined,
            data.vendorName ? { vendorName: data.vendorName } : undefined,
          ].filter(Boolean),
          NOT: { id },
          isDeleted: false,
        },
      });

      if (existingVendor) {
        const error = new Error(
          existingVendor.email === data.email
            ? 'Vendor with this email already exists'
            : 'Vendor with this name already exists'
        );
        error.statusCode = 409;
        throw error;
      }
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
    });

    return updatedVendor;
  }

  async delete(id) {
    const vendor = await prisma.vendor.findFirst({
      where: { id, isDeleted: false },
    });

    if (!vendor) {
      const error = new Error('Vendor not found');
      error.statusCode = 404;
      throw error;
    }

    // Soft delete
    await prisma.vendor.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'Vendor deleted successfully' };
  }
}

module.exports = new VendorService();
