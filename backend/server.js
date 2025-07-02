const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize, testConnection } = require('./config/database');
const { initializeDatabase } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adRoutes = require('./routes/ads');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

// Load environment variables
dotenv.config();

// Debug: Check critical environment variables
console.log('Environment check:');
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST ? 'Set' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME ? 'Set' : 'NOT SET');
console.log('DB_USER:', process.env.DB_USER ? 'Set' : 'NOT SET');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Set' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'NOT SET');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'NOT SET');
console.log('GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'NOT SET');
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'NOT SET');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:8080', 'https://xsmmarket.com', 'http://xsmmarket.com'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:8080', 'https://xsmmarket.com', 'http://xsmmarket.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', require('./routes/contact'));
app.use('/api/social-media', require('./routes/social-media-enhanced'));
app.use('/api/debug', require('./routes/debug'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Socket.IO connection handling
const activeUsers = new Map(); // Store active users and their socket IDs

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Handle user authentication and joining
  socket.on('user_connected', (userData) => {
    if (userData && userData.userId) {
      activeUsers.set(userData.userId, socket.id);
      socket.userId = userData.userId;
      console.log(`👤 User ${userData.userId} connected with socket ${socket.id}`);
    }
  });

  // Join a chat room
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`🏠 User ${socket.userId} joined chat ${chatId}`);
  });

  // Leave a chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`🚪 User ${socket.userId} left chat ${chatId}`);
  });

  // Handle sending messages
  socket.on('send_message', (messageData) => {
    // Broadcast to all users in the chat room except sender
    socket.to(`chat_${messageData.chatId}`).emit('new_message', messageData);
    console.log(`💬 Message sent to chat ${messageData.chatId}`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`chat_${data.chatId}`).emit('user_typing', {
      userId: socket.userId,
      chatId: data.chatId,
      username: data.username
    });
  });

  socket.on('stop_typing', (data) => {
    socket.to(`chat_${data.chatId}`).emit('user_stop_typing', {
      userId: socket.userId,
      chatId: data.chatId
    });
  });

  // Handle message read status
  socket.on('mark_messages_read', (data) => {
    socket.to(`chat_${data.chatId}`).emit('messages_read', {
      chatId: data.chatId,
      userId: socket.userId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      console.log(`👋 User ${socket.userId} disconnected`);
    }
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// MariaDB Connection and Server Start
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.log('⚠️ Starting server without database connection...');
    }

    // Initialize database with associations (non-blocking)
    try {
      await initializeDatabase();
    } catch (error) {
      console.error('⚠️ Database initialization had issues, but continuing...', error.message);
    }

    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💬 Socket.IO enabled for real-time chat`);
      console.log(`🔗 Server URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

// Global error handlers
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});
