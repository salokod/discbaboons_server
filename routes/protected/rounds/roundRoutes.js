import express from 'express';
import addRoundController from '../../../controllers/protected/rounds/addRoundController.js';
import deleteRoundController from '../../../controllers/protected/rounds/deleteRoundController.js';
import getRoundsController from '../../../controllers/protected/rounds/getRoundsController.js';

const router = express.Router();

router.post('/addround', addRoundController);
router.post('/deleteround', deleteRoundController);
router.get('/getrounds', getRoundsController);

const endpoints = ['/addround', '/deleteround', '/getrounds'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
