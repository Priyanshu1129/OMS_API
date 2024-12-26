import express from 'express';
import { protect, attachHotelId, superAdminOnly, validateOwnership } from '../middlewares/authMiddleware.js';

import { getBill, updateBill, billPaid, getAllBills, deleteBill } from '../controllers/billController.js';

const router = express.Router();

router.get('/', protect, attachHotelId, getAllBills);

router.get('/:billId', protect, validateOwnership, getBill);

router.delete('/:billId', protect, validateOwnership, deleteBill);

router.put('/:billId', protect, validateOwnership, updateBill);

router.patch('/paid/:billId', protect, validateOwnership, billPaid);

export default router;
