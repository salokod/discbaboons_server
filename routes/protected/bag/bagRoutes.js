import express from 'express';
import addBagController from '../../../controllers/protected/bag/addBagController.js';
import deleteBagController from '../../../controllers/protected/bag/deleteBagController.js';
import editBagController from '../../../controllers/protected/bag/editBagController.js';
import findAllBagController from '../../../controllers/protected/bag/findAllBagController.js';

const router = express.Router();

router.post('/addbag', addBagController);
router.post('/deletebag', deleteBagController);
router.post('/editbag', editBagController);
router.get('/findallbags', findAllBagController);

const endpoints = ['/addbag'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
