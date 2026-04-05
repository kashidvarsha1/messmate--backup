import express from 'express';
import {
  createReport,
  getMyReports,
  getProviderReports,
  getPublicProviderReports,
  getAllReports,
  verifyReport
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';
import { reportLimiter } from '../config/rateLimit.js';

const router = express.Router();

// ✅ PUBLIC route — anyone can see complaint count for a provider
router.get('/provider/:providerId/public', getPublicProviderReports);

// Protected routes
router.use(protect);

// User can create report and see their own reports
router.post('/', authorize('customer'), reportLimiter, createReport);
router.get('/my', getMyReports);

// Owner/Admin routes
router.get('/provider/:providerId', authorize('owner', 'admin'), getProviderReports);

// Admin only routes
router.get('/admin/all', authorize('admin'), getAllReports);
router.put('/:id/verify', authorize('admin'), verifyReport);

export default router;
