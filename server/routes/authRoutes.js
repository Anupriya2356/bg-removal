import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authUser } from '../middleware/jwtAuth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/me', authUser, getMe);

export default router;
