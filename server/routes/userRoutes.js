import express from 'express';
import { getUserCredits, updateProfile } from '../controllers/userController.js';
import { authUser } from '../middleware/jwtAuth.js';

const userRouter = express.Router();

// Protected routes (require authentication)
userRouter.use(authUser);

// Get user credits
userRouter.get('/credits', getUserCredits);

// Update user profile
userRouter.put('/profile', updateProfile);

export default userRouter