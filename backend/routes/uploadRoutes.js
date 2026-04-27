import express from 'express';
import { uploadProfilePhoto } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../config/uploadConfig.js';



const router = express.Router();

router.use(authenticateToken);

// Expects a form field named 'photo'
router.post('/photo', upload.fields([
    { name: 'photo', maxCount: 1 },
]), uploadProfilePhoto);

export default router;
