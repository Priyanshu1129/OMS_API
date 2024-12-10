import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String }, 
  description: { type: String },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }
}, { timestamps: true });

const ingredientSchema = new mongoose.Schema({
  name: {type: String, required: true},
  logo : {type: String},
  description: {type: String},
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }
})

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  price: { type: Number, required: true },
  preparationTime: { type: Number }, 
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  ingredients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' }], 
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true }
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema);
export const Ingredient = mongoose.model('Ingredient', ingredientSchema);
export const Dish = mongoose.model('Dish', dishSchema);
