const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// MariaDB Connection and Server Start
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to MariaDB. Exiting...');
      process.exit(1);
    }

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === 'development', // Only alter tables in development
      force: false // Never drop tables in production
    });
    console.log('✅ Database synchronized successfully');

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
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
