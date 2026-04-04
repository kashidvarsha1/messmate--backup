import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getAllProviders,
  getAllComplaints,
  toggleUserStatus
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/providers', getAllProviders);
router.get('/complaints', getAllComplaints);

export default router;
