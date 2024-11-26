import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { superAdminOnly } from '../middlewares/auth.middleware.js';
import {
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelById,
  getAllHotels
} from '../controllers/hotelController.js';

const router = express.Router();

// Route for HotelOwner to create their own hotel (no hotelId needed)
router.post('/hotel', protect, createHotel);

// Route to get a single hotel by ID (HotelOwner can only view their own hotel)
router.get('/hotel/:hotelId', protect, getHotelById);

// Route to update a hotel (SuperAdmin can update any hotel, HotelOwner can update only their own)
router.put('/hotel/:hotelId', protect, updateHotel);

// Route to delete a hotel (SuperAdmin can delete any hotel, HotelOwner can delete only their own)
router.delete('/hotel/:hotelId', protect, deleteHotel);

// Route to get all hotels (SuperAdmin only)
router.get('/hotels', protect, superAdminOnly, getAllHotels);

export default router;
