import express from 'express';
import {
  uploadHygieneProof,
  getHygieneProofs,
  verifyHygieneProof
} from '../controllers/hygieneController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('owner'), uploadHygieneProof);
router.get('/mess/:messId', getHygieneProofs);
router.put('/:id/verify', authorize('admin'), verifyHygieneProof);

export default router;