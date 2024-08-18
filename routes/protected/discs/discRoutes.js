import express from 'express';
import addDiscController from '../../../controllers/protected/discs/addDiscController.js';
import editDiscController from '../../../controllers/protected/discs/editDiscController.js';
import findAllDiscsController from '../../../controllers/protected/discs/findAllDiscsController.js';
import getDiscsFromDatabaseController from '../../../controllers/protected/discs/getDiscsFromDatabaseController.js';
import removeDiscsController from '../../../controllers/protected/discs/removeDiscsController.js';
import sendToNewBagController from '../../../controllers/protected/discs/sendToNewBagController.js';

const router = express.Router();

router.post('/adddisc', addDiscController);
router.post('/editdisc', editDiscController);
router.get('/findalldiscs', findAllDiscsController);
router.get('/getdiscsfromdatabase', getDiscsFromDatabaseController);
router.post('/removediscs', removeDiscsController);
router.post('/sendtonewbag', sendToNewBagController);

const endpoints = ['/adddisc', 'editdisc', 'findalldiscs', 'getdiscsfromdatabase', 'removediscs', 'sendtonewbag'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
