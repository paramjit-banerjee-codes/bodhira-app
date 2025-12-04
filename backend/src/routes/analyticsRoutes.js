import express from 'express';
import requireAuth from '../middleware/authMiddleware.js';
import analyticsController from '../controllers/analyticsController.js';

const router = express.Router({ mergeParams: true });

// Protect analytics routes (requires auth)
router.use(requireAuth);

// GET /api/classrooms/:id/analytics/overview
router.get('/overview', analyticsController.overview);

// Student analytics
// GET /api/classrooms/:id/analytics/students
router.get('/students', analyticsController.students);

// GET /api/classrooms/:id/analytics/students/:studentId/history
router.get('/students/:studentId/history', analyticsController.studentHistory);

export default router;
