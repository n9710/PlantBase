const router = require('express').Router();
const Blog = require('../models/Blog');
const { protect, admin } = require('../middleware/auth');

// ── GET /api/blog — Public list (published only) ──
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const category = req.query.category;

    const filter = { published: true };
    if (category) filter.category = category;

    const blogs = await Blog.find(filter)
      .populate('author', 'name avatar')
      .select('-content')
      .sort('-publishedAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      data: blogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/blog/:slug — Public read single post ──
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, published: true },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name avatar').lean();

    if (!blog) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/blog — Admin create post ──
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, category, tags, published, seoTitle, seoDescription } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const blog = await Blog.create({
      title, slug, content, excerpt, coverImage, category,
      tags: tags || [], published: published || false,
      seoTitle, seoDescription,
      author: req.user._id,
    });

    res.status(201).json({ success: true, data: blog });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT /api/blog/:id — Admin update post ──
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/blog/:id — Admin delete post ──
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/blog/admin/all — Admin list all posts (including drafts) ──
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const blogs = await Blog.find().populate('author', 'name').sort('-createdAt').lean();
    res.json({ success: true, data: blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
