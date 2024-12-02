import { protect,superAdminOnly, validateOwnership } from "../middlewares/authMiddleware.js";
import express from 'express';
import { getTableById, getTables, createTable, updateTable, deleteTable, occupyTable, freeTable } from '../controllers/tableController.js';

const router = express.Router();

router.get('/table/:id', protect,validateOwnership, getTableById);

router.get('/tables', protect, getTables);

router.post('/table', protect, createTable);

router.put('/table/:id', protect, updateTable);

router.delete('/table/:id', protect, deleteTable);

//occupy table
// router.put('/table-occupy/:id', protect,occupyTable);

// //free table
// router.put('/table-free/:id', protect,freeTable);


export default router;
