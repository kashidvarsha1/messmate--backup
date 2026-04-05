import express from 'express';
import { submitFeedback, getFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, submitFeedback);
router.get('/', getFeedback);

export default router;