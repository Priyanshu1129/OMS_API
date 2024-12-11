import { attachHotelId, protect, superAdminOnly, validateOwnership } from "../middlewares/authMiddleware.js";
import express from 'express';
import { getTableById, getTables, createTable, updateTable, deleteTable, occupyTable, freeTable } from '../controllers/tableController.js';

const router = express.Router();

router.get('/:id', protect, validateOwnership, getTableById);

router.get('/', protect, attachHotelId, getTables);

router.post('/', protect, createTable);

router.put('/:id', protect, updateTable);

router.delete('/:id', protect, deleteTable);

//occupy table
// router.put('/table-occupy/:id', protect,occupyTable);

// //free table
// router.put('/table-free/:id', protect,freeTable);


export default router;
