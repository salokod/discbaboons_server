import express from 'express';
import findTroopController from '../../../controllers/protected/troop/findTroopController.js';

const router = express.Router();

router.get('/findtroop', findTroopController);

const endpoints = ['/findtroop'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
