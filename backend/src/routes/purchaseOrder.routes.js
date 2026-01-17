const express = require('express');
const { body, param } = require('express-validator');
const purchaseOrderController = require('../controllers/purchaseOrder.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const createPOValidation = [
  body('vendorId')
    .notEmpty()
    .withMessage('Vendor ID is required')
    .isUUID()
    .withMessage('Invalid vendor ID'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.description')
    .notEmpty()
    .withMessage('Item description is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('items.*.unitPrice')
    .isFloat({ min: 0.01 })
    .withMessage('Unit price must be a positive number'),
  body('poDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('status')
    .optional()
    .isIn(['Draft', 'Approved'])
    .withMessage('Status must be Draft or Approved'),
];

const updateStatusValidation = [
  param('id').isUUID().withMessage('Invalid purchase order ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Draft', 'Approved', 'PartiallyPaid', 'FullyPaid'])
    .withMessage('Invalid status'),
];

// Apply auth middleware to all routes
router.use(authMiddleware);

// POST /api/purchase-orders - Create a new purchase order
router.post('/', createPOValidation, validate, purchaseOrderController.create);

// GET /api/purchase-orders - List all purchase orders
router.get('/', purchaseOrderController.findAll);

// GET /api/purchase-orders/:id - Get purchase order details
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid purchase order ID')],
  validate,
  purchaseOrderController.findById
);

// PATCH /api/purchase-orders/:id/status - Update PO status
router.patch(
  '/:id/status',
  updateStatusValidation,
  validate,
  purchaseOrderController.updateStatus
);

// DELETE /api/purchase-orders/:id - Delete purchase order (soft delete)
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid purchase order ID')],
  validate,
  purchaseOrderController.delete
);

module.exports = router;
