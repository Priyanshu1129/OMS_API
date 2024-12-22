import express from 'express'
import { getHotelCategories, getHotelDishes, getHotelOffers, getHotelTable, getTableOrders } from '../controllers/customerController.js';
const customerRouter = express.Router();

customerRouter.get('/dishes/:hotelId', getHotelDishes )
customerRouter.get('/categories/:hotelId', getHotelCategories )
customerRouter.get('/table/:tableId', getHotelTable )
customerRouter.get('/offers/:hotelId', getHotelOffers )
customerRouter.get('/orders/:tableId',  getTableOrders)

export default customerRouter;