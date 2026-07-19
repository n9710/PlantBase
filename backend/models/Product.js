const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, unique: true, lowercase: true, index: true },
  description: { type: String, maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  discountPrice: { type: Number, min: 0 },

  category: { type: String, required: true, trim: true },
  subcategory: { type: String, default: '' },

  images: {
    type: [String],
    validate: {
      validator: arr => arr.length > 0,
      message: 'At least one image is required'
    }
  },

  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sellerName: { type: String, trim: true },
  location: { type: String, trim: true },

  stock: { type: Number, default: 10, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  sku: { type: String, default: '' },

  // Ratings (aggregated)
  ratings: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },

  // Metrics
  views: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },

  isOrganic: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },

  tags: { type: [String], index: true },

  // Product attributes
  weight: { type: Number, default: 0 }, // grams
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },

  // Ingredients / materials
  ingredients: [{ type: String }],
  certifications: [{ type: String }], // e.g., "USDA Organic", "Cruelty-Free"

  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' },

  // SEO
  seoTitle: { type: String },
  seoDescription: { type: String },
}, { timestamps: true });

// Text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Auto-generate slug
productSchema.pre('save', function() {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }
  if (this.originalPrice && this.originalPrice < this.price) {
    throw new Error('Original price must be >= price');
  }
  // Compute discount price
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discountPrice = this.originalPrice;
  }
  // SEO defaults
  if (!this.seoTitle) this.seoTitle = this.name;
  if (!this.seoDescription) this.seoDescription = (this.description || '').substring(0, 155);
});

module.exports = mongoose.model('Product', productSchema);