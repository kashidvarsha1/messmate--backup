import express from 'express';
import {
  getProviders,
  getProviderById,
  updateProviderStatus
} from '../controllers/providerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProviders);
router.get('/:id', getProviderById);
router.put('/:id/status', protect, authorize('owner'), updateProviderStatus);

export default router;
