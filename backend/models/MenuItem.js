import mongoose from 'mongoose';

const optionChoiceSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Oat Milk"
  extraPrice: { type: Number, default: 0 }  // e.g. 0.50
});

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Milk Choice"
  choices: [optionChoiceSchema]
});

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // "Coffee", "Tea", "Pastry"
  price: { type: Number, required: true },
  description: { type: String },
  imageUrl: { type: String },
  isAvailable: { type: Boolean, default: true },
  options: [optionSchema]
});

export default mongoose.model('MenuItem', menuItemSchema);