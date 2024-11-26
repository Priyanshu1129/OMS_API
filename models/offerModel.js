import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  appliedOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dish' }], 
  type: { type: String, enum: ['specific', 'global'], required: true }, 
  discountType: { type: String, enum: ['percent', 'amount'], required: true },
  value: { type: Number, required: true }, 
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }
}, { timestamps: true });

export default mongoose.model('Offer', offerSchema);
