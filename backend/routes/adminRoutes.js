import express from 'express';
import {
  getStats,
  getAllUsers,
  adminGetAllSkills,
  adminCreateSkill,
  adminUpdateSkill,
  adminDeleteSkill
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticateToken, authorizeRole(['admin']));

router.get('/stats', getStats);
router.get('/users', getAllUsers);

router.get('/skills', adminGetAllSkills);
router.post('/skills', adminCreateSkill);
router.put('/skills/:id', adminUpdateSkill);
router.delete('/skills/:id', adminDeleteSkill);

export default router;
