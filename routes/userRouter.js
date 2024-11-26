import express from 'express';
import {
  signUp,
  login,
  getUserProfile,
  approveHotelOwner,
  getAllHotels,
  getPendingHotels,
  getApprovedHotels,
} from '../controllers/userController.js';
import { protect, superAdminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getUserProfile);

// SuperAdmin-only routes
router.patch('/approve-hotelowner/:ownerId', protect, superAdminOnly, approveHotelOwner);
router.get('/hotels', protect, superAdminOnly, getAllHotels);
router.get('/hotels/pending', protect, superAdminOnly, getPendingHotels);
router.get('/hotels/approved', protect, superAdminOnly, getApprovedHotels);

export default router;
