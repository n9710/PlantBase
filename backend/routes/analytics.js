const router = require('express').Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { protect, admin, seller } = require('../middleware/auth');

// ── GET /api/analytics/dashboard — Admin dashboard analytics ──
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, totalSellers, totalOrders, totalProducts,
      todayOrders, monthlyOrders,
      pendingSellers, pendingProducts, flaggedReviews,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'seller' }),
      Order.countDocuments(),
      Product.countDocuments({ status: 'approved' }),
      Order.find({ createdAt: { $gte: todayStart } }).lean(),
      Order.find({ createdAt: { $gte: monthStart } }).lean(),
      User.countDocuments({ role: 'seller', 'sellerInfo.verified': false }),
      Product.countDocuments({ status: 'pending' }),
      Review.countDocuments({ flagged: true }),
    ]);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.totalPrice : 0), 0);
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.totalPrice : 0), 0);

    // Sales growth - last 30 days daily
    const salesGrowth = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayOrders = await Order.find({ createdAt: { $gte: dayStart, $lt: dayEnd } }).lean();
      salesGrowth.push({
        date: dayStart.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: dayOrders.reduce((s, o) => s + (o.paymentStatus === 'Paid' ? o.totalPrice : 0), 0),
      });
    }

    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    // Category revenue
    const categoryRevenue = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'prod' } },
      { $unwind: '$prod' },
      { $group: { _id: '$prod.category', revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }, orders: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Top sellers
    const topSellers = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.seller', revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }, orders: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'seller' } },
      { $unwind: '$seller' },
      { $project: { name: '$seller.name', revenue: 1, orders: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        cards: {
          totalUsers, totalSellers, totalOrders, totalProducts,
          todayOrders: todayOrders.length, todayRevenue,
          monthlyOrders: monthlyOrders.length, monthlyRevenue,
          pendingSellers, pendingProducts, flaggedReviews,
        },
        charts: { salesGrowth, statusBreakdown, categoryRevenue, topSellers },
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/analytics/seller — Seller's own analytics ──
router.get('/seller', protect, seller, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const sellerProducts = await Product.find({ seller: sellerId }).select('_id').lean();
    const productIds = sellerProducts.map(p => p._id);

    const allOrders = await Order.find({ 'items.seller': sellerId }).lean();
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);
    const pendingOrders = allOrders.filter(o => ['Order Placed', 'Confirmed'].includes(o.orderStatus));

    const totalRevenue = allOrders.reduce((sum, o) => {
      return sum + o.items.filter(i => i.seller?.toString() === sellerId.toString()).reduce((s, i) => s + i.price * i.qty, 0);
    }, 0);

    const todayRevenue = todayOrders.reduce((sum, o) => {
      return sum + o.items.filter(i => i.seller?.toString() === sellerId.toString()).reduce((s, i) => s + i.price * i.qty, 0);
    }, 0);

    // Low stock products
    const lowStock = await Product.find({ seller: sellerId, stock: { $lte: 5 }, status: 'approved' })
      .select('name stock lowStockThreshold').lean();

    // Top products
    const topProducts = await Product.find({ seller: sellerId, status: 'approved' })
      .sort({ salesCount: -1 }).limit(5)
      .select('name salesCount views ratings price').lean();

    // 7-day sales chart
    const salesChart = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayOrders = allOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= dayStart && d < dayEnd;
      });
      salesChart.push({
        date: dayStart.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: dayOrders.reduce((s, o) => {
          return s + o.items.filter(i => i.seller?.toString() === sellerId.toString()).reduce((ss, i) => ss + i.price * i.qty, 0);
        }, 0),
      });
    }

    res.json({
      success: true,
      data: {
        cards: {
          todayOrders: todayOrders.length,
          pendingOrders: pendingOrders.length,
          totalRevenue,
          todayRevenue,
          totalProducts: sellerProducts.length,
          lowStockCount: lowStock.length,
        },
        lowStock,
        topProducts,
        salesChart,
        totalOrders: allOrders.length,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/analytics/track — Track user event ──
router.post('/track', async (req, res) => {
  // Lightweight event tracking — can be expanded to store in Analytics model
  // For now, just acknowledge (real analytics comes from aggregation queries)
  res.json({ success: true });
});

module.exports = router;
