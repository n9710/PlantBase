const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  content: { type: String, required: true },
  excerpt: { type: String, maxlength: 300, default: '' },
  coverImage: { type: String, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  views: { type: Number, default: 0 },

  // SEO
  seoTitle: { type: String, maxlength: 60 },
  seoDescription: { type: String, maxlength: 160 },

  publishedAt: { type: Date }
}, { timestamps: true });

blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Auto-generate excerpt if not provided
blogSchema.pre('save', function() {
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.replace(/<[^>]+>/g, '').substring(0, 280) + '...';
  }
  if (!this.seoTitle) this.seoTitle = this.title;
  if (this.published && !this.publishedAt) this.publishedAt = new Date();
});

module.exports = mongoose.model('Blog', blogSchema);
