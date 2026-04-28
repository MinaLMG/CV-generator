import express from 'express';
import { signup, login } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

export default router;
