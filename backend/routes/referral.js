const router = require('express').Router();
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { protect } = require('../middleware/auth');
const { REFERRAL_REWARD_AMOUNT, BRAND_NAME } = require('../constants');
const notificationService = require('../services/notificationService');

// ── GET /api/referral/code — Get user's referral code ──
router.get('/code', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode referralCount').lean();
    res.json({
      success: true,
      data: {
        code: user.referralCode,
        referralCount: user.referralCount,
        rewardPerReferral: REFERRAL_REWARD_AMOUNT,
        shareLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?ref=${user.referralCode}`,
        shareText: `Join ${BRAND_NAME} and get ₹${REFERRAL_REWARD_AMOUNT} in your wallet! Use my referral code: ${user.referralCode}`,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/referral/apply — Apply referral code (called during registration) ──
router.post('/apply', protect, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Referral code required' });

    // Check if user already used a referral
    const currentUser = await User.findById(req.user._id);
    if (currentUser.referredBy) {
      return res.status(400).json({ success: false, message: 'Referral already applied' });
    }

    // Find referrer
    const referrer = await User.findOne({ referralCode: code.toUpperCase() });
    if (!referrer) return res.status(404).json({ success: false, message: 'Invalid referral code' });
    if (referrer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot refer yourself' });
    }

    // Apply referral
    currentUser.referredBy = referrer._id;
    await currentUser.save();

    // Reward referrer
    let referrerWallet = await Wallet.findOne({ user: referrer._id });
    if (!referrerWallet) referrerWallet = await Wallet.create({ user: referrer._id });
    await referrerWallet.addCredit(REFERRAL_REWARD_AMOUNT, `Referral reward — ${currentUser.name} joined`, 'referral');

    referrer.referralCount = (referrer.referralCount || 0) + 1;
    await referrer.save();

    // Reward new user
    let userWallet = await Wallet.findOne({ user: req.user._id });
    if (!userWallet) userWallet = await Wallet.create({ user: req.user._id });
    await userWallet.addCredit(REFERRAL_REWARD_AMOUNT, `Welcome bonus — referred by ${referrer.name}`, 'referral');

    // Notify both
    await notificationService.notifyReferralReward(referrer._id, REFERRAL_REWARD_AMOUNT);
    await notificationService.notifyReferralReward(req.user._id, REFERRAL_REWARD_AMOUNT);

    res.json({
      success: true,
      message: `Referral applied! ₹${REFERRAL_REWARD_AMOUNT} added to both wallets.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/referral/stats — Referral statistics ──
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode referralCount').lean();
    const referrals = await User.find({ referredBy: req.user._id }).select('name createdAt').lean();

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        totalReferrals: user.referralCount,
        totalEarned: user.referralCount * REFERRAL_REWARD_AMOUNT,
        referrals: referrals.map(r => ({ name: r.name, joinedAt: r.createdAt })),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
