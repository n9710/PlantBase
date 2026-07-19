const router = require('express').Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// ── GET /api/wishlist — Get user's wishlist ──
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products.product', 'name price originalPrice images ratings numReviews stock seller sellerName slug category')
      .lean();

    if (!wishlist) wishlist = { products: [] };

    // Filter out null products (deleted)
    wishlist.products = wishlist.products.filter(p => p.product);

    res.json({ success: true, data: wishlist.products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/wishlist/toggle/:productId — Add/remove from wishlist ──
router.post('/toggle/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [{ product: productId }] });
      await Product.findByIdAndUpdate(productId, { $inc: { wishlistCount: 1 } });
      return res.json({ success: true, added: true, message: 'Added to wishlist' });
    }

    const idx = wishlist.products.findIndex(p => p.product.toString() === productId);

    if (idx > -1) {
      wishlist.products.splice(idx, 1);
      await wishlist.save();
      await Product.findByIdAndUpdate(productId, { $inc: { wishlistCount: -1 } });
      return res.json({ success: true, added: false, message: 'Removed from wishlist' });
    } else {
      wishlist.products.push({ product: productId });
      await wishlist.save();
      await Product.findByIdAndUpdate(productId, { $inc: { wishlistCount: 1 } });
      return res.json({ success: true, added: true, message: 'Added to wishlist' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/wishlist/check/:productId — Check if in wishlist ──
router.get('/check/:productId', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).lean();
    const inWishlist = wishlist?.products.some(p => p.product.toString() === req.params.productId) || false;
    res.json({ success: true, inWishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
