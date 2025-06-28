#!/usr/bin/env node

/**
 * XSM Market - Hostinger Database Setup Script
 * Run this script on your Hostinger server to automatically set up the database
 * 
 * Usage: node setup-hostinger-database.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'u718696665_xsm_user',
  password: process.env.DB_PASSWORD || 'HamzaZain123',
  database: process.env.DB_NAME || 'u718696665_xsm_market_db',
  port: process.env.DB_PORT || 3306
};

console.log('🚀 XSM Market - Hostinger Database Setup');
console.log('=========================================');
console.log('');

// Database schema SQL
const createTablesSQL = `
-- Disable foreign key checks during setup
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist (fresh setup)
DROP TABLE IF EXISTS ads;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id int(11) NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL UNIQUE,
  fullName varchar(100) DEFAULT NULL,
  email varchar(255) NOT NULL UNIQUE,
  password varchar(255) DEFAULT NULL,
  profilePicture text DEFAULT NULL,
  googleId varchar(255) DEFAULT NULL,
  authProvider enum('email','google') NOT NULL DEFAULT 'email',
  isEmailVerified tinyint(1) NOT NULL DEFAULT 0,
  isVerified tinyint(1) NOT NULL DEFAULT 0,
  emailOTP varchar(10) DEFAULT NULL,
  otpExpires datetime DEFAULT NULL,
  passwordResetToken varchar(255) DEFAULT NULL,
  passwordResetExpires datetime DEFAULT NULL,
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY username (username),
  KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ads table
CREATE TABLE ads (
  id int(11) NOT NULL AUTO_INCREMENT,
  userId int(11) NOT NULL,
  title varchar(255) NOT NULL,
  description text DEFAULT NULL,
  channelUrl varchar(500) NOT NULL,
  platform enum('facebook','instagram','twitter','tiktok','youtube') NOT NULL,
  category varchar(100) NOT NULL,
  contentType enum('Unique content','Rewritten','Not unique content','Mixed') DEFAULT NULL,
  contentCategory varchar(100) DEFAULT NULL,
  price decimal(10,2) NOT NULL,
  subscribers int(11) DEFAULT 0,
  monthlyIncome decimal(10,2) DEFAULT 0.00,
  isMonetized tinyint(1) NOT NULL DEFAULT 0,
  incomeDetails text DEFAULT NULL,
  promotionDetails text DEFAULT NULL,
  status enum('active','pending','sold','suspended','rejected') NOT NULL DEFAULT 'active',
  verified tinyint(1) NOT NULL DEFAULT 0,
  premium tinyint(1) NOT NULL DEFAULT 0,
  views int(11) NOT NULL DEFAULT 0,
  totalViews bigint(20) DEFAULT 0,
  rating decimal(2,1) DEFAULT 0.0,
  thumbnail text DEFAULT NULL,
  screenshots json DEFAULT NULL,
  tags json DEFAULT NULL,
  adminNotes text DEFAULT NULL,
  soldAt datetime DEFAULT NULL,
  soldTo int(11) DEFAULT NULL,
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY userId (userId),
  KEY soldTo (soldTo),
  KEY platform (platform),
  KEY category (category),
  KEY status (status),
  CONSTRAINT ads_ibfk_1 FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT ads_ibfk_2 FOREIGN KEY (soldTo) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
`;

// Sample data SQL
const insertSampleDataSQL = `
-- Insert sample admin user (password is hashed version of 'admin123')
INSERT INTO users (username, fullName, email, password, authProvider, isEmailVerified, isVerified) VALUES 
('admin', 'XSM Admin', 'admin@xsmmarket.com', '$2a$10$rQF8H.ykB89ErFhCdyFNueJE/cIc6xwKGZ4jKl6.nV7TgELYqH7E6', 'email', 1, 1),
('hamza_sheikh', 'Hamza Sheikh', 'hamzasheikh1228@gmail.com', '$2a$10$rQF8H.ykB89ErFhCdyFNueJE/cIc6xwKGZ4jKl6.nV7TgELYqH7E6', 'email', 1, 1);

-- Insert sample channel listings
INSERT INTO ads (userId, title, description, channelUrl, platform, category, contentType, price, subscribers, monthlyIncome, isMonetized, status) VALUES
(1, 'Gaming Channel - 50K Subscribers', 'Established gaming channel with consistent content and engaged audience. Monetized with steady income.', 'https://youtube.com/channel/sample1', 'youtube', 'Gaming', 'Unique content', 2500.00, 50000, 800.00, 1, 'active'),
(1, 'Tech Review Channel', 'Professional tech review channel with high-quality content and sponsor relationships.', 'https://youtube.com/channel/sample2', 'youtube', 'Tech', 'Unique content', 5000.00, 120000, 1500.00, 1, 'active'),
(2, 'Lifestyle Instagram', 'Popular lifestyle Instagram account with high engagement rate.', 'https://instagram.com/lifestyle_sample', 'instagram', 'Lifestyle', 'Mixed', 1200.00, 25000, 300.00, 1, 'active'),
(2, 'Cooking TikTok Account', 'Viral cooking TikTok account with millions of views.', 'https://tiktok.com/@cooking_viral', 'tiktok', 'Food', 'Unique content', 800.00, 75000, 400.00, 0, 'active');
`;

async function setupDatabase() {
  let connection;
  
  try {
    console.log('📊 Connecting to database...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log('');

    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established!');

    // Test connection
    await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection test passed!');
    console.log('');

    // Create tables
    console.log('🔧 Creating database tables...');
    const statements = createTablesSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.log(`   ⚠️  Statement warning: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Database tables created successfully!');
    console.log('');

    // Insert sample data
    console.log('📝 Inserting sample data...');
    const dataStatements = insertSampleDataSQL.split(';').filter(stmt => stmt.trim());
    
    for (const statement of dataStatements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (error) {
          if (error.message.includes('Duplicate entry')) {
            console.log('   ℹ️  Sample data already exists, skipping...');
          } else {
            console.log(`   ⚠️  Data insertion warning: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Sample data inserted successfully!');
    console.log('');

    // Verify setup
    console.log('🔍 Verifying database setup...');
    
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [adCount] = await connection.execute('SELECT COUNT(*) as count FROM ads');
    
    console.log(`   📊 Users table: ${userCount[0].count} records`);
    console.log(`   📊 Ads table: ${adCount[0].count} records`);
    console.log('');

    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Setup Summary:');
    console.log('   ✅ Database connected');
    console.log('   ✅ Tables created (users, ads)');
    console.log('   ✅ Sample data inserted');
    console.log('   ✅ Foreign key constraints applied');
    console.log('');
    console.log('🚀 Your XSM Market database is ready!');
    console.log('');
    console.log('📧 Default Admin Credentials:');
    console.log('   Email: admin@xsmmarket.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('📧 Test User Credentials:');
    console.log('   Email: hamzasheikh1228@gmail.com');
    console.log('   Password: admin123');
    console.log('');

  } catch (error) {
    console.error('❌ Database setup failed!');
    console.error('Error:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('1. Check your .env file has correct database credentials');
    console.error('2. Ensure the database exists in Hostinger hPanel');
    console.error('3. Verify the database user has proper permissions');
    console.error('4. Check if mysql2 package is installed: npm install mysql2');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Database connection closed.');
    }
  }
}

// Check if mysql2 is available
try {
  require('mysql2');
} catch (error) {
  console.error('❌ mysql2 package not found!');
  console.error('Please install it first: npm install mysql2');
  console.error('Then run this script again.');
  process.exit(1);
}

// Run the setup
console.log('⚡ Starting database setup...');
console.log('');
setupDatabase();
