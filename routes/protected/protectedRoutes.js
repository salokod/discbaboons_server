// routes/protectedRoutes.js
import router from '../../router.js';
import bagRoutes from './bag/bagRoutes.js';

// More user routes...
router.use('/bag', bagRoutes);

export default router;
