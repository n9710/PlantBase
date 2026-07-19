const router = require('express').Router();
const { protect, admin, seller } = require('../middleware/auth');
const aiEngine = require('../services/aiEngine');

// ── GET /api/ai/recommendations/:userId ──
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const recommendations = await aiEngine.getRecommendations(req.params.userId, limit);
    res.json({ success: true, data: recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/ai/recommendations — For logged-in user ──
router.get('/recommendations', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const recommendations = await aiEngine.getRecommendations(req.user._id, limit);
    res.json({ success: true, data: recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/ai/inventory-forecast/:productId ──
router.get('/inventory-forecast/:productId', protect, seller, async (req, res) => {
  try {
    const forecast = await aiEngine.getInventoryForecast(req.params.productId);
    if (!forecast) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: forecast });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/ai/seller-score/:sellerId ──
router.get('/seller-score/:sellerId', protect, async (req, res) => {
  try {
    const score = await aiEngine.calculateSellerScore(req.params.sellerId);
    res.json({ success: true, data: score });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/ai/dynamic-pricing/:productId ──
router.get('/dynamic-pricing/:productId', protect, seller, async (req, res) => {
  try {
    const pricing = await aiEngine.getDynamicPricing(req.params.productId);
    if (!pricing) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: pricing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/ai/moderate-review ──
router.post('/moderate-review', protect, admin, async (req, res) => {
  try {
    const { text, rating } = req.body;
    const result = aiEngine.moderateReview(text, rating);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/ai/chatbot — AI Chatbot endpoint ──
router.post('/chatbot', async (req, res) => {
  try {
    const { message } = req.body;
    const msg = (message || '').toLowerCase();
    const { BRAND_NAME } = require('../constants');

    // FAQ-based chatbot responses
    const faqs = [
      { keywords: ['track', 'order', 'where', 'shipping', 'delivery'], response: `To track your order, go to "My Orders" in your profile. You'll see real-time tracking updates there. If you need help with a specific order, please share the order ID.` },
      { keywords: ['return', 'refund', 'exchange'], response: `We accept returns within 7 days of delivery for most products. To initiate a return, go to "My Orders" > select the order > "Request Return". Refunds are processed within 5-7 business days.` },
      { keywords: ['payment', 'pay', 'razorpay', 'cod', 'upi'], response: `We accept online payments via Razorpay (UPI, cards, net banking) and Cash on Delivery (COD). COD is available for orders under ₹5000.` },
      { keywords: ['seller', 'sell', 'vendor', 'list'], response: `Want to sell on ${BRAND_NAME}? Click "Become a Seller" and fill out the application. Once approved, you can start listing products immediately!` },
      { keywords: ['organic', 'natural', 'chemical'], response: `All products on ${BRAND_NAME} are verified organic and free from harmful chemicals. We verify every seller and their products before listing.` },
      { keywords: ['discount', 'coupon', 'offer', 'deal'], response: `Check our latest deals on the homepage! You can also apply coupon codes at checkout. Subscribe to our newsletter for exclusive offers.` },
      { keywords: ['contact', 'support', 'help', 'email', 'phone'], response: `You can reach us at support@${BRAND_NAME.toLowerCase()}.com or call +91 98765 43210 (Mon-Sat, 9 AM - 6 PM IST). We typically respond within 24 hours.` },
      { keywords: ['hello', 'hi', 'hey', 'good'], response: `Hello! 👋 Welcome to ${BRAND_NAME}! I can help you with orders, returns, payments, and more. What would you like to know?` },
    ];

    const match = faqs.find(faq => faq.keywords.some(k => msg.includes(k)));
    const response = match
      ? match.response
      : `Thanks for your message! I can help with order tracking, returns, payments, and general questions about ${BRAND_NAME}. Could you tell me more about what you need help with?`;

    res.json({ success: true, data: { response, timestamp: new Date() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
