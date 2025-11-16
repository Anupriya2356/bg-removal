import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import userRouter from './routes/userRoutes.js';
import authRouter from './routes/authRoutes.js';
import imageRouter from './routes/imageRoutes.js';

// App Config
const PORT = process.env.PORT || 4000;
const app = express();

// Connect to MongoDB
await connectDB();

// Initialize Middleware
app.use(express.json());

// CORS (allow all origins)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// API routes
app.get('/', (req, res) => res.send('API Working'));

// Auth routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
