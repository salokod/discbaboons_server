// routes/index.js
import protectedRoutes from "./protected/index.js";
import publicRoutes from "./public/index.js";
import { isAuthenticated } from "../middleware/auth.js";
import router from "../router.js";

router.use("/secure", isAuthenticated, protectedRoutes);
router.use("/public", publicRoutes);

export default router;
