import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, required: true },
  orderedItems: [{
    dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  totalDiscount: { type: Number, default: 0 },
  status: { type: String, enum: ['paid', 'unpaid', 'payLater'], default: 'unpaid' },
  finalAmount: { type: Number, required: true }, // After discount
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true }
}, { timestamps: true });

export default mongoose.model('Bill', billSchema);