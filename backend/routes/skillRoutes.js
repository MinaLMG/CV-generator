import express from 'express';
import {
  getAllSkills,
  createSkill,
  getProfileSkills,
  addSkillToProfile,
  updateSkillProficiency,
  removeSkillFromProfile
} from '../controllers/skillController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Global skills — only admin can create new skills
router.get('/', getAllSkills);
router.post('/', authorizeRole(['admin']), createSkill);

// Profile skills — any authenticated user
router.get('/profile', getProfileSkills);
router.post('/profile', addSkillToProfile);
router.patch('/profile/:id', updateSkillProficiency);
router.delete('/profile/:id', removeSkillFromProfile);

export default router;

