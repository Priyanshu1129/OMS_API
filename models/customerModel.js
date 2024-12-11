import mongoose from 'mongoose';

// Base schema for all customers
const customerBaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
}, {
  timestamps: true,
});

export default mongoose.model('Customer', customerBaseSchema);



