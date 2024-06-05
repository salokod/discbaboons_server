// routes/index.js
import protectedRoutes from "./protected/index.js";
import publicRoutes from "./public/index.js";
import authRoutes from "./public/auth/authRoutes.js";
import { isAuthenticated } from "../middleware/auth.js";
import express from "express";
const router = express.Router();

router.use("/secure", isAuthenticated, protectedRoutes);
router.use("/public", publicRoutes);
router.use("/public/auth", authRoutes);

export default router;
