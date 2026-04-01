const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/services
router.get('/', protect, async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/services
router.post('/', protect, async (req, res) => {
  try {
    const { name, price } = req.body;
    const serviceExists = await Service.findOne({ name });
    
    if (serviceExists) {
      return res.status(400).json({ message: 'Service with this name already exists' });
    }

    const service = await Service.create({ name, price });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/services/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
