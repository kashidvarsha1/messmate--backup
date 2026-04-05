import express from 'express';
import {
  submitFeedback,
  getAllFeedback,
  getFeedbackStats,
  deleteFeedback
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Submit feedback - authenticated users only
router.post('/', protect, submitFeedback);

// Delete feedback - admin only
router.delete('/:id', protect, deleteFeedback);

// Get feedback statistics - admin only (must be before GET /)
router.get('/stats', protect, getFeedbackStats);

// Get all feedback - admin only
router.get('/', protect, getAllFeedback);

export default router;
