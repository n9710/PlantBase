const router = require('express').Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');
const aiEngine = require('../services/aiEngine');

// ── POST /api/reviews — Create review (only after delivery) ──
router.post('/', protect, async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment } = req.body;

    // Verify order exists and is delivered
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not your order' });
    }
    if (!order.reviewUnlocked) {
      return res.status(400).json({ success: false, message: 'Review only available after delivery' });
    }

    // Check product is in order
    const inOrder = order.items.some(i => i.product.toString() === productId);
    if (!inOrder) return res.status(400).json({ success: false, message: 'Product not in this order' });

    // Check duplicate
    const existing = await Review.findOne({ user: req.user._id, product: productId, order: orderId });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed this product for this order' });

    // AI moderation
    const moderation = aiEngine.moderateReview(comment, rating);

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: orderId,
      rating,
      title,
      comment,
      verifiedPurchase: true,
      flagged: moderation.flagged,
      flagReason: moderation.flags.join(', '),
      aiModerationScore: moderation.score,
    });

    // Update product rating
    const reviews = await Review.find({ product: productId, flagged: false });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, {
      ratings: Math.round(avgRating * 10) / 10,
      numReviews: reviews.length
    });

    res.status(201).json({ success: true, data: review, moderation });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/reviews/product/:id — Get product reviews ──
router.get('/product/:id', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || '-createdAt';

    const reviews = await Review.find({ product: req.params.id, flagged: false })
      .populate('user', 'name avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({ product: req.params.id, flagged: false });

    // Rating breakdown
    const breakdown = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.id), flagged: false } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      breakdown: breakdown.reduce((acc, b) => { acc[b._id] = b.count; return acc; }, {})
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/reviews/:id/helpful — Mark review as helpful ──
router.post('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const userId = req.user._id;
    const alreadyVoted = review.helpfulUsers.some(u => u.toString() === userId.toString());

    if (alreadyVoted) {
      review.helpfulUsers.pull(userId);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulUsers.push(userId);
      review.helpfulCount += 1;
    }
    await review.save();

    res.json({ success: true, helpfulCount: review.helpfulCount, voted: !alreadyVoted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/reviews/:id — Admin delete review ──
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Recalculate product rating
    const reviews = await Review.find({ product: review.product, flagged: false });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await Product.findByIdAndUpdate(review.product, { ratings: Math.round(avgRating * 10) / 10, numReviews: reviews.length });

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/reviews/flagged — Admin get flagged reviews ──
router.get('/flagged', protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find({ flagged: true })
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort('-createdAt')
      .lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
