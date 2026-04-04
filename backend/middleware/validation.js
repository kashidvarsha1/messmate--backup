// middleware/validation.js
import { body, param, query, validationResult } from 'express-validator';
import logger from '../config/logger.js';

// Enhanced validation result handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg,
    value: err.value
  }));

  // Log validation failures
  logger.warn('Validation failed', {
    path: req.path,
    method: req.method,
    ip: req.ip,
    errors: extractedErrors
  });

  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: extractedErrors
  });
};

// User registration validation (with sanitization)
export const registerValidation = [
  // Name validation
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces')
    .customSanitizer(value => value.replace(/[<>]/g, '')), // Remove < and > characters
  
  // Email validation
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('Email too long'),
  
  // Phone validation
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone().withMessage('Please provide a valid phone number')
    .isLength({ min: 10, max: 10 }).withMessage('Phone number must be exactly 10 digits')
    .matches(/^[0-9]+$/).withMessage('Phone number can only contain digits'),
  
  // Password validation (strong password)
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  
  // Role validation
  body('role')
    .optional()
    .isIn(['customer', 'owner', 'admin']).withMessage('Invalid role'),
  
  validate
];

// Login validation
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

// Provider status update validation
export const updateProviderStatusValidation = [
  param('id')
    .isMongoId().withMessage('Invalid provider ID'),
  
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['open', 'closed', 'limited', 'unknown']).withMessage('Invalid status value'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
    .customSanitizer(value => value.replace(/[<>]/g, '')),
  
  validate
];

// Review creation validation
export const reviewValidation = [
  body('providerId')
    .notEmpty().withMessage('Provider ID is required')
    .isMongoId().withMessage('Invalid provider ID'),
  
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters')
    .customSanitizer(value => value.replace(/[<>]/g, '')),
  
  body('images')
    .optional()
    .isArray().withMessage('Images must be an array'),
  
  validate
];

// Report creation validation
export const reportValidation = [
  body('providerId')
    .notEmpty().withMessage('Provider ID is required')
    .isMongoId().withMessage('Invalid provider ID'),
  
  body('type')
    .notEmpty().withMessage('Report type is required')
    .isIn(['closed_but_open', 'food_not_available', 'fake_info', 'wrong_location', 'wrong_price'])
    .withMessage('Invalid report type'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
    .customSanitizer(value => value.replace(/[<>]/g, '')),
  
  validate
];

// Provider creation validation
export const providerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Provider name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters')
    .customSanitizer(value => value.replace(/[<>]/g, '')),
  
  body('providerType')
    .optional()
    .isIn(['mess', 'tiffin', 'home_kitchen']).withMessage('Invalid provider type'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
    .customSanitizer(value => value.replace(/[<>]/g, '')),
  
  body('address.street')
    .trim()
    .notEmpty().withMessage('Street address is required'),
  
  body('address.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  
  body('address.state')
    .trim()
    .notEmpty().withMessage('State is required'),
  
  body('address.pincode')
    .trim()
    .notEmpty().withMessage('Pincode is required')
    .matches(/^[0-9]{6}$/).withMessage('Invalid pincode'),
  
  body('pricePerMeal')
    .notEmpty().withMessage('Price is required')
    .isInt({ min: 10, max: 500 }).withMessage('Price must be between ₹10 and ₹500'),
  
  body('mealTypes')
    .isArray().withMessage('Meal types must be an array')
    .custom(value => value.length > 0).withMessage('At least one meal type is required'),
  
  validate
];

// Pagination validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  validate
];
