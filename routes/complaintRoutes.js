import express from 'express';
import {
  createComplaint,
  resolveComplaint
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createComplaint);
router.put('/:id/resolve', authorize('owner', 'admin'), resolveComplaint);

export default router;