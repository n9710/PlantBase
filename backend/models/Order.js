const mongoose = require('mongoose');

/**
 * Order Model — Enhanced with payments, logistics, commission, fraud detection
 */

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    qty: { type: Number, required: true, min: 1 },
    image: String,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: String,
    state: String,
    pincode: String,
    phone: String
  },

  // Pricing
  itemsPrice: { type: Number, required: true },
  shippingPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  couponCode: { type: String, default: '' },
  couponDiscount: { type: Number, default: 0 },

  // Payment
  paymentMethod: { type: String, enum: ['razorpay', 'cod', 'wallet'], default: 'cod' },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },

  // Commission & Payout
  commissionRate: { type: Number, default: 10 },
  commissionAmount: { type: Number, default: 0 },
  sellerPayout: { type: Number, default: 0 },
  payoutStatus: { type: String, enum: ['pending', 'processing', 'completed'], default: 'pending' },

  // Order Status
  orderStatus: {
    type: String,
    enum: ['Order Placed', 'Confirmed', 'Seller Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned', 'Refunded'],
    default: 'Order Placed'
  },
  statusHistory: [statusHistorySchema],

  // Logistics
  trackingNumber: { type: String, default: '' },
  courierPartner: { type: String, default: '' },
  courierTrackingUrl: { type: String, default: '' },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },

  // AI Fraud Detection
  fraudScore: { type: Number, default: 0, min: 0, max: 100 },
  fraudFlags: [{ type: String }],

  // Notes
  customerNote: { type: String, default: '' },
  adminNote: { type: String, default: '' },

  // Review unlocked
  reviewUnlocked: { type: Boolean, default: false },
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'items.seller': 1 });

// Auto update review unlock on delivery
orderSchema.pre('save', function() {
  if (this.isModified('orderStatus') && this.orderStatus === 'Delivered') {
    this.reviewUnlocked = true;
    this.deliveredAt = new Date();
    if (this.paymentMethod === 'cod') this.paymentStatus = 'Paid';
  }

  // Calculate commission
  if (this.isModified('totalPrice') || this.isModified('commissionRate')) {
    this.commissionAmount = Math.round((this.totalPrice - this.couponDiscount) * this.commissionRate / 100);
    this.sellerPayout = (this.totalPrice - this.couponDiscount) - this.commissionAmount;
  }
});

module.exports = mongoose.model('Order', orderSchema);