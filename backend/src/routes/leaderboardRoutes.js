import express from 'express';
import { getLeaderboardByCode, getTopicLeaderboard } from '../controllers/leaderboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Public leaderboard by test code
router.get('/code/:testCode', getLeaderboardByCode);

// Private leaderboard by topic
router.use(authMiddleware);
router.get('/topic/:topic', getTopicLeaderboard);

export default router;
