const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Helper middleware for Auth (to be implemented more globally later)
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/customers
router.get('/', protect, async (req, res) => {
  try {
    // Optional search by phone
    const { phone } = req.query;
    const filter = phone ? { phone: { $regex: phone, $options: 'i' } } : {};
    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/customers
router.post('/', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const customerExists = await Customer.findOne({ phone });
    if (customerExists) {
      return res.status(400).json({ message: 'Customer with this phone already exists' });
    }
    const customer = await Customer.create({ name, phone, address });
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/customers/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
