const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    // Today's total revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({ createdAt: { $gte: today } });
    const dailyRevenue = todayOrders
      .filter(order => order.paymentStatus === 'Paid')
      .reduce((acc, order) => acc + order.totalAmount, 0);

    // Order counts
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $ne: 'Delivered' } });
    const completedOrders = await Order.countDocuments({ status: 'Delivered' });

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      dailyRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
