import express from 'express';
import addRoundController from '../../../controllers/protected/rounds/addRoundController.js';
import deleteRoundController from '../../../controllers/protected/rounds/deleteRoundController.js';

const router = express.Router();

router.post('/addround', addRoundController);
router.post('/deleteround', deleteRoundController);

const endpoints = ['/addround', '/deleteround'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
