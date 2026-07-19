const router = require('express').Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/auth');

// ── POST /api/coupons — Admin create coupon ──
router.post('/', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── GET /api/coupons — Admin list coupons ──
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt').lean();
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/coupons/validate — Customer validate coupon ──
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });

    const validity = coupon.isValid(req.user._id, orderAmount);
    if (!validity.valid) return res.status(400).json({ success: false, message: validity.message });

    const discount = coupon.calculateDiscount(orderAmount);

    res.json({
      success: true,
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        description: coupon.description,
        finalAmount: orderAmount - discount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/coupons/:id — Admin delete coupon ──
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/coupons/:id — Admin update coupon ──
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
