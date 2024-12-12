import express from 'express';
import { attachHotelId, protect, superAdminOnly, validateOwnership } from "../middlewares/authMiddleware.js";
import { getOfferDetails, updateOffer, deleteOffer, createOffer, getAllOffers } from "../controllers/offerController.js";


const router = express.Router();

router.get('/:id', protect, validateOwnership, getOfferDetails);

router.get('/', protect, attachHotelId, getAllOffers);

router.post('/', protect, createOffer);

router.put('/:id', protect, updateOffer);

router.delete('/:id', protect, deleteOffer);


export default router;
