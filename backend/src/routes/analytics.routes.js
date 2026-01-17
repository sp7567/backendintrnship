const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/analytics/dashboard - Dashboard summary
router.get('/dashboard', analyticsController.getDashboardSummary);

// GET /api/analytics/vendor-outstanding - Outstanding balance by vendor
router.get('/vendor-outstanding', analyticsController.getVendorOutstanding);

// GET /api/analytics/payment-aging - Payment aging report
router.get('/payment-aging', analyticsController.getPaymentAging);

// GET /api/analytics/payment-trends - Monthly payment trends
router.get('/payment-trends', analyticsController.getPaymentTrends);

module.exports = router;
