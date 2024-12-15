import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  appliedOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dish' }],
  type: { type: String, enum: ['specific', 'global'], required: true },
  discountType: { type: String, enum: ['percent', 'amount'], required: true },
  value: { type: Number, required: true, min: 0 },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  appliedAbove: {
    type: Number,
    min: 0,
    validate: {
      validator: function (value) {
        // If type is 'specific', appliedAbove must not exist
        if (this.type === 'specific' && value != null) {
          return false;
        }
        // If type is 'global', appliedAbove is allowed but not required
        return true;
      },
      message: function (props) {
        if (this.type === 'specific') {
          return 'appliedAbove must not be provided for specific offers!';
        }
        return 'Invalid appliedAbove configuration!';
      }
    }
  },
  disable: { type: Boolean, default: false },
  startDate: { type: Date, default: Date.now, required: true },
  endDate: {
    type: Date,
    default: () => new Date(Date.now() + (30 * 6) * 24 * 60 * 60 * 1000),
    required: true
  },
  description : {type : String, default : ""}
}, { timestamps: true });

export default mongoose.model('Offer', offerSchema);
