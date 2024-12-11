import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  dishes: [{
    dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
    quantity: { type: Number, required: true },
    note: { type: String }
  }],
  status: { type: String, enum: ['pending', 'preparing', 'completed', 'cancelled'], default: 'pending' },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  note: { type: String }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
