import express from 'express';
import addBagController from '../../../controllers/protected/bag/addBagController.js';

const router = express.Router();

router.post('/addbag', addBagController);

const endpoints = ['/addbag'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
