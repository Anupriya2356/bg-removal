import express from 'express';
import { removeBgImage } from '../controllers/ImageController.js';
import upload from '../middleware/multer.js';
import { authUser } from '../middleware/jwtAuth.js';

const router = express.Router();

// Protected route (requires authentication)
router.post('/remove-bg', authUser, upload.single('image'), removeBgImage);

export default router;