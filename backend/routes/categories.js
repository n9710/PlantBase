const router = require('express').Router();
const Category = require('../models/Category');

// @GET /api/categories — public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort('name')
      .lean();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
