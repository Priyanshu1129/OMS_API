import { attachHotelId, protect, superAdminOnly, validateOwnership } from "../middlewares/authMiddleware.js";
import express from 'express';
import { getTableById, getTables, createTable, updateTable, deleteTable, occupyTable, freeTable, getOrdersByTable, generateTableBill } from '../controllers/tableController.js';


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

// to generate table's bill
router.post('/:id', protect, validateOwnership, generateTableBill);

// for hotel owner list orders by table id
router.get('/get-customer-orders/:tableId', protect, validateOwnership, getOrdersByTable);


export default router;
