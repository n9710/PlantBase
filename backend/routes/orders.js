const router = require('express').Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect, admin, seller } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const aiEngine = require('../services/aiEngine');
const { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST, DEFAULT_COMMISSION_RATE } = require('../constants');

// ── POST /api/orders — Create order ──
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, customerNote } = req.body;
    if (!items?.length) return res.status(400).json({ success: false, message: 'No items' });

    let itemsPrice = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(400).json({ success: false, message: `Product not found: ${item.product}` });
      if (product.stock < item.qty) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });

      itemsPrice += product.price * item.qty;
      validatedItems.push({
        product: product._id, name: product.name, price: product.price,
        qty: item.qty, image: product.images[0], seller: product.seller,
      });

      // Reduce stock
      product.stock -= item.qty;
      product.salesCount = (product.salesCount || 0) + item.qty;
      await product.save();

      // Check low stock alert
      if (product.stock <= (product.lowStockThreshold || 5)) {
        notificationService.notifyLowStock(product.seller, product);
      }
    }

    // Apply coupon
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const validity = coupon.isValid(req.user._id, itemsPrice);
        if (validity.valid) {
          couponDiscount = coupon.calculateDiscount(itemsPrice);
          coupon.usedCount += 1;
          coupon.usedBy.push(req.user._id);
          await coupon.save();
        }
      }
    }

    const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST;
    const totalPrice = itemsPrice + shippingPrice - couponDiscount;
    const commissionAmount = Math.round(totalPrice * DEFAULT_COMMISSION_RATE / 100);

    // Fraud detection
    const fraud = await aiEngine.calculateFraudScore({ paymentMethod, totalPrice, shippingAddress }, req.user._id);

    const order = await Order.create({
      user: req.user._id,
      items: validatedItems,
      shippingAddress,
      itemsPrice, shippingPrice, totalPrice,
      couponCode: couponCode || '',
      couponDiscount,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Pending',
      commissionRate: DEFAULT_COMMISSION_RATE,
      commissionAmount,
      sellerPayout: totalPrice - commissionAmount,
      customerNote: customerNote || '',
      fraudScore: fraud.score,
      fraudFlags: fraud.flags,
      orderStatus: 'Order Placed',
      statusHistory: [{
        status: 'Order Placed',
        updatedBy: req.user._id,
        note: `Order placed via ${paymentMethod || 'cod'}`,
        updatedAt: new Date(),
      }],
    });

    // Notify sellers (unique sellers in order)
    const sellerIds = [...new Set(validatedItems.map(i => i.seller.toString()))];
    for (const sid of sellerIds) {
      await notificationService.notifySellerNewOrder(sid, order);
    }

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/orders/mine — Customer's orders ──
router.get('/mine', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await Order.countDocuments({ user: req.user._id });
    res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/orders/:id/track — Order tracking ──
router.get('/:id/track', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }
    const order = await Order.findById(req.params.id)
      .populate('statusHistory.updatedBy', 'name role')
      .lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isSeller = order.items.some(i => i.seller?.toString() === req.user._id.toString());
    if (!isOwner && !isAdmin && !isSeller) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/orders/all — Admin: all orders ──
router.get('/all', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const filter = {};
    if (status) filter.orderStatus = status;

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await Order.countDocuments(filter);
    res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/orders/seller — Seller orders ──
router.get('/seller', protect, seller, async (req, res) => {
  try {
    const sellerProducts = await Product.find({ seller: req.user._id }).select('_id').lean();
    const productIds = sellerProducts.map(p => p._id);

    const orders = await Order.find({ 'items.product': { $in: productIds } })
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/orders/:id/status — Update status (admin/seller) ──
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const allStatuses = ['Order Placed', 'Confirmed', 'Seller Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned', 'Refunded'];
    const sellerAllowed = ['Seller Processing', 'Packed', 'Shipped', 'Out for Delivery'];

    if (!allStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isAdmin = req.user.role === 'admin';
    const isSeller = req.user.role === 'seller';

    if (!isAdmin && !isSeller) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (isSeller && !isAdmin) {
      const hasSellerItems = order.items.some(i => i.seller?.toString() === req.user._id.toString());
      if (!hasSellerItems) return res.status(403).json({ success: false, message: 'Not your order' });
      if (!sellerAllowed.includes(status)) return res.status(403).json({ success: false, message: `Sellers can set: ${sellerAllowed.join(', ')}` });
    }

    // Cancel — restore stock
    if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty, salesCount: -item.qty } });
      }
      // Restore coupon usage
      if (order.couponCode) {
        const coupon = await Coupon.findOne({ code: order.couponCode });
        if (coupon) {
          coupon.usedCount -= 1;
          coupon.usedBy = coupon.usedBy.filter(u => u.toString() !== order.user.toString());
          await coupon.save();
        }
      }
    }

    order.orderStatus = status;
    order.statusHistory.push({ status, updatedBy: req.user._id, note: note || `Status → ${status}`, updatedAt: new Date() });
    await order.save();

    // Notify customer
    await notificationService.notifyOrderUpdate(order.user, order, status);

    res.json({ success: true, message: 'Status updated', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PUT /api/orders/:id/cancel — Customer cancel (before shipping) ──
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not your order' });
    if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel — order already shipped' });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty, salesCount: -item.qty } });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', updatedBy: req.user._id, note: 'Cancelled by customer', updatedAt: new Date() });
    await order.save();

    res.json({ success: true, message: 'Order cancelled', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;