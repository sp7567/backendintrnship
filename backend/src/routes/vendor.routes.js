const express = require('express');
const { body, param } = require('express-validator');
const vendorController = require('../controllers/vendor.controller');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const createVendorValidation = [
  body('vendorName')
    .notEmpty()
    .withMessage('Vendor name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Vendor name must be between 2 and 255 characters'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('contactPerson')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Contact person name must be less than 255 characters'),
  body('phoneNumber')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number must be less than 20 characters'),
  body('paymentTerms')
    .optional()
    .isIn(['DAYS_7', 'DAYS_15', 'DAYS_30', 'DAYS_45', 'DAYS_60'])
    .withMessage('Invalid payment terms'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
];

const updateVendorValidation = [
  param('id').isUUID().withMessage('Invalid vendor ID'),
  body('vendorName')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Vendor name must be between 2 and 255 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('contactPerson')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Contact person name must be less than 255 characters'),
  body('phoneNumber')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number must be less than 20 characters'),
  body('paymentTerms')
    .optional()
    .isIn(['DAYS_7', 'DAYS_15', 'DAYS_30', 'DAYS_45', 'DAYS_60'])
    .withMessage('Invalid payment terms'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
];

// Apply auth middleware to all routes
router.use(authMiddleware);

// POST /api/vendors - Create a new vendor
router.post('/', createVendorValidation, validate, vendorController.create);

// GET /api/vendors - List all vendors
router.get('/', vendorController.findAll);

// GET /api/vendors/:id - Get vendor details
router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid vendor ID')],
  validate,
  vendorController.findById
);

// PUT /api/vendors/:id - Update vendor
router.put('/:id', updateVendorValidation, validate, vendorController.update);

// DELETE /api/vendors/:id - Delete vendor (soft delete)
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid vendor ID')],
  validate,
  vendorController.delete
);

module.exports = router;
