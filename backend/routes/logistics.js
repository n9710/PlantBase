const router = require('express').Router();
const Order = require('../models/Order');
const { protect, admin, seller } = require('../middleware/auth');
const { COURIER_PARTNERS } = require('../constants');
const notificationService = require('../services/notificationService');

// ── GET /api/logistics/couriers — Get available courier partners ──
router.get('/couriers', (req, res) => {
  res.json({ success: true, data: COURIER_PARTNERS });
});

// ── POST /api/logistics/assign — Assign courier to order ──
router.post('/assign', protect, seller, async (req, res) => {
  try {
    const { orderId, courierId, trackingNumber } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const courier = COURIER_PARTNERS.find(c => c.id === courierId);
    if (!courier) return res.status(400).json({ success: false, message: 'Invalid courier partner' });

    order.courierPartner = courier.name;
    order.trackingNumber = trackingNumber || '';
    order.courierTrackingUrl = courier.tracking_url + (trackingNumber || '');
    order.orderStatus = 'Shipped';
    order.statusHistory.push({
      status: 'Shipped',
      updatedBy: req.user._id,
      note: `Shipped via ${courier.name}${trackingNumber ? ` — Tracking: ${trackingNumber}` : ''}`,
      updatedAt: new Date()
    });

    // Estimate delivery (3-7 days)
    order.estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    await order.save();

    // Notify customer
    await notificationService.notifyOrderUpdate(order.user, order, 'Shipped');

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/logistics/:orderId/tracking — Update tracking ──
router.put('/:orderId/tracking', protect, seller, async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status) {
      order.orderStatus = status;
      order.statusHistory.push({
        status,
        updatedBy: req.user._id,
        note: note || `Status updated to ${status}`,
        updatedAt: new Date()
      });

      // Notify customer
      await notificationService.notifyOrderUpdate(order.user, order, status);
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/logistics/:orderId/track — Get tracking info ──
router.get('/:orderId/track', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .select('orderStatus statusHistory trackingNumber courierPartner courierTrackingUrl estimatedDelivery deliveredAt')
      .populate('statusHistory.updatedBy', 'name role')
      .lean();

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
