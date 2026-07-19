const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header first
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Fallback to cookie
    if (!token && req.cookies?.pb_token) {
      token = req.cookies.pb_token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid' });
  }
};

const admin = (req, res, next) => {
  if (req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin only' });
};

const seller = (req, res, next) => {
  if (['seller', 'admin'].includes(req.user.role)) return next();
  return res.status(403).json({ success: false, message: 'Seller only' });
};

module.exports = { protect, admin, seller };