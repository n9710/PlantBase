/**
 * Socket.io Setup — Real-time communication
 * Handles: order notifications, live analytics, chat
 */
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL]
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name role');
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.userName = user.name;
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userName} (${socket.userRole})`);

    // Join personal room
    socket.join(`user_${socket.userId}`);

    // Join role-based rooms
    socket.join(`role_${socket.userRole}`);
    if (socket.userRole === 'admin' || socket.userRole === 'superadmin') {
      socket.join('admin_room');
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.userName}`);
    });

    // Track page views (analytics)
    socket.on('analytics:pageview', (data) => {
      io.to('admin_room').emit('analytics:live', {
        type: 'pageview',
        page: data.page,
        user: socket.userId,
        timestamp: new Date()
      });
    });

    // Mark notification as read
    socket.on('notification:read', async (notificationId) => {
      try {
        const Notification = require('./models/Notification');
        await Notification.findByIdAndUpdate(notificationId, { read: true });
      } catch (err) {
        console.error('Socket notification read error:', err.message);
      }
    });
  });

  return io;
}

module.exports = setupSocket;
