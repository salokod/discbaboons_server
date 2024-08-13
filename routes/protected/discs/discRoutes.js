import express from 'express';
import addDiscController from '../../../controllers/protected/discs/addDiscController.js';

const router = express.Router();

router.post('/adddisc', addDiscController);

const endpoints = ['/addbag'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
