import express from 'express';
import addDiscController from '../../../controllers/protected/discs/addDiscController.js';
import editDiscController from '../../../controllers/protected/discs/editDiscController.js';
import findAllDiscsController from '../../../controllers/protected/discs/findAllDiscsController.js';

const router = express.Router();

router.post('/adddisc', addDiscController);
router.post('/editdisc', editDiscController);
router.get('/findalldiscs', findAllDiscsController);

const endpoints = ['/adddisc', 'editdisc', 'findalldiscs'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
