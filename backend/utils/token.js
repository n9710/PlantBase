const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 🔥 reduced from 30d
  );
};

module.exports = generateToken;