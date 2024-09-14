import express from 'express';
import addRoundController from '../../../controllers/protected/rounds/addRoundController.js';
import deleteRoundController from '../../../controllers/protected/rounds/deleteRoundController.js';
import getRoundsController from '../../../controllers/protected/rounds/getRoundsController.js';
import submitRoundController from '../../../controllers/protected/rounds/submitRoundController.js';
import updateRoundController from '../../../controllers/protected/rounds/updateRoundController.js';

const router = express.Router();

router.post('/addround', addRoundController);
router.post('/deleteround', deleteRoundController);
router.post('/submitround', submitRoundController);
router.get('/getrounds', getRoundsController);
router.post('/updateround', updateRoundController);

const endpoints = ['/addround', '/deleteround', '/getrounds', '/submitround', '/updateround'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
