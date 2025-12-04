import express from 'express';
import {
  generateTest,
  getTest,
  getTeacherTests,
  deleteTest,
  submitTest,
  getResult,
  getTestResults,
  getTestWithAnswers,
  publishTest,
  getTestPreview,
  linkTestToClassroom,
  getTestAnalytics,
} from '../controllers/testController.js';
import {
  generateTestRequest,
  getTestByCode,
  getQuotaStatus,
} from '../controllers/generationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no auth needed)
router.get('/code/:testCode', getTestByCode);

// Private routes (require auth)
router.use(authMiddleware);

// Quota check endpoint
router.get('/quota', getQuotaStatus);

// NEW: Instant generation endpoint (no polling needed)
router.post('/generate', generateTestRequest);

// Results routes (more specific routes first)
router.post('/submit', submitTest);
router.get('/result/:resultId', getResult);
router.get('/test/:testCode/results', getTestResults);
router.get('/test/:testCode/full', getTestWithAnswers);

// Original endpoints (specific routes before generic :testId routes)
router.get('/my-tests', getTeacherTests);
router.get('/:testId/preview', getTestPreview);
router.get('/:testId/analytics', getTestAnalytics);
router.put('/:testId/publish', publishTest);
router.put('/:testId/link-classroom', linkTestToClassroom);
router.delete('/:testId', deleteTest);
router.get('/:testId', getTest);

export default router;

