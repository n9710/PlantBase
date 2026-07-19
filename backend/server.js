require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const setupSocket = require('./socket');
const notificationService = require('./services/notificationService');
const { BRAND_NAME } = require('./constants');

const app = express();
const server = http.createServer(app);

// Connect DB
connectDB();

// Setup Socket.io
const io = setupSocket(server);
notificationService.setIO(io);

// Security
app.use(helmet());
app.use(cookieParser());

// CORS
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production'
//     ? [process.env.FRONTEND_URL || 'https://yourdomain.com']
//     : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, try again later' }
});
app.use('/api', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, try again in 1 minute' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// NoSQL injection sanitization
const sanitizeMongo = (obj) => {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (/^\$/.test(key)) delete obj[key];
      else sanitizeMongo(obj[key]);
    }
  }
};
app.use((req, res, next) => {
  ['body', 'query', 'params'].forEach(k => { if (req[k]) sanitizeMongo(req[k]); });
  next();
});

// XSS sanitization
app.use((req, res, next) => {
  if (req.body) {
    const sanitizeXss = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') obj[key] = obj[key].replace(/[<>]/g, '');
        else if (typeof obj[key] === 'object' && obj[key] !== null) sanitizeXss(obj[key]);
      }
    };
    sanitizeXss(req.body);
  }
  next();
});

// ─── Routes ───
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/seller-profile', require('./routes/sellerProfile'));
app.use('/api/referral', require('./routes/referral'));
app.use('/api/logistics', require('./routes/logistics'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: `${BRAND_NAME} API running`, version: '2.0.0' })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 ${process.env.BRAND_NAME || 'PlantBase'} Server running on port ${PORT}`)
);