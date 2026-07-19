const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true, index: true },
  dailySales: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  cancelledOrders: { type: Number, default: 0 },
  traffic: { type: Number, default: 0 },
  uniqueVisitors: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  avgOrderValue: { type: Number, default: 0 },
  cartAbandonment: { type: Number, default: 0 },
  returningCustomers: { type: Number, default: 0 },

  topProducts: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    views: Number,
    sales: Number,
    revenue: Number
  }],

  topSearches: [{
    term: String,
    count: Number
  }],

  categoryRevenue: [{
    category: String,
    revenue: Number,
    orders: Number
  }],

  cityWiseSales: [{
    city: String,
    state: String,
    orders: Number,
    revenue: Number
  }],

  deviceStats: {
    desktop: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 }
  },

  // Hourly breakdown for realtime
  hourlyOrders: [{ hour: Number, count: Number, revenue: Number }]
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
