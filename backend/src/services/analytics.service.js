const prisma = require('../config/database');

class AnalyticsService {
  // Outstanding balance by vendor
  async getVendorOutstanding() {
    const vendors = await prisma.vendor.findMany({
      where: { isDeleted: false },
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

    const result = vendors.map((vendor) => {
      let totalPOAmount = 0;
      let totalPaidAmount = 0;

      vendor.purchaseOrders.forEach((po) => {
        totalPOAmount += parseFloat(po.totalAmount);
        po.payments.forEach((payment) => {
          totalPaidAmount += parseFloat(payment.amountPaid);
        });
      });

      return {
        vendorId: vendor.id,
        vendorName: vendor.vendorName,
        email: vendor.email,
        status: vendor.status,
        totalPurchaseOrders: vendor.purchaseOrders.length,
        totalPOAmount: parseFloat(totalPOAmount.toFixed(2)),
        totalPaidAmount: parseFloat(totalPaidAmount.toFixed(2)),
        outstandingAmount: parseFloat((totalPOAmount - totalPaidAmount).toFixed(2)),
      };
    });

    // Sort by outstanding amount descending
    result.sort((a, b) => b.outstandingAmount - a.outstandingAmount);

    const summary = {
      totalVendors: result.length,
      totalOutstanding: parseFloat(
        result.reduce((sum, v) => sum + v.outstandingAmount, 0).toFixed(2)
      ),
      totalPaid: parseFloat(
        result.reduce((sum, v) => sum + v.totalPaidAmount, 0).toFixed(2)
      ),
      vendorsWithOutstanding: result.filter((v) => v.outstandingAmount > 0).length,
    };

    return {
      summary,
      vendors: result,
    };
  }

  // Payment aging report
  async getPaymentAging() {
    const today = new Date();

    // Get all POs with outstanding amounts
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        isDeleted: false,
        status: { in: ['Approved', 'PartiallyPaid'] },
      },
      include: {
        vendor: {
          select: {
            id: true,
            vendorName: true,
          },
        },
        payments: {
          where: { isDeleted: false, isVoided: false },
        },
      },
    });

    const agingBuckets = {
      current: { label: '0-30 days', amount: 0, count: 0, pos: [] },
      days31_60: { label: '31-60 days', amount: 0, count: 0, pos: [] },
      days61_90: { label: '61-90 days', amount: 0, count: 0, pos: [] },
      over90: { label: '90+ days', amount: 0, count: 0, pos: [] },
    };

    purchaseOrders.forEach((po) => {
      const totalPaid = po.payments.reduce(
        (sum, payment) => sum + parseFloat(payment.amountPaid),
        0
      );
      const outstanding = parseFloat(po.totalAmount) - totalPaid;

      if (outstanding <= 0) return;

      const dueDate = new Date(po.dueDate);
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

      const poData = {
        poNumber: po.poNumber,
        vendorName: po.vendor.vendorName,
        totalAmount: parseFloat(po.totalAmount),
        outstanding,
        dueDate: po.dueDate,
        daysOverdue: Math.max(0, daysOverdue),
      };

      if (daysOverdue <= 0 || daysOverdue <= 30) {
        agingBuckets.current.amount += outstanding;
        agingBuckets.current.count++;
        agingBuckets.current.pos.push(poData);
      } else if (daysOverdue <= 60) {
        agingBuckets.days31_60.amount += outstanding;
        agingBuckets.days31_60.count++;
        agingBuckets.days31_60.pos.push(poData);
      } else if (daysOverdue <= 90) {
        agingBuckets.days61_90.amount += outstanding;
        agingBuckets.days61_90.count++;
        agingBuckets.days61_90.pos.push(poData);
      } else {
        agingBuckets.over90.amount += outstanding;
        agingBuckets.over90.count++;
        agingBuckets.over90.pos.push(poData);
      }
    });

    // Round amounts
    Object.keys(agingBuckets).forEach((key) => {
      agingBuckets[key].amount = parseFloat(agingBuckets[key].amount.toFixed(2));
    });

    const totalOutstanding = Object.values(agingBuckets).reduce(
      (sum, bucket) => sum + bucket.amount,
      0
    );

    return {
      summary: {
        totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
        totalPOs: purchaseOrders.filter((po) => {
          const totalPaid = po.payments.reduce(
            (sum, payment) => sum + parseFloat(payment.amountPaid),
            0
          );
          return parseFloat(po.totalAmount) - totalPaid > 0;
        }).length,
      },
      agingBuckets: [
        agingBuckets.current,
        agingBuckets.days31_60,
        agingBuckets.days61_90,
        agingBuckets.over90,
      ],
    };
  }

  // Monthly payment trends (last 6 months)
  async getPaymentTrends() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: {
        isDeleted: false,
        isVoided: false,
        paymentDate: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: { paymentDate: 'asc' },
    });

    // Group by month
    const monthlyData = {};
    
    payments.forEach((payment) => {
      const date = new Date(payment.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          totalAmount: 0,
          paymentCount: 0,
          methods: {},
        };
      }
      
      monthlyData[monthKey].totalAmount += parseFloat(payment.amountPaid);
      monthlyData[monthKey].paymentCount++;
      
      const method = payment.paymentMethod;
      monthlyData[monthKey].methods[method] = 
        (monthlyData[monthKey].methods[method] || 0) + parseFloat(payment.amountPaid);
    });

    // Convert to array and format
    const trends = Object.values(monthlyData).map((month) => ({
      month: month.month,
      totalAmount: parseFloat(month.totalAmount.toFixed(2)),
      paymentCount: month.paymentCount,
      averagePayment: parseFloat((month.totalAmount / month.paymentCount).toFixed(2)),
      byMethod: month.methods,
    }));

    const totalPayments = trends.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalCount = trends.reduce((sum, t) => sum + t.paymentCount, 0);

    return {
      summary: {
        totalPayments: parseFloat(totalPayments.toFixed(2)),
        totalTransactions: totalCount,
        averageMonthly: parseFloat((totalPayments / (trends.length || 1)).toFixed(2)),
      },
      trends,
    };
  }

  // Dashboard summary
  async getDashboardSummary() {
    const [vendorCount, poCount, paymentCount, vendors] = await Promise.all([
      prisma.vendor.count({ where: { isDeleted: false } }),
      prisma.purchaseOrder.count({ where: { isDeleted: false } }),
      prisma.payment.count({ where: { isDeleted: false, isVoided: false } }),
      prisma.vendor.findMany({
        where: { isDeleted: false },
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
      }),
    ]);

    let totalPOAmount = 0;
    let totalPaidAmount = 0;

    vendors.forEach((vendor) => {
      vendor.purchaseOrders.forEach((po) => {
        totalPOAmount += parseFloat(po.totalAmount);
        po.payments.forEach((payment) => {
          totalPaidAmount += parseFloat(payment.amountPaid);
        });
      });
    });

    // PO status breakdown
    const poByStatus = await prisma.purchaseOrder.groupBy({
      by: ['status'],
      where: { isDeleted: false },
      _count: { status: true },
    });

    return {
      vendors: {
        total: vendorCount,
        active: await prisma.vendor.count({
          where: { isDeleted: false, status: 'Active' },
        }),
      },
      purchaseOrders: {
        total: poCount,
        byStatus: poByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
      },
      payments: {
        total: paymentCount,
        totalAmount: parseFloat(totalPaidAmount.toFixed(2)),
      },
      financial: {
        totalPOAmount: parseFloat(totalPOAmount.toFixed(2)),
        totalPaid: parseFloat(totalPaidAmount.toFixed(2)),
        totalOutstanding: parseFloat((totalPOAmount - totalPaidAmount).toFixed(2)),
      },
    };
  }
}

module.exports = new AnalyticsService();
