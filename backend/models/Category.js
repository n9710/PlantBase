const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Auto-generate slug from name
categorySchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }
});

module.exports = mongoose.model('Category', categorySchema);
