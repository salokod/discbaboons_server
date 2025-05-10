import express from 'express';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

// Define auth routes
router.get('/helloworld', authController.helloWorld);

// Future auth routes will go here
// router.post('/login', authController.login);
// router.post('/register', authController.register);

export default router;
