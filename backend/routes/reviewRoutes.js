import express from 'express';
import {
  createReview,
  getReviewsByProvider,
  flagReview
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import { reviewLimiter } from '../config/rateLimit.js';
import { reviewValidation } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/provider/:providerId', getReviewsByProvider);

// Protected routes
router.post('/', protect, authorize('customer'), reviewLimiter, reviewValidation, createReview);
router.put('/:id/flag', protect, flagReview);

export default router;
