// routes/index.js
import express from 'express';
import publicRoutes from './public/index.js';
import authRoutes from './public/auth/authRoutes.js';
import protectedRoutes from './protected/protectedRoutes.js';

import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.use('/protected', isAuthenticated, protectedRoutes);
router.use('/public', publicRoutes);
router.use('/public/auth', authRoutes);

export default router;
