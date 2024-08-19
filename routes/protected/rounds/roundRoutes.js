import express from 'express';
import addRoundController from '../../../controllers/protected/rounds/addRoundController.js';

const router = express.Router();

router.post('/addround', addRoundController);

const endpoints = ['/addround'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
