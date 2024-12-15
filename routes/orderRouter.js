import { attachHotelId, protect, superAdminOnly, validateOwnership } from "../middlewares/authMiddleware.js";
import {
    createOrder,
    onQRScan,
    updateOrder,
    deleteOrder,
    getOrderById,
    getOrderDetails,
    publishOrder
} from '../controllers/orderController.js';
import express from 'express';

const router = express.Router();

// for customer on scanning QR
router.get('/get-services/:hotelId/:tableId', onQRScan);

// for customer and hotel owner 
router.post('/:hotelId/:tableId', createOrder);

// for hotel owner update to update order on customer's order on request
router.put('/:orderId', protect, validateOwnership, updateOrder);

// for hotel owner to fetch order by id
// router.get('/:orderId', protect, validateOwnership, getOrderById);
router.get('/:orderId', getOrderById);


// for hotel owner delete customer order on request
router.delete('/:orderId', protect, validateOwnership, deleteOrder);

router.get('/details/:orderId', getOrderDetails);

router.post('/publish/:orderId', publishOrder);

export default router;
