const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// ── GET /api/notifications — Get user's notifications ──
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const notifications = await Notification.find({ user: req.user._id })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
    const total = await Notification.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/notifications/:id/read — Mark as read ──
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/notifications/read-all — Mark all as read ──
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/notifications/unread-count ──
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
