import express from 'express';
import { getUserProfile, updateProfile, deleteAllHistory } from '../controllers/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getUserProfile);
router.put('/', updateProfile);
router.delete('/history/all', deleteAllHistory);

export default router;
