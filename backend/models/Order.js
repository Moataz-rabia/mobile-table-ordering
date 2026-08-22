import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'IN_PREPARATION', 'READY', 'SERVED', 'CANCELLED'], 
    default: 'PENDING' 
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);