import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  customerName: { type: String },
  orderIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  totalAmount: { type: Number, required: true },
  totalDiscount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true }, // After discount
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true }
}, { timestamps: true });

export default mongoose.model('Bill', billSchema);
