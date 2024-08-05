// routes/index.js
import express from 'express';
import publicRoutes from './public/index';
import authRoutes from './public/auth/authRoutes';
import bagRoutes from './protected/bag/bagRoutes';

import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.use('/protected/bag', isAuthenticated, bagRoutes);
router.use('/public', publicRoutes);
router.use('/public/auth', authRoutes);

export default router;
