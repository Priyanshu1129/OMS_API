import express from 'express';
import { signUp, login, verifyEmail, resendOtp } from '../controllers/authController.js';
// import { protect, superAdminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout');
router.post('/verify', verifyEmail);
router.post('/resend-otp', resendOtp);

export default router;
