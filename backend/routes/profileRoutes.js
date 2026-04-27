import express from 'express';
import { getProfileStatus, getCompleteProfile, updateProfileDetails } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken); // Protect all routes in this file

router.get('/status', getProfileStatus);
router.get('/me', getCompleteProfile);
router.put('/me', updateProfileDetails);

export default router;
