import { attachHotelId, protect, superAdminOnly, validateOwnership } from "../middlewares/authMiddleware.js";
import {
    createOrder,
    onQRScan,
    updateOrder,
    deleteOrder,
    getOrderById,
    getOrderDetails,
    publishOrder,
    getAllOrders,
    updateStatus,
    updateOrderByOwner,
    getTableOrders
} from '../controllers/orderController.js';
import express from 'express';

const router = express.Router();

// for customer on scanning QR
router.get('/', getAllOrders)
router.get('/qr-scan/:hotelId/:tableId', onQRScan);

// Table orders
router.get('/table/:tableId', getTableOrders)

router.post('/publish/:orderId', publishOrder);

// for customer and hotel owner 
router.post('/:hotelId/:tableId', createOrder);

// for hotel owner update to update order on customer's order on request
router.put('/:orderId', protect, validateOwnership, updateOrder);

//for update order by owner
router.put('/owner/:orderId', protect, validateOwnership, updateOrderByOwner);

// for updating order status
router.patch('/:orderId/:status', protect, validateOwnership, updateStatus);

// for hotel owner to fetch order by id

// router.get('/:orderId', protect, validateOwnership, getOrderById);
router.get('/:orderId', getOrderById);

// for hotel owner delete customer order on request
router.delete('/:orderId', protect, validateOwnership, deleteOrder);

router.get('/details/:orderId', getOrderDetails);




export default router;
