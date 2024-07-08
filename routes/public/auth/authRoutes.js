import loginController from "../../../controllers/public/loginController.js";
import registerController from "../../../controllers/public/registerController.js";
import forgotUsernameController from "../../../controllers/public/forgotUsernameController.js";
import forgotPasswordController from "../../../controllers/public/forgotPasswordController.js";

import express from "express";
const router = express.Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/forgotuser", forgotUsernameController);
router.post("/forgotpassword", forgotPasswordController);

router.all("/login", (req, res) => {
  return res.status(405).json({ message: "Method Not Allowed" });
});

export default router;
