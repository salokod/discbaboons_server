import express from 'express';
import { helloWorld } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/helloworld', helloWorld);

export default router;
