const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  type: { type: String, enum: ['percentage', 'flat'], required: true },
  value: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 }, // 0 = no cap
  validFrom: { type: Date, default: Date.now },
  validTo: { type: Date, required: true },
  usageLimit: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  applicableCategories: [{ type: String }], // empty = all
  applicableSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // empty = all
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, default: '' }
}, { timestamps: true });

// Check validity
couponSchema.methods.isValid = function(userId, orderAmount) {
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (new Date() < this.validFrom) return { valid: false, message: 'Coupon not yet active' };
  if (new Date() > this.validTo) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (this.usedBy.some(u => u.toString() === userId.toString())) return { valid: false, message: 'You have already used this coupon' };
  if (orderAmount < this.minOrderAmount) return { valid: false, message: `Minimum order amount is ₹${this.minOrderAmount}` };
  return { valid: true };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = this.type === 'percentage'
    ? (orderAmount * this.value / 100)
    : this.value;
  if (this.maxDiscount > 0 && discount > this.maxDiscount) discount = this.maxDiscount;
  return Math.round(discount * 100) / 100;
};

module.exports = mongoose.model('Coupon', couponSchema);
