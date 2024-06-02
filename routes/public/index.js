// routes/index.js
import publicRoutes from "./publicRoutes.js";
import router from "../../router.js";

router.use("/public", publicRoutes);

export default router;
