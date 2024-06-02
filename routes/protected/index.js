// routes/index.js
import authRoutes from "./authRoutes.js";
import { isAuthenticated } from "../../middleware/auth.js";
import router from "../../router.js";

router.use("/auth", isAuthenticated, authRoutes);

export default router;
