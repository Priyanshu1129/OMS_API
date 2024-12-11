import { attachHotelId, protect, superAdminOnly, validateOwnership } from "../middlewares/authMiddleware.js";
import {
    createOrder,
    onQRScan,
    updateOrder,
    deleteOrder,
    getOrdersByTable,
    getOrderById,
    updateBillByTable
} from '../controllers/orderController.js';
import express from 'express';

const router = express.Router();

// for customer 
router.get('/get-services', onQRScan);

// for customer and hotel owner 
router.post('/', createOrder);

// for hotel owner update customer order on request
router.put('/:orderId', protect, validateOwnership, updateOrder);

// for hotel owner delete customer order on request
router.delete('/:orderId', protect, validateOwnership, deleteOrder);

// for hotel owner list orders by table id
router.get('/get-customer-orders/:tableId', protect, validateOwnership, getOrdersByTable);

// for hotel owner 
router.get('/:orderId', protect, validateOwnership, getOrderById);

// for hotel owner to update bill by table id
router.put('/:tableId', protect, validateOwnership, updateBillByTable);


export default router;
