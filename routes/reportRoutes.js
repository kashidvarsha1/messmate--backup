import express from 'express';
import {
  createReport,
  getReportsByProvider,
  resolveReport
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.use(protect);

// User can create report
router.post('/', createReport);

// Admin only routes
router.get('/provider/:providerId', authorize('admin'), getReportsByProvider);
router.put('/:id/resolve', authorize('admin'), resolveReport);

export default router;
