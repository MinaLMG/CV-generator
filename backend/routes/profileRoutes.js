import express from 'express';
import { getProfileStatus } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/status', authenticateToken, getProfileStatus);

export default router;
