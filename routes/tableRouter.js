import { attachHotelId, protect, superAdminOnly, validateOwnership } from "../middlewares/authMiddleware.js";
import express from 'express';
import { getTableById, getTables, createTable, updateTable, deleteTable, getOrdersByTable, generateTableBill, getCustomerDetails } from '../controllers/tableController.js';


const router = express.Router();

<<<<<<< HEAD
=======
router.get('/:id', protect, getTableById);

>>>>>>> 8274f71185ae61b7c6f50b040da2f96ec9284500
router.get('/', protect, attachHotelId, getTables);
router.post('/', protect, createTable);
router.get('/bill/:tableId', protect, validateOwnership, generateTableBill);
router.get('/table/:tableId', protect, validateOwnership, getOrdersByTable); 
router.get('/get-customer/:tableId', protect, validateOwnership, getCustomerDetails)


router.get('/:id', protect, validateOwnership, getTableById);

router.put('/:tableId', protect, updateTable);

router.delete('/:id', protect, deleteTable);


export default router;
