const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ads');
const userRoutes = require('./routes/user');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

// CORS configuration for production
const corsOptions = {
  origin: [
    'https://xsmmarket.com', 
    'https://www.xsmmarket.com',
    'http://localhost:3000', // For development
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging for production (minimal)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Only log errors in production
    next();
  });
} else {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/user', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'XSM Market API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint for API
app.get('/api', (req, res) => {
  res.json({
    message: 'XSM Market API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/auth',
      ads: '/api/ads', 
      user: '/api/user',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🔄 Initializing XSM Market API...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME}`);
    
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log('🚀 XSM Market API Server Status:');
      console.log(`   ✅ Running on port ${PORT}`);
      console.log(`   ✅ Database connected`);
      console.log(`   ✅ Environment: ${process.env.NODE_ENV}`);
      console.log(`   ✅ CORS enabled for production domains`);
      console.log(`   🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log('📊 Server ready to handle requests!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error('Error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

startServer();

module.exports = app;
