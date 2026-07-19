/**
 * Payments Route — Razorpay integration + COD support
 * Uses test/sandbox mode when RAZORPAY keys are not set
 */
const router = require('express').Router();
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const { BRAND_NAME } = require('../constants');

// Razorpay instance (conditional)
let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (e) {
  console.log('⚠️ Razorpay not configured — running in test mode');
}

// ── POST /api/payments/create-order — Create Razorpay order ──
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!razorpay) {
      // Test mode — simulate Razorpay order
      return res.json({
        success: true,
        testMode: true,
        data: {
          id: 'order_test_' + Date.now(),
          amount: amount * 100,
          currency: 'INR',
          receipt: orderId || 'test_receipt',
        },
        key: 'rzp_test_placeholder'
      });
    }

    const options = {
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: orderId || `receipt_${Date.now()}`,
      notes: {
        brand: BRAND_NAME,
        orderId: orderId || '',
      }
    };

    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      data: order,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payments/verify — Verify Razorpay payment ──
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay) {
      // Test mode — auto verify
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'Paid',
          razorpayOrderId: razorpay_order_id || 'test_order',
          razorpayPaymentId: razorpay_payment_id || 'test_payment',
        });
      }
      return res.json({ success: true, testMode: true, message: 'Payment verified (test mode)' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update order
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'Paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/payments/key — Get Razorpay key for frontend ──
router.get('/key', (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    testMode: !razorpay
  });
});

module.exports = router;
