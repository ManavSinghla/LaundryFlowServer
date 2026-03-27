const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemType: { type: String, required: true }, // Shirt, Pant, Saree, etc.
  quantity: { type: Number, required: true, min: 1 },
  pricePerItem: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Received', 'Washing', 'Ready', 'Delivered'], 
    default: 'Received' 
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
