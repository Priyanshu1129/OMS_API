import express from 'express';
import { protect, attachHotelId, superAdminOnly, validateOwnership } from '../middlewares/authMiddleware.js';

import { getBill, updateBill } from '../controllers/billController.js';

const router = express.Router();

router.get('/:billId', protect, validateOwnership, getBill);

// to clear bill 
router.put('/:billId', protect, validateOwnership, updateBill);


export default router;
