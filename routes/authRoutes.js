import express from 'express';
import { signup, login, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /register - User registration
router.post('/register', signup);

// POST /login - User login
router.post('/login', login);

// GET /me - Get current user (protected route)
router.get('/me', protect, getCurrentUser);

export default router;
