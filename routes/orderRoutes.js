const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/authMiddleware');
const sendSMS = require('../utils/sendSMS');

// Generate unique order ID
const generateOrderId = async () => {
  const count = await Order.countDocuments();
  return `LF-${String(count + 1).padStart(4, '0')}`; // e.g., LF-0001
};

// @route   POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const { customerId, items, paymentStatus } = req.body;
    
    // Calculate total amount
    const totalAmount = items.reduce((acc, item) => acc + item.totalPrice, 0);
    
    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      customer: customerId,
      items,
      totalAmount,
      paymentStatus: paymentStatus || 'Unpaid'
    });

    // Update customer total orders count
    const cust = await Customer.findByIdAndUpdate(customerId, { $inc: { totalOrders: 1 } });

    // 03 - Send (Twilio SMS Hook)
    const smsBody = `Hello ${cust.name}, your dry cleaning order ${orderId} has been received. Total: ₹${totalAmount}. Thank you for choosing LaundryFlow!`;
    sendSMS(cust.phone, smsBody);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/orders
router.get('/', protect, async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    let query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .populate('customer', 'name phone address')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name phone address');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/orders/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Received', 'Washing', 'Ready', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('customer');
    
    if (status === 'Ready' && order.customer?.phone) {
       sendSMS(order.customer.phone, `Your order ${order.orderId} is ready for pickup! Total Due: ₹${order.totalAmount}. - LaundryFlow`);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/orders/:id/payment
router.put('/:id/payment', protect, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!['Paid', 'Unpaid'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus }, { new: true });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
