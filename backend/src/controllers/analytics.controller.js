const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  async getVendorOutstanding(req, res, next) {
    try {
      const result = await analyticsService.getVendorOutstanding();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentAging(req, res, next) {
    try {
      const result = await analyticsService.getPaymentAging();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentTrends(req, res, next) {
    try {
      const result = await analyticsService.getPaymentTrends();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardSummary(req, res, next) {
    try {
      const result = await analyticsService.getDashboardSummary();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
