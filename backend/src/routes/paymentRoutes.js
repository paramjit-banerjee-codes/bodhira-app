import express from 'express';
import {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getSubscription,
  getFreeTests,
} from '../controllers/paymentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All payment routes require authentication
router.use(authMiddleware);

// Create a new order for subscription
router.post('/create-order', createOrder);

// Verify payment signature and create/extend subscription
router.post('/verify-payment', verifyPayment);

// Get current subscription status
router.get('/subscription', getSubscription);

// Get free tests remaining
router.get('/free-tests', getFreeTests);

// Get payment history
router.get('/history', getPaymentHistory);

export default router;
