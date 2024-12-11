import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  description: { type: String },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }
}, { timestamps: true });

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String },
  description: { type: String },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }
})

const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // Trims whitespace
      minlength: 3, // Ensures the name is at least 3 characters
      maxlength: 100, // Ensures the name is not too long
    },
    appliedOffer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', default: null },
    quantity: {
      type: Number,
      default: 1,
      min: 1, // Ensure quantity is at least 1
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Ensures price is not negative
    },
    preparationTime: {
      type: String,
      validate: {
        validator: function (v) {
          // Custom validation for preparationTime (could be in 'XX minutes' format)
          return /\d+\s*(minutes?|mins?)/i.test(v);
        },
        message: 'Preparation time should be in the format: "XX minutes" or "XX mins"',
      },
    },
    description: {
      type: String,
      trim: true, // Trims any leading/trailing whitespace
      maxlength: 500, // Optional: limit description length
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        // required: true,
      },
    ],
    ingredients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
        // required: true, // Making ingredients mandatory
      },
    ],
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
  },
  { timestamps: true }
);



export const Category = mongoose.model('Category', categorySchema);
export const Ingredient = mongoose.model('Ingredient', ingredientSchema);
export const Dish = mongoose.model('Dish', dishSchema);
