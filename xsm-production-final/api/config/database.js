const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '+00:00'
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MariaDB connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to MariaDB:', error.message);
    return false;
  }
};

// Initialize database connection
const initializeDatabase = async () => {
  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database models (create tables if they don't exist)
    console.log('🔄 Synchronizing database models...');
    await sequelize.sync({ alter: false }); // Don't alter existing tables
    console.log('✅ Database models synchronized.');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase
};
