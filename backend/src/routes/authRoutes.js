import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  getUserByHandle,
  verifyOTP,
  resendOTP,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/users/:handle', getUserByHandle);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);

export default router;