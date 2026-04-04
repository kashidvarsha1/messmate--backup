import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getTrustDashboard,
  getTrustInsights,
  getTrustHistory,
  compareTrustScores
} from '../controllers/trustDashboardController.js';

const router = express.Router();

// All trust routes require authentication
router.use(protect);

// Get trust dashboard for a mess
router.get('/mess/:messId', getTrustDashboard);

// Get trust insights and recommendations
router.get('/mess/:messId/insights', getTrustInsights);

// Get trust history timeline
router.get('/mess/:messId/history', getTrustHistory);

// Compare trust scores of multiple messes
router.get('/compare', compareTrustScores);

export default router;
