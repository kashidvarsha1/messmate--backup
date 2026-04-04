import express from 'express';
import {
  getProviders,
  getProviderById,
  updateProviderStatus,
  updateMenu,
  createMess,
  getNearbyProviders
} from '../controllers/providerController.js';
import { protect, authorize } from '../middleware/auth.js';
import { providerUpdateLimiter } from '../config/rateLimit.js';

const router = express.Router();

// Public routes
router.get('/', getProviders);
router.get('/nearby', getNearbyProviders);
router.get('/:id', getProviderById);

// Protected routes - Owner only
router.post('/', protect, authorize('owner'), createMess);
router.put('/:id/menu', protect, authorize('owner', 'admin'), updateMenu);
router.put('/:id/status', protect, authorize('owner', 'admin'), providerUpdateLimiter, updateProviderStatus);

export default router;

