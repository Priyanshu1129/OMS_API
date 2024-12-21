import express from 'express'
import { getHotelCategories, getHotelDishes, getHotelOffers, getHotelTable } from '../controllers/customerController.js';
const customerRouter = express.Router();

customerRouter.get('/dishes/:hotelId', getHotelDishes )
customerRouter.get('/categories/:hotelId', getHotelCategories )
customerRouter.get('/table/:tableId', getHotelTable )
customerRouter.get('/offers/:hotelId', getHotelOffers )

export default customerRouter;