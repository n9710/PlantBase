const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['order_placed', 'order_update', 'order_delivered', 'order_cancelled',
           'seller_approved', 'seller_rejected', 'product_approved', 'product_rejected',
           'review_received', 'review_flagged', 'payout_processed',
           'low_stock', 'referral_reward', 'coupon', 'system', 'chat'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  data: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
    link: { type: String }
  }
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
