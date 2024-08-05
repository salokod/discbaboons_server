// routes/index.js
import authRoutes from './authRoutes';
import { isAuthenticated } from '../../middleware/auth';
import router from '../../router';

router.use('/auth', isAuthenticated, authRoutes);

export default router;
