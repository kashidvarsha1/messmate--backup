// config/rateLimit.js
import rateLimit from 'express-rate-limit';
import logger from './logger.js';

const isDevelopment = process.env.NODE_ENV !== 'production';

// General API rate limiter (100 requests per 15 minutes, or unlimited in development)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 10000 : 100, // Much higher limit in development
  skip: (req, res) => isDevelopment, // Skip rate limiting in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(options.statusCode).json(options.message);
  }
});

// Auth endpoints limiter (5 attempts per 15 minutes)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      email: req.body.email,
      path: req.path
    });
    res.status(options.statusCode).json(options.message);
  }
});

// Provider update limiter (20 updates per hour)
export const providerUpdateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many status updates. Please wait before updating again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Provider update rate limit exceeded', {
      userId: req.user?.id,
      ip: req.ip,
      providerId: req.params.id
    });
    res.status(options.statusCode).json(options.message);
  }
});

// Review limiter (10 reviews per hour)
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many reviews. Please wait before submitting more.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Review rate limit exceeded', {
      userId: req.user?.id,
      ip: req.ip,
      providerId: req.body.providerId
    });
    res.status(options.statusCode).json(options.message);
  }
});

// Report limiter (5 reports per hour)
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many reports. Please wait before submitting more.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Report rate limit exceeded', {
      userId: req.user?.id,
      ip: req.ip,
      providerId: req.body.providerId
    });
    res.status(options.statusCode).json(options.message);
  }
});

// Upload limiter (20 uploads per hour)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many uploads. Please wait before uploading more files.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Upload rate limit exceeded', {
      userId: req.user?.id,
      ip: req.ip,
      path: req.path
    });
    res.status(options.statusCode).json(options.message);
  }
});
