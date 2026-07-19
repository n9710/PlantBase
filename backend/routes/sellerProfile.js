const router = require('express').Router();
const SellerProfile = require('../models/SellerProfile');
const User = require('../models/User');
const { protect, admin, seller } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// ── POST /api/seller-profile/apply — Apply to become seller ──
router.post('/apply', protect, async (req, res) => {
  try {
    if (req.user.role === 'seller') {
      return res.status(400).json({ success: false, message: 'You are already a seller' });
    }

    const { shopName, shopDescription, categories, gstNumber, panNumber, bankDetails, location } = req.body;

    // Check if already applied
    const existing = await SellerProfile.findOne({ userId: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Application already submitted' });

    const profile = await SellerProfile.create({
      userId: req.user._id,
      shopName,
      shopDescription,
      categories: categories || [],
      gstNumber: gstNumber || '',
      panNumber: panNumber || '',
      bankDetails: bankDetails || {},
      location: location || {},
      applicationDate: new Date(),
      kycStatus: 'pending',
    });

    res.status(201).json({ success: true, data: profile, message: 'Application submitted successfully!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/seller-profile/my — Seller get own profile ──
router.get('/my', protect, async (req, res) => {
  try {
    const profile = await SellerProfile.findOne({ userId: req.user._id }).lean();
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/seller-profile/update — Seller update profile ──
router.put('/update', protect, seller, async (req, res) => {
  try {
    const allowed = ['shopName', 'shopDescription', 'logo', 'banner', 'bankDetails', 'categories', 'location'];
    const updates = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const profile = await SellerProfile.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/seller-profile/pending — Admin list pending applications ──
router.get('/pending', protect, admin, async (req, res) => {
  try {
    const profiles = await SellerProfile.find({ kycStatus: 'pending' })
      .populate('userId', 'name email phone createdAt')
      .sort('-applicationDate')
      .lean();
    res.json({ success: true, data: profiles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/seller-profile/:id/approve — Admin approve seller ──
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const profile = await SellerProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    profile.kycStatus = 'approved';
    profile.isVerified = true;
    profile.approvalDate = new Date();
    await profile.save();

    // Update user role to seller
    await User.findByIdAndUpdate(profile.userId, {
      role: 'seller',
      'sellerInfo.shopName': profile.shopName,
      'sellerInfo.verified': true,
    });

    // Notify seller
    await notificationService.notifySellerApproval(profile.userId, true);

    res.json({ success: true, message: 'Seller approved', data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/seller-profile/:id/reject — Admin reject seller ──
router.put('/:id/reject', protect, admin, async (req, res) => {
  try {
    const profile = await SellerProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    profile.kycStatus = 'rejected';
    profile.rejectionReason = req.body.reason || 'Application did not meet requirements';
    await profile.save();

    // Notify seller
    await notificationService.notifySellerApproval(profile.userId, false, profile.rejectionReason);

    res.json({ success: true, message: 'Seller rejected', data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/seller-profile/all — Admin list all seller profiles ──
router.get('/all', protect, admin, async (req, res) => {
  try {
    const profiles = await SellerProfile.find()
      .populate('userId', 'name email role isActive')
      .sort('-createdAt')
      .lean();
    res.json({ success: true, data: profiles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
