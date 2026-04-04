import express from 'express';
import {
  uploadMedia,
  getProviderMedia,
  verifyMedia,
  flagMedia,
  deleteMedia
} from '../controllers/mediaController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/provider/:providerId', getProviderMedia);

// Protected routes
router.use(protect);

// User upload
router.post('/', uploadMedia);
router.put('/:id/flag', flagMedia);
router.delete('/:id', deleteMedia);

// Admin only
router.put('/:id/verify', authorize('admin'), verifyMedia);

export default router;