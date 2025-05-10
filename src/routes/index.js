import express from 'express';
import authRoutes from './auth.routes.js';

const router = express.Router();

// Mount route modules
router.use('/auth', authRoutes);

// Add more route modules as needed
// router.use('/rounds', roundsRoutes);
// router.use('/users', userRoutes);

export default router;
