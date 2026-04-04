import express from 'express';
import {
  uploadHygieneProof,
  getHygieneProofs,
  verifyHygieneProof
} from '../controllers/hygieneController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/mess/:providerId', optionalAuth, getHygieneProofs);
router.post('/', protect, authorize('owner', 'admin'), uploadHygieneProof);
router.put('/:id/verify', protect, authorize('admin'), verifyHygieneProof);

export default router;
