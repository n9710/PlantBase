const router = require('express').Router();
const Product = require('../models/Product');
const { protect, admin, seller } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

// @GET /api/products — public (only approved) or admin (with status)
router.get('/', async (req, res) => {
  try {
    let { category, search, page = 1, limit = 12, sort, featured, status } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = { status: status || 'approved' };

    if (category && category !== 'All') query.category = category;
    if (featured === 'true') query.isFeatured = true;

    // Safe search (prevent regex injection)
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { tags: { $elemMatch: { $regex: safeSearch, $options: 'i' } } }
      ];
    }

    let sortObj = { isFeatured: -1, createdAt: -1 };
    if (sort === 'price_high') sortObj = { price: -1 };
    else if (sort === 'price_low') sortObj = { price: 1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'popular') sortObj = { ratings: -1, numReviews: -1 };
    // Legacy support
    else if (sort === 'price-asc') sortObj = { price: 1 };
    else if (sort === 'price-desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { ratings: -1 };

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('seller', 'name sellerInfo')
      .lean();

    res.json({
      success: true,
      data: {
        products,
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/products/search?q=keyword
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const products = await Product.find({
      status: 'approved',
      $or: [
        { name: { $regex: safeQ, $options: 'i' } },
        { description: { $regex: safeQ, $options: 'i' } },
        { tags: { $elemMatch: { $regex: safeQ, $options: 'i' } } }
      ]
    })
    .populate('seller', 'name sellerInfo')
    .lean();

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/products/admin/pending
router.get('/admin/pending', protect, admin, async (req, res) => {
  try {
    const products = await Product.find({ status: 'pending' })
      .populate('seller', 'name email sellerInfo')
      .sort('-createdAt')
      .lean();

    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/products/seller — Seller's own products
router.get('/seller', protect, seller, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort('-createdAt')
      .lean();

    res.json({ success: true, data: { products, total: products.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/products/seller/mine (alias)
router.get('/seller/mine', protect, seller, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort('-createdAt')
      .lean();

    res.json({ success: true, data: { products, total: products.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name sellerInfo');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/products
router.post('/',
  protect,
  seller,
  [
    body('name').notEmpty().withMessage('Name required').isLength({ max: 120 }),
    body('price').isNumeric().withMessage('Price must be number'),
    body('category').notEmpty().withMessage('Category required'),
  ],
  validate,
  async (req, res) => {
    try {
      const product = await Product.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        originalPrice: req.body.originalPrice,
        category: req.body.category,
        images: req.body.images,
        stock: req.body.stock || 10,
        tags: req.body.tags,
        isOrganic: req.body.isOrganic !== undefined ? req.body.isOrganic : true,
        isFeatured: req.body.isFeatured || false,
        seller: req.user._id,
        sellerName: req.user.sellerInfo?.shopName || req.user.name,
        location: req.body.location || req.user.sellerInfo?.location || '',
        status: req.user.role === 'admin' ? 'approved' : 'pending'
      });

      res.status(201).json({ success: true, data: product });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @PUT /api/products/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const allowedFields = [
      'name', 'description', 'price', 'originalPrice',
      'category', 'images', 'stock', 'tags', 'isOrganic', 'location',
      ...(req.user.role === 'admin' ? ['isFeatured', 'status'] : [])
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // Editing an approved product resets to pending for re-review
    if (req.user.role !== 'admin') {
      product.status = 'pending';
    }

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @DELETE /api/products/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ success: false, message: 'Not found' });

    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/products/:id/approve
router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });

    product.status = 'approved';
    product.rejectionReason = '';
    await product.save();

    res.json({ success: true, message: 'Approved', data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @PUT /api/products/:id/reject
router.put('/:id/reject', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });

    product.status = 'rejected';
    product.rejectionReason = req.body.reason || 'Rejected';
    await product.save();

    res.json({ success: true, message: 'Rejected', data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @POST /api/products/:id/review
router.post('/:id/review', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Not found' });

    const already = product.reviews?.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (already) {
      return res.status(400).json({ success: false, message: 'Already reviewed' });
    }

    const rating = Number(req.body.rating);
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Invalid rating' });
    }

    product.reviews = product.reviews || [];
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating,
      comment: req.body.comment,
    });

    product.numReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;