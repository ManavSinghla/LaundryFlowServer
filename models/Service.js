const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
