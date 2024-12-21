import { attachHotelId, protect, superAdminOnly, validateOwnership } from "../middlewares/authMiddleware.js";
import express from 'express';
import { getTableById, getTables, createTable, updateTable, deleteTable, getOrdersByTable, generateTableBill, deleteTableOrders, getCustomerDetails } from '../controllers/tableController.js';


const router = express.Router();

router.get('/:id', protect, validateOwnership, getTableById);

router.get('/', protect, attachHotelId, getTables);

router.post('/', protect, createTable);

router.put('/:id', protect, updateTable);

router.delete('/:id', protect, deleteTable);


// to generate table's bill
router.get('/bill/:tableId', protect, validateOwnership, generateTableBill);

// for hotel owner list orders by table id
router.get('/table/:tableId', protect, validateOwnership, getOrdersByTable);

// To delete all the orders of table 
router.delete('/delete-orders/:tableId', protect, validateOwnership, deleteTableOrders)

// get table customer details
router.get('/get-customer/:tableId', protect, validateOwnership, getCustomerDetails)

export default router;
