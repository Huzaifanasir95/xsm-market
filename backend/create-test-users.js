// Script to create test users
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Try to use Sequelize
async function createSequelizeUsers() {
  try {
    const { sequelize } = require('./config/database');
    const User = require('./models/UserSequelize');
    
    // Make sure tables exist
    await sequelize.sync();
    
    // Create admin user
    const adminUser = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        isEmailVerified: true
      }
    });
    
    // Create regular user
    const regularUser = await User.findOrCreate({
      where: { username: 'user' },
      defaults: {
        username: 'user',
        email: 'user@example.com',
        password: 'user123',
        isEmailVerified: true
      }
    });
    
    console.log('Sequelize users created successfully!');
    console.log('Admin user:', adminUser[0].username, adminUser[0].email);
    console.log('Regular user:', regularUser[0].username, regularUser[0].email);
    
    return true;
  } catch (error) {
    console.error('Error creating Sequelize users:', error);
    return false;
  }
}

// Try to use Mongoose
async function createMongooseUsers() {
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xsm');
    
    // Create admin user
    const adminUser = await User.findOneAndUpdate(
      { username: 'admin' },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        isEmailVerified: true,
        authProvider: 'email'
      },
      { upsert: true, new: true }
    );
    
    // Create regular user
    const regularUser = await User.findOneAndUpdate(
      { username: 'user' },
      {
        username: 'user',
        email: 'user@example.com',
        password: 'user123',
        isEmailVerified: true,
        authProvider: 'email'
      },
      { upsert: true, new: true }
    );
    
    console.log('Mongoose users created successfully!');
    console.log('Admin user:', adminUser.username, adminUser.email);
    console.log('Regular user:', regularUser.username, regularUser.email);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('Error creating Mongoose users:', error);
    return false;
  }
}

// Run both methods
async function createTestUsers() {
  console.log('Creating test users...');
  
  const sequelizeSuccess = await createSequelizeUsers();
  const mongooseSuccess = await createMongooseUsers();
  
  if (sequelizeSuccess || mongooseSuccess) {
    console.log('Test users created successfully!');
    process.exit(0);
  } else {
    console.error('Failed to create test users.');
    process.exit(1);
  }
}

createTestUsers();
