// routes/index.js
import publicRoutes from "./public/index.js";
import authRoutes from "./public/auth/authRoutes.js";
import bagRoutes from "./protected/bag/bagRoutes.js";

import { isAuthenticated } from "../middleware/auth.js";
import express from "express";
const router = express.Router();

router.use("/protected/bag", isAuthenticated, bagRoutes);
router.use("/public", publicRoutes);
router.use("/public/auth", authRoutes);

export default router;
