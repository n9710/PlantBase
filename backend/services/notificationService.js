/**
 * Notification Service — Email + Socket.io notifications
 */
const Notification = require('../models/Notification');
const { BRAND_NAME, BRAND_EMAIL } = require('../constants');

// Socket.io instance (set from server.js)
let io = null;

const notificationService = {
  setIO(socketIO) {
    io = socketIO;
  },

  /**
   * Create notification and push via Socket.io
   */
  async create({ userId, type, title, message, data = {} }) {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        data
      });

      // Push via socket
      if (io) {
        io.to(`user_${userId}`).emit('notification:new', {
          _id: notification._id,
          type,
          title,
          message,
          data,
          read: false,
          createdAt: notification.createdAt
        });
      }

      return notification;
    } catch (err) {
      console.error('Notification creation error:', err.message);
    }
  },

  /**
   * Notify seller of new order
   */
  async notifySellerNewOrder(sellerId, order) {
    return this.create({
      userId: sellerId,
      type: 'order_placed',
      title: 'New Order Received! 🎉',
      message: `You have a new order #${order._id.toString().slice(-6).toUpperCase()} worth ₹${order.totalPrice}`,
      data: { orderId: order._id, link: '/seller' }
    });
  },

  /**
   * Notify customer of order status update
   */
  async notifyOrderUpdate(customerId, order, newStatus) {
    const statusMessages = {
      'Confirmed': 'Your order has been confirmed! 🎉',
      'Seller Processing': 'Seller is preparing your order 📦',
      'Packed': 'Your order is packed and ready to ship! 📦',
      'Shipped': 'Your order is on its way! 🚚',
      'Out for Delivery': 'Your order is out for delivery! 🏃',
      'Delivered': 'Your order has been delivered! ⭐ Please leave a review.',
      'Cancelled': 'Your order has been cancelled.',
    };

    return this.create({
      userId: customerId,
      type: newStatus === 'Delivered' ? 'order_delivered' : newStatus === 'Cancelled' ? 'order_cancelled' : 'order_update',
      title: `Order Update — ${newStatus}`,
      message: statusMessages[newStatus] || `Order status updated to: ${newStatus}`,
      data: { orderId: order._id, link: `/orders/${order._id}/track` }
    });
  },

  /**
   * Notify seller approval/rejection
   */
  async notifySellerApproval(sellerId, approved, reason = '') {
    return this.create({
      userId: sellerId,
      type: approved ? 'seller_approved' : 'seller_rejected',
      title: approved ? `Welcome to ${BRAND_NAME}! 🎉` : 'Application Update',
      message: approved
        ? `Your seller application has been approved. Start listing products!`
        : `Your seller application was not approved. ${reason}`,
      data: { link: approved ? '/seller' : '/seller/apply' }
    });
  },

  /**
   * Notify low stock
   */
  async notifyLowStock(sellerId, product) {
    return this.create({
      userId: sellerId,
      type: 'low_stock',
      title: 'Low Stock Alert ⚠️',
      message: `${product.name} has only ${product.stock} units left. Consider restocking.`,
      data: { productId: product._id, link: '/seller' }
    });
  },

  /**
   * Notify referral reward
   */
  async notifyReferralReward(userId, amount) {
    return this.create({
      userId,
      type: 'referral_reward',
      title: 'Referral Reward! 🎁',
      message: `₹${amount} has been added to your wallet from a referral.`,
      data: { link: '/wallet' }
    });
  },
};

module.exports = notificationService;
