import express from 'express';
import {
  createReview,
  getReviewsByProvider,
  flagReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/provider/:providerId', getReviewsByProvider);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id/flag', protect, flagReview);

export default router;
