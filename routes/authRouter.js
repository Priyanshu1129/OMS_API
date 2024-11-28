import express from 'express';
import { signUp, login } from '../controllers/authController.js';
import { protect, superAdminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/login', login);

export default router;
