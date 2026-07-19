require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('1. Connected');

    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Category.deleteMany();
    console.log('2. Cleared');

    const admin = await User.create({
      name: 'Arjun Mehta', email: 'admin@plantbase.com',
      password: 'admin123', role: 'admin', isActive: true
    });
    console.log('3. Admin created:', admin._id);

    const seller = await User.create({
      name: 'Green Roots Co.', email: 'greenroots@plantbase.com',
      password: 'seller123', role: 'seller', isActive: true,
      sellerInfo: { shopName: 'Green Roots Co.', location: 'Pune', bio: 'Test' }
    });
    console.log('4. Seller created:', seller._id);

    const cats = await Category.insertMany([
      { name: 'Hair Oil', slug: 'hair_oil' },
      { name: 'Skin Care', slug: 'skin_care' },
    ]);
    console.log('5. Categories created:', cats.length);

    const product = await Product.create({
      name: 'Test Product', price: 100, category: 'Hair Oil',
      images: ['https://placehold.co/400x400?text=Test'],
      seller: seller._id, sellerName: 'Green Roots Co.',
      location: 'Pune', stock: 10, status: 'approved'
    });
    console.log('6. Product created:', product._id);

    console.log('ALL STEPS PASSED');
    process.exit(0);
  } catch (err) {
    console.log('FAILED AT STEP');
    console.log('Error name:', err.name);
    console.log('Error message:', err.message);
    if (err.errors) {
      Object.keys(err.errors).forEach(k => {
        console.log('  Field:', k, ':', err.errors[k].message);
      });
    }
    process.exit(1);
  }
}
test();
