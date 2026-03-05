import express from 'express';
import { getDashboardAnalytics } from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authMiddleware);

// @route   GET /api/dashboard/analytics
// @desc    Get comprehensive dashboard analytics
// @access  Private (Teacher)
router.get('/analytics', getDashboardAnalytics);

export default router;
