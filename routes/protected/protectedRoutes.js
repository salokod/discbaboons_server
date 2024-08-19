// routes/protectedRoutes.js
import router from '../../router.js';
import bagRoutes from './bag/bagRoutes.js';
import discRoutes from './discs/discRoutes.js';
import roundRoutes from './rounds/roundRoutes.js';

// More user routes...
router.use('/bag', bagRoutes);
router.use('/disc', discRoutes);
router.use('/round', roundRoutes);

export default router;
