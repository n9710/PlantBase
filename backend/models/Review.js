const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, maxlength: 120, default: '' },
  comment: { type: String, maxlength: 1000, default: '' },
  images: [{ type: String }],
  verifiedPurchase: { type: Boolean, default: false },

  // AI Moderation
  flagged: { type: Boolean, default: false },
  flagReason: { type: String, default: '' },
  aiModerationScore: { type: Number, default: 100, min: 0, max: 100 }, // 100 = clean

  // Helpful system
  helpfulCount: { type: Number, default: 0 },
  helpfulUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Seller reply
  reply: {
    comment: { type: String, maxlength: 500 },
    date: { type: Date }
  }
}, { timestamps: true });

// One review per product per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
