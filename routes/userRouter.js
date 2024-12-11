import express from 'express';
import {
  getUserProfile,
  approveHotelOwner,
  getAllHotelOwners,
  getUnApprovedOwners,
  getApprovedOwners,
  membershipExtender,
  deleteHotelOwner
} from '../controllers/userController.js';
import { protect, superAdminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes
router.get('/profile', protect, getUserProfile);

// SuperAdmin-only routes
router.patch('/approve-hotel-owner/:ownerId', protect, superAdminOnly, approveHotelOwner);
router.get('/hotel-owners', protect, superAdminOnly, getAllHotelOwners);
router.delete('/hotel-owner/:ownerId', protect, superAdminOnly, deleteHotelOwner);
router.get('/hotel-owners/pending-approval', protect, superAdminOnly, getUnApprovedOwners);
router.get('/hotel-owners/approved', protect, superAdminOnly, getApprovedOwners);

router.patch('/membership-extender/:hotelOwnerId', protect, superAdminOnly, membershipExtender);

export default router;
