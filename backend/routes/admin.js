const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @GET /api/admin/stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const [users, products, orders, pendingProducts, sellers] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ status: 'approved' }),
      Order.countDocuments(),
      Product.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'seller' }),
    ]);

    const revenueData = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      users,
      sellers,
      products,
      orders,
      pendingProducts,
      revenue: revenueData[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/admin/users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt')
      .lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', protect, admin, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!isValidId(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify admin account' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot modify your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── CATEGORY MANAGEMENT ───

// @POST /api/admin/categories
router.post('/categories', protect, admin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name required' });

    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) return res.status(400).json({ success: false, message: 'Category already exists' });

    const category = await Category.create({ name });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/admin/categories/:id
router.put('/categories/:id', protect, admin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name required' });

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    category.name = name;
    await category.save();

    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @DELETE /api/admin/categories/:id
router.delete('/categories/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;