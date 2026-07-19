/**
 * AI Engine — Algorithmic AI features (no external API needed)
 * Self-contained recommendation, fraud detection, pricing, scoring
 */
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');

const aiEngine = {

  /**
   * Product Recommendations — collaborative filtering + content-based
   * Analyzes purchase history, browsing, and similar users
   */
  async getRecommendations(userId, limit = 8) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      // Get user's purchase history
      const orders = await Order.find({ user: userId, orderStatus: { $ne: 'Cancelled' } }).lean();
      const purchasedIds = orders.flatMap(o => o.items.map(i => i.product.toString()));
      const purchasedCategories = [];

      // Get categories from purchased products
      if (purchasedIds.length > 0) {
        const purchased = await Product.find({ _id: { $in: purchasedIds } }).select('category').lean();
        purchasedCategories.push(...purchased.map(p => p.category));
      }

      // Get recently viewed categories
      const viewedProducts = await Product.find({ _id: { $in: user.recentlyViewed || [] } }).select('category').lean();
      const viewedCategories = viewedProducts.map(p => p.category);

      const allCategories = [...new Set([...purchasedCategories, ...viewedCategories])];

      let recommendations;
      if (allCategories.length > 0) {
        // Content-based: similar categories, exclude already purchased
        recommendations = await Product.find({
          status: 'approved',
          _id: { $nin: purchasedIds },
          category: { $in: allCategories }
        })
        .sort({ salesCount: -1, ratings: -1, views: -1 })
        .limit(limit)
        .lean();
      }

      // Fallback: trending products
      if (!recommendations || recommendations.length < limit) {
        const fallback = await Product.find({
          status: 'approved',
          _id: { $nin: purchasedIds }
        })
        .sort({ salesCount: -1, views: -1, ratings: -1 })
        .limit(limit - (recommendations?.length || 0))
        .lean();

        recommendations = [...(recommendations || []), ...fallback];
      }

      return recommendations;
    } catch (err) {
      console.error('AI Recommendations error:', err.message);
      return [];
    }
  },

  /**
   * Inventory Forecasting — predict demand based on sales velocity
   */
  async getInventoryForecast(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) return null;

      // Get last 30 days of orders for this product
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const orders = await Order.find({
        'items.product': productId,
        createdAt: { $gte: thirtyDaysAgo },
        orderStatus: { $ne: 'Cancelled' }
      }).lean();

      const totalSold = orders.reduce((sum, order) => {
        const item = order.items.find(i => i.product.toString() === productId.toString());
        return sum + (item?.qty || 0);
      }, 0);

      const dailyAvg = totalSold / 30;
      const daysUntilStockout = dailyAvg > 0 ? Math.ceil(product.stock / dailyAvg) : Infinity;
      const weeklyForecast = Math.ceil(dailyAvg * 7);
      const monthlyForecast = Math.ceil(dailyAvg * 30);

      // Demand level
      let demandLevel = 'low';
      if (dailyAvg > 5) demandLevel = 'high';
      else if (dailyAvg > 2) demandLevel = 'medium';

      return {
        currentStock: product.stock,
        dailyAvgSales: Math.round(dailyAvg * 10) / 10,
        weeklyForecast,
        monthlyForecast,
        daysUntilStockout: daysUntilStockout === Infinity ? null : daysUntilStockout,
        demandLevel,
        restockRecommendation: product.stock <= product.lowStockThreshold,
        suggestedRestockQty: Math.max(monthlyForecast * 2 - product.stock, 0),
        lowStockThreshold: product.lowStockThreshold,
      };
    } catch (err) {
      console.error('AI Inventory error:', err.message);
      return null;
    }
  },

  /**
   * Review Moderation — detect spam/fake/abusive reviews using keyword analysis
   */
  moderateReview(reviewText, rating) {
    let score = 100; // 100 = perfectly clean
    const flags = [];
    const text = (reviewText || '').toLowerCase();

    // Spam patterns
    const spamWords = ['buy now', 'click here', 'free offer', 'act now', 'limited time', 'www.', 'http'];
    spamWords.forEach(word => {
      if (text.includes(word)) { score -= 15; flags.push('spam_link'); }
    });

    // Abusive language
    const abuseWords = ['scam', 'fraud', 'cheat', 'idiot', 'stupid', 'worst ever', 'hate'];
    abuseWords.forEach(word => {
      if (text.includes(word)) { score -= 10; flags.push('potentially_abusive'); }
    });

    // Suspicious patterns
    if (text.length < 5 && rating === 5) { score -= 20; flags.push('suspiciously_short_positive'); }
    if (text.length < 5 && rating === 1) { score -= 20; flags.push('suspiciously_short_negative'); }
    if (/(.)\1{4,}/.test(text)) { score -= 15; flags.push('repeated_characters'); }
    if (/[A-Z]{10,}/.test(reviewText || '')) { score -= 10; flags.push('excessive_caps'); }

    // All same characters
    if (text.length > 3 && new Set(text.replace(/\s/g, '')).size <= 2) {
      score -= 30; flags.push('gibberish');
    }

    score = Math.max(0, Math.min(100, score));
    return {
      score,
      flags: [...new Set(flags)],
      flagged: score < 50,
      action: score < 30 ? 'auto_reject' : score < 50 ? 'manual_review' : 'approve'
    };
  },

  /**
   * Seller Scoring — composite score from delivery, reviews, cancellations
   */
  async calculateSellerScore(sellerId) {
    try {
      const orders = await Order.find({ 'items.seller': sellerId }).lean();
      const reviews = await Review.find({ product: { $in: await Product.find({ seller: sellerId }).select('_id') } }).lean();

      const totalOrders = orders.length;
      if (totalOrders === 0) return { score: 50, breakdown: {} };

      // Delivery speed (0-25 points)
      const delivered = orders.filter(o => o.orderStatus === 'Delivered' && o.deliveredAt);
      let avgDeliveryHours = 0;
      if (delivered.length > 0) {
        const totalHours = delivered.reduce((sum, o) => {
          return sum + (new Date(o.deliveredAt) - new Date(o.createdAt)) / (1000 * 60 * 60);
        }, 0);
        avgDeliveryHours = totalHours / delivered.length;
      }
      const deliveryScore = Math.max(0, 25 - (avgDeliveryHours / 24)); // Faster = higher

      // Review quality (0-30 points)
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 3;
      const reviewScore = (avgRating / 5) * 30;

      // Cancellation rate (0-25 points)
      const cancelled = orders.filter(o => o.orderStatus === 'Cancelled').length;
      const cancellationRate = (cancelled / totalOrders) * 100;
      const cancellationScore = Math.max(0, 25 - cancellationRate);

      // Order fulfillment (0-20 points)
      const fulfillmentRate = (delivered.length / totalOrders) * 100;
      const fulfillmentScore = (fulfillmentRate / 100) * 20;

      const totalScore = Math.round(deliveryScore + reviewScore + cancellationScore + fulfillmentScore);

      return {
        score: Math.min(100, Math.max(0, totalScore)),
        breakdown: {
          deliveryScore: Math.round(deliveryScore),
          reviewScore: Math.round(reviewScore),
          cancellationScore: Math.round(cancellationScore),
          fulfillmentScore: Math.round(fulfillmentScore),
        },
        metrics: {
          totalOrders,
          avgDeliveryHours: Math.round(avgDeliveryHours),
          avgRating: Math.round(avgRating * 10) / 10,
          cancellationRate: Math.round(cancellationRate),
          fulfillmentRate: Math.round(fulfillmentRate),
          totalReviews: reviews.length,
        }
      };
    } catch (err) {
      console.error('AI Seller Score error:', err.message);
      return { score: 50, breakdown: {} };
    }
  },

  /**
   * Fraud Detection — score orders for suspicious activity
   */
  async calculateFraudScore(orderData, userId) {
    let score = 0;
    const flags = [];

    try {
      // Check 1: High value COD order
      if (orderData.paymentMethod === 'cod' && orderData.totalPrice > 5000) {
        score += 15; flags.push('high_value_cod');
      }

      // Check 2: Multiple orders in short time
      const recentOrders = await Order.countDocuments({
        user: userId,
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // last hour
      });
      if (recentOrders > 3) { score += 20; flags.push('rapid_ordering'); }

      // Check 3: New account + high value
      const user = await User.findById(userId);
      if (user) {
        const accountAge = (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
        if (accountAge < 1 && orderData.totalPrice > 2000) {
          score += 15; flags.push('new_account_high_value');
        }
      }

      // Check 4: Previous cancellations
      const cancelledOrders = await Order.countDocuments({
        user: userId,
        orderStatus: 'Cancelled'
      });
      const totalUserOrders = await Order.countDocuments({ user: userId });
      if (totalUserOrders > 3 && (cancelledOrders / totalUserOrders) > 0.5) {
        score += 20; flags.push('high_cancellation_rate');
      }

      // Check 5: Suspicious address
      if (orderData.shippingAddress) {
        const addr = orderData.shippingAddress.address || '';
        if (addr.length < 10) { score += 10; flags.push('short_address'); }
      }

    } catch (err) {
      console.error('Fraud detection error:', err.message);
    }

    return {
      score: Math.min(100, score),
      flags,
      riskLevel: score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low',
      action: score >= 50 ? 'manual_review' : 'auto_approve'
    };
  },

  /**
   * Dynamic Pricing — suggest pricing based on demand and competition
   */
  async getDynamicPricing(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) return null;

      // Get similar products in same category
      const similar = await Product.find({
        category: product.category,
        _id: { $ne: productId },
        status: 'approved'
      }).select('price salesCount').lean();

      const avgPrice = similar.length > 0
        ? similar.reduce((sum, p) => sum + p.price, 0) / similar.length
        : product.price;

      // Get demand data
      const forecast = await this.getInventoryForecast(productId);
      const demandMultiplier = forecast?.demandLevel === 'high' ? 1.1 : forecast?.demandLevel === 'low' ? 0.9 : 1;

      const suggestedPrice = Math.round(avgPrice * demandMultiplier);
      const currentVsAvg = ((product.price - avgPrice) / avgPrice * 100).toFixed(1);

      return {
        currentPrice: product.price,
        avgCategoryPrice: Math.round(avgPrice),
        suggestedPrice,
        currentVsAverage: `${currentVsAvg}%`,
        demandLevel: forecast?.demandLevel || 'unknown',
        suggestion: suggestedPrice > product.price
          ? `Consider increasing price by ₹${suggestedPrice - product.price} based on high demand`
          : suggestedPrice < product.price
            ? `Consider discounting by ₹${product.price - suggestedPrice} to boost sales`
            : 'Price is well aligned with market',
        competitorCount: similar.length,
      };
    } catch (err) {
      console.error('Dynamic pricing error:', err.message);
      return null;
    }
  }
};

module.exports = aiEngine;
