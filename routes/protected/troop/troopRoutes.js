import express from 'express';
import findTroopController from '../../../controllers/protected/troop/findTroopController.js';
import addBaboonController from '../../../controllers/protected/troop/addBaboonController.js';

const router = express.Router();

router.get('/findtroop', findTroopController);
router.post('/addbaboon', addBaboonController);

const endpoints = ['/findtroop', '/addbaboon'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
