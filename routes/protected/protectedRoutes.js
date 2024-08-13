// routes/protectedRoutes.js
import router from '../../router.js';
import bagRoutes from './bag/bagRoutes.js';
import discRoutes from './discs/discRoutes.js';

// More user routes...
router.use('/bag', bagRoutes);
router.use('/disc', discRoutes);

export default router;
