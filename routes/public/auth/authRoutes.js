import express from 'express';
import loginController from '../../../controllers/public/loginController';
import registerController from '../../../controllers/public/registerController';
import forgotUsernameController from '../../../controllers/public/forgotUsernameController';
import forgotPasswordController from '../../../controllers/public/forgotPasswordController';
import validateResetTokenController from '../../../controllers/public/validateResetTokenController';
import changePasswordController from '../../../controllers/public/changePasswordController';

const router = express.Router();

router.post('/login', loginController);
router.post('/register', registerController);
router.post('/forgotuser', forgotUsernameController);
router.post('/forgotpassword', forgotPasswordController);
router.post('/validatereset', validateResetTokenController);
router.post('/changepass', changePasswordController);

const endpoints = ['/login', '/register', '/forgotuser', '/forgotpassword', '/validatereset', '/changepass'];

endpoints.forEach((endpoint) => {
  router.all(endpoint, (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
});

export default router;
