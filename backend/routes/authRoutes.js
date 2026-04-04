import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../config/rateLimit.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getCurrentUser);
router.put('/update-profile', updateProfile);

export default router;
