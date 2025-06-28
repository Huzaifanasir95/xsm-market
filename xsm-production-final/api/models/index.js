const { sequelize } = require('../config/database');
const User = require('./UserSequelize');
const Ad = require('./Ad');

// Set up associations
const initializeAssociations = () => {
  // User associations
  User.hasMany(Ad, {
    foreignKey: 'userId',
    as: 'ads',
    onDelete: 'CASCADE'
  });

  User.hasMany(Ad, {
    foreignKey: 'soldTo',
    as: 'purchases',
    onDelete: 'SET NULL'
  });

  // Ad associations
  Ad.belongsTo(User, {
    foreignKey: 'userId',
    as: 'seller',
    onDelete: 'CASCADE'
  });

  Ad.belongsTo(User, {
    foreignKey: 'soldTo',
    as: 'buyer',
    onDelete: 'SET NULL'
  });

  console.log('✅ Database associations initialized');
};

// Initialize database
const initializeDatabase = async () => {
  try {
    // Set up associations
    initializeAssociations();

    // Sync database
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === 'development',
      force: false 
    });

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  initializeAssociations
};
