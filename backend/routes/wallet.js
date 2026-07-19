const router = require('express').Router();
const Wallet = require('../models/Wallet');
const { protect } = require('../middleware/auth');

// ── GET /api/wallet — Get wallet balance & transactions ──
router.get('/', protect, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id }).lean();
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id });
      wallet = wallet.toObject();
    }
    // Return last 50 transactions
    wallet.transactions = (wallet.transactions || []).slice(-50).reverse();
    res.json({ success: true, data: wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/wallet/balance — Quick balance check ──
router.get('/balance', protect, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id }).select('balance').lean();
    res.json({ success: true, balance: wallet?.balance || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
