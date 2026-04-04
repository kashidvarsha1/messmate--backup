import express from 'express';
import {
  getMesses,
  getMessById,
  createMess,
  updateMess,
  deleteMess
} from '../controllers/messController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getMesses);
router.get('/:id', getMessById);

// Protected routes
router.use(protect);
router.post('/', authorize('owner'), createMess);
router.put('/:id', authorize('owner'), updateMess);
router.delete('/:id', authorize('owner', 'admin'), deleteMess);

export default router;
