import express from 'express';
import { protect, attachHotelId, superAdminOnly, validateOwnership } from '../middlewares/authMiddleware.js';

import { getBill, updateBill, billPaid } from '../controllers/billController.js';

const router = express.Router();

router.get('/:billId', protect, validateOwnership, getBill);

// to clear bill 
router.put('/:billId', protect, validateOwnership, updateBill);

router.patch('/paid/:billId', protect, validateOwnership, billPaid);

export default router;
