import addBagController from "../../../controllers/protected/bag/addBagController.js";

import express from "express";
const router = express.Router();

router.post("/addbag", addBagController);

const endpoints = ["/addbag"];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => {
    return res.status(405).json({ message: "Method Not Allowed" });
  });
});

export default router;
