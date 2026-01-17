const express = require('express');
const { body, param } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const createPaymentValidation = [
  body('purchaseOrderId')
    .notEmpty()
    .withMessage('Purchase Order ID is required')
    .isUUID()
    .withMessage('Invalid purchase order ID'),
  body('amountPaid')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['Cash', 'Cheque', 'NEFT', 'RTGS', 'UPI'])
    .withMessage('Invalid payment method'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
];

// Apply auth middleware to all routes
router.use(authMiddleware);

// POST /api/payments - Record a new payment
router.post('/', createPaymentValidation, validate, paymentController.create);

// GET /api/payments - List all payments
router.get('/', paymentController.findAll);

// GET /api/payments/:id - Get payment details
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid payment ID')],
  validate,
  paymentController.findById
);

// DELETE /api/payments/:id - Void a payment (soft delete)
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid payment ID')],
  validate,
  paymentController.voidPayment
);

module.exports = router;
