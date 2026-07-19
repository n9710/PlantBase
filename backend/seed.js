/**
 * Database Seed Script — PlantBase
 * Resets the database and populates it with realistic marketplace data.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const MONGO_URI = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plantbase').trim();
console.log('Using MONGO_URI:', MONGO_URI);

// Connect DB
mongoose.connect(MONGO_URI).then(() => console.log('MongoDB Connected'))
  .catch(err => { console.error(err); process.exit(1); });

const seedDB = async () => {
  try {
    console.log('🌱 Starting database seed for PlantBase...');

    // 1. Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    console.log('🗑️  Cleared existing data.');

    // 2. Create Admin
    const admin = await User.create({
      name: 'PlantBase Admin',
      email: 'admin@plantbase.com',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true,
      walletBalance: 10000,
    });
    console.log('👑 Admin created.');

    // 3. Create Sellers
    const seller1 = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav@organics.com',
      password: 'seller123',
      role: 'seller',
      isEmailVerified: true,
      sellerInfo: {
        shopName: 'Aarav Organics',
        location: 'Kerala, India',
        bio: 'Authentic ayurvedic herbs and oils sourced directly from Kerala farms.',
        isApproved: true,
        sellerScore: 92,
      }
    });
    
    const seller2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@earthcrafts.in',
      password: 'seller123',
      role: 'seller',
      isEmailVerified: true,
      sellerInfo: {
        shopName: 'Earth Crafts',
        location: 'Gujarat, India',
        bio: 'Handmade eco-friendly home decor and bamboo products.',
        isApproved: true,
        sellerScore: 88,
      }
    });
    
    const sellers = [seller1, seller2];
    console.log('🏪 Sellers created.');

    // 4. Create Customers
    const customer = await User.create({
      name: 'Rahul Gupta',
      email: 'user@example.com',
      password: 'user123',
      role: 'customer',
      isEmailVerified: true,
      walletBalance: 500,
      address: {
        street: '123 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001'
      }
    });

    // 5. Create Products
    const products = await Product.insertMany([
      {
        name: 'Pure Neem Wood Comb',
        description: 'Handcrafted neem wood comb. Prevents dandruff, promotes hair growth, and reduces hair fall. 100% natural and eco-friendly.',
        price: 249,
        originalPrice: 399,
        category: 'Hair Care',
        sku: 'HW-NEEM-COMB-01',
        images: ['https://images.unsplash.com/photo-1620061559883-9b6cd5af1758?q=80&w=2070&auto=format&fit=crop'],
        stock: 50,
        seller: sellers[1]._id,
        sellerName: sellers[1].sellerInfo.shopName,
        location: sellers[1].sellerInfo.location,
        isOrganic: true,
        status: 'approved',
        isFeatured: true,
        salesCount: 120,
        ratings: 4.8,
        numReviews: 45,
        tags: ['neem', 'wood', 'haircare', 'eco-friendly'],
      },
      {
        name: 'Organic Ashwagandha Powder',
        description: 'Premium quality sun-dried Ashwagandha root powder. Helps relieve stress, increase energy levels and improve concentration.',
        price: 499,
        originalPrice: 750,
        category: 'Ayurvedic Wellness',
        sku: 'AY-ASHW-PWD-01',
        images: ['https://images.unsplash.com/photo-1596541604085-f55cf5df3927?q=80&w=2070&auto=format&fit=crop'],
        stock: 120,
        seller: sellers[0]._id,
        sellerName: sellers[0].sellerInfo.shopName,
        location: sellers[0].sellerInfo.location,
        isOrganic: true,
        status: 'approved',
        isFeatured: true,
        salesCount: 300,
        ratings: 4.9,
        numReviews: 120,
        tags: ['ashwagandha', 'immunity', 'organic', 'powder'],
      },
      {
        name: 'Handmade Bamboo Toothbrush Set (Pack of 4)',
        description: 'Biodegradable bamboo toothbrushes with charcoal-infused bristles. Go plastic-free with this family pack.',
        price: 349,
        originalPrice: 499,
        category: 'Earth Crafts',
        sku: 'EC-BAM-TB-04',
        images: ['https://images.unsplash.com/photo-1606788574443-4dc97d025b6a?q=80&w=2070&auto=format&fit=crop'],
        stock: 200,
        seller: sellers[1]._id,
        sellerName: sellers[1].sellerInfo.shopName,
        location: sellers[1].sellerInfo.location,
        isOrganic: false,
        status: 'approved',
        isFeatured: false,
        salesCount: 85,
        ratings: 4.6,
        numReviews: 32,
        tags: ['bamboo', 'toothbrush', 'plastic-free'],
      },
      {
        name: 'Cold-Pressed Virgin Coconut Oil 500ml',
        description: '100% pure, cold-pressed virgin coconut oil. Ideal for cooking, skin care, and hair care. Extracted from fresh coconut milk.',
        price: 599,
        originalPrice: 850,
        category: 'Kitchen Essentials',
        sku: 'KE-COCO-OIL-500',
        images: ['https://images.unsplash.com/photo-1611078732049-57adbd015b63?q=80&w=2069&auto=format&fit=crop'],
        stock: 45,
        seller: sellers[0]._id,
        sellerName: sellers[0].sellerInfo.shopName,
        location: sellers[0].sellerInfo.location,
        isOrganic: true,
        status: 'approved',
        isFeatured: true,
        lowStockThreshold: 50, // Triggers AI alert
        salesCount: 450,
        ratings: 4.9,
        numReviews: 210,
        tags: ['coconut oil', 'cooking', 'skincare', 'cold-pressed'],
      }
    ]);
    console.log(`🛍️  ${products.length} Products created.`);

    // 6. Create Initial Order
    await Order.create({
      user: customer._id,
      items: [
        {
          product: products[0]._id,
          name: products[0].name,
          qty: 2,
          price: products[0].price,
          image: products[0].images[0],
          seller: products[0].seller
        }
      ],
      shippingAddress: {
        fullName: customer.name,
        address: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        pincode: customer.address.pincode,
        phone: '9876543210'
      },
      paymentMethod: 'cod',
      paymentStatus: 'Pending',
      itemsPrice: products[0].price * 2,
      shippingPrice: 49,
      totalPrice: (products[0].price * 2) + 49,
      orderStatus: 'Seller Processing',
      statusHistory: [
        { status: 'Order Placed', note: 'Order received via COD' },
        { status: 'Seller Processing', note: 'Seller is packing the item' }
      ]
    });
    console.log('📦 Sample Order created.');

    console.log('✅ Seeding complete! You can now login with:');
    console.log('Admin: admin@plantbase.com / admin123');
    console.log('Seller: aarav@organics.com / seller123');
    console.log('User: user@example.com / user123');
    
    process.exit(0);
  } catch (err) {
    if (err.name === 'ValidationError') {
      console.error('❌ Validation Error:', err.message);
    } else {
      console.error('❌ Seeding failed:', err.message || err);
    }
    process.exit(1);
  }
};

seedDB();