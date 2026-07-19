const mongoose = require('mongoose');

const sellerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  shopName: { type: String, required: true, trim: true, maxlength: 100 },
  shopDescription: { type: String, maxlength: 2000, default: '' },
  logo: { type: String, default: '' },
  banner: { type: String, default: '' },

  // KYC Documents
  documents: [{
    type: { type: String, enum: ['gst', 'pan', 'aadhaar', 'shopLicense', 'other'] },
    url: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String, default: '' }
  }],

  // Bank Details
  bankDetails: {
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    bankName: { type: String, default: '' },
    upiId: { type: String, default: '' }
  },

  gstNumber: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  categories: [{ type: String }],
  location: { city: String, state: String, pincode: String },

  // Metrics
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalProducts: { type: Number, default: 0 },

  // Subscription
  subscriptionPlan: { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
  subscriptionExpiry: { type: Date },
  commissionRate: { type: Number, default: 15 },

  // Status
  isVerified: { type: Boolean, default: false },
  kycStatus: { type: String, enum: ['not_submitted', 'pending', 'approved', 'rejected'], default: 'not_submitted' },
  applicationDate: { type: Date },
  approvalDate: { type: Date },
  rejectionReason: { type: String, default: '' },

  // AI Scoring
  sellerScore: { type: Number, default: 50, min: 0, max: 100 },
  avgDeliveryTime: { type: Number, default: 0 }, // hours
  cancellationRate: { type: Number, default: 0 }, // percentage
  responseRate: { type: Number, default: 100 }, // percentage
}, { timestamps: true });

sellerProfileSchema.index({ shopName: 'text', 'location.city': 1 });

module.exports = mongoose.model('SellerProfile', sellerProfileSchema);
