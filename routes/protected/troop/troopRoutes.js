import express from 'express';
import findTroopController from '../../../controllers/protected/troop/findTroopController.js';
import addBaboonController from '../../../controllers/protected/troop/addBaboonController.js';
import troopChoiceController from '../../../controllers/protected/troop/troopChoiceController.js';

const router = express.Router();

router.get('/findtroop', findTroopController);
router.post('/addbaboon', addBaboonController);
router.post('/troopchoice', troopChoiceController);

const endpoints = ['/findtroop', '/addbaboon', '/troopchoice'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
