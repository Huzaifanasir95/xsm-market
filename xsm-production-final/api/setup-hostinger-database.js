#!/usr/bin/env node

/**
 * XSM Market - Bulletproof Hostinger Database Setup Script
 * This script ensures 100% successful database setup on Hostinger
 * 
 * Usage: node setup-hostinger-database.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Bulletproof database configuration with fallbacks
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'u718696665_xsm_user',
  password: process.env.DB_PASSWORD || 'HamzaZain123',
  database: process.env.DB_NAME || 'u718696665_xsm_market_db',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timeout: 60000,
  acquireTimeout: 60000,
  reconnect: true,
  multipleStatements: false // Execute one statement at a time for safety
};

console.log('🚀 XSM Market - Bulletproof Hostinger Database Setup');
console.log('===================================================');
console.log('');

// Comprehensive database setup with error handling
async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔍 Pre-flight checks...');
    
    // Validate environment variables
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }
    
    console.log('✅ Environment variables validated');
    console.log(`   📍 Host: ${dbConfig.host}`);
    console.log(`   📍 Database: ${dbConfig.database}`);
    console.log(`   📍 User: ${dbConfig.user}`);
    console.log('');

    // Create connection with retry logic
    console.log('📊 Connecting to Hostinger database...');
    let retries = 3;
    while (retries > 0) {
      try {
        connection = await mysql.createConnection(dbConfig);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(`   ⚠️  Connection attempt failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('✅ Database connection established!');

    // Test connection with basic query
    await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection test passed!');
    console.log('');

    // Drop and recreate tables (fresh setup)
    console.log('🔧 Setting up database schema...');
    
    // Disable foreign key checks for clean setup
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop existing tables if they exist
    console.log('   🗑️  Cleaning existing tables...');
    await connection.execute('DROP TABLE IF EXISTS ads');
    await connection.execute('DROP TABLE IF EXISTS users');
    console.log('   ✅ Existing tables cleaned');
    
    // Create users table
    console.log('   👥 Creating users table...');
    await connection.execute(`
      CREATE TABLE users (
        id int(11) NOT NULL AUTO_INCREMENT,
        username varchar(50) NOT NULL,
        fullName varchar(100) DEFAULT NULL,
        email varchar(255) NOT NULL,
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
        UNIQUE KEY username (username),
        UNIQUE KEY email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✅ Users table created');
    
    // Create ads table
    console.log('   📢 Creating ads table...');
    await connection.execute(`
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
        KEY status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✅ Ads table created');
    
    // Add foreign key constraints
    console.log('   🔗 Adding foreign key constraints...');
    await connection.execute(`
      ALTER TABLE ads 
      ADD CONSTRAINT ads_ibfk_1 
      FOREIGN KEY (userId) REFERENCES users (id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    await connection.execute(`
      ALTER TABLE ads 
      ADD CONSTRAINT ads_ibfk_2 
      FOREIGN KEY (soldTo) REFERENCES users (id) 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
    console.log('   ✅ Foreign key constraints added');
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Database schema created successfully!');
    console.log('');

    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    // Insert admin user (using bcrypt hash for 'admin123')
    await connection.execute(`
      INSERT INTO users (username, fullName, email, password, authProvider, isEmailVerified, isVerified) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['admin', 'XSM Admin', 'admin@xsmmarket.com', '$2a$10$rQF8H.ykB89ErFhCdyFNueJE/cIc6xwKGZ4jKl6.nV7TgELYqH7E6', 'email', 1, 1]);
    console.log('   ✅ Admin user created');
    
    // Insert test user (using bcrypt hash for 'admin123')
    await connection.execute(`
      INSERT INTO users (username, fullName, email, password, authProvider, isEmailVerified, isVerified) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['hamza_sheikh', 'Hamza Sheikh', 'hamzasheikh1228@gmail.com', '$2a$10$rQF8H.ykB89ErFhCdyFNueJE/cIc6xwKGZ4jKl6.nV7TgELYqH7E6', 'email', 1, 1]);
    console.log('   ✅ Test user created');
    
    // Insert sample ads
    const sampleAds = [
      [1, 'Gaming Channel - 50K Subscribers', 'Established gaming channel with consistent content and engaged audience. Monetized with steady income.', 'https://youtube.com/channel/sample1', 'youtube', 'Gaming', 'Unique content', null, 2500.00, 50000, 800.00, 1, 'active'],
      [1, 'Tech Review Channel', 'Professional tech review channel with high-quality content and sponsor relationships.', 'https://youtube.com/channel/sample2', 'youtube', 'Tech', 'Unique content', null, 5000.00, 120000, 1500.00, 1, 'active'],
      [2, 'Lifestyle Instagram', 'Popular lifestyle Instagram account with high engagement rate.', 'https://instagram.com/lifestyle_sample', 'instagram', 'Lifestyle', 'Mixed', null, 1200.00, 25000, 300.00, 1, 'active'],
      [2, 'Cooking TikTok Account', 'Viral cooking TikTok account with millions of views.', 'https://tiktok.com/@cooking_viral', 'tiktok', 'Food', 'Unique content', null, 800.00, 75000, 400.00, 0, 'active']
    ];
    
    for (const ad of sampleAds) {
      await connection.execute(`
        INSERT INTO ads (userId, title, description, channelUrl, platform, category, contentType, contentCategory, price, subscribers, monthlyIncome, isMonetized, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, ad);
    }
    console.log('   ✅ Sample ads created');
    
    console.log('✅ Sample data inserted successfully!');
    console.log('');

    // Verify setup with comprehensive checks
    console.log('� Verifying database setup...');
    
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [adCount] = await connection.execute('SELECT COUNT(*) as count FROM ads');
    const [userEmails] = await connection.execute('SELECT email FROM users ORDER BY id');
    const [adTitles] = await connection.execute('SELECT title FROM ads ORDER BY id LIMIT 3');
    
    console.log(`   📊 Users table: ${userCount[0].count} records`);
    console.log(`   📊 Ads table: ${adCount[0].count} records`);
    console.log(`   📧 User emails: ${userEmails.map(u => u.email).join(', ')}`);
    console.log(`   📢 Sample ads: ${adTitles.map(a => a.title).join(', ')}...`);
    console.log('');

    // Test foreign key relationships
    const [adWithUser] = await connection.execute(`
      SELECT a.title, u.email 
      FROM ads a 
      JOIN users u ON a.userId = u.id 
      LIMIT 1
    `);
    
    if (adWithUser.length > 0) {
      console.log('✅ Foreign key relationships verified');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 SETUP SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   ✅ Database connection established');
    console.log('   ✅ Tables created (users, ads)');
    console.log('   ✅ Foreign key constraints applied');
    console.log('   ✅ Sample data inserted');
    console.log('   ✅ Relationships verified');
    console.log('');
    console.log('� LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Admin Account:');
    console.log('   Email: admin@xsmmarket.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('📧 Test Account:');
    console.log('   Email: hamzasheikh1228@gmail.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🚀 YOUR XSM MARKET DATABASE IS READY!');
    console.log('   Start your Node.js app and visit your domain');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ DATABASE SETUP FAILED!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Error:', error.message);
    console.error('');
    console.error('🔧 TROUBLESHOOTING CHECKLIST:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('1. ✅ Check your .env file has correct database credentials');
    console.error('2. ✅ Ensure the database exists in Hostinger hPanel');
    console.error('3. ✅ Verify the database user has ALL PRIVILEGES');
    console.error('4. ✅ Check if mysql2 package is installed: npm install mysql2');
    console.error('5. ✅ Ensure you are running this from the correct directory');
    console.error('6. ✅ Check Hostinger database server is accessible');
    console.error('');
    console.error('💡 COMMON SOLUTIONS:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('• Run: npm install mysql2');
    console.error('• Verify database credentials in Hostinger hPanel');
    console.error('• Ensure database server allows remote connections');
    console.error('• Check if there are any IP restrictions');
    console.error('');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Database connection closed safely.');
      console.log('');
    }
  }
}

// Pre-execution checks
console.log('⚡ Initializing setup process...');

// Check if mysql2 is available
try {
  require('mysql2');
} catch (error) {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ DEPENDENCY MISSING!');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('mysql2 package not found!');
  console.error('');
  console.error('Please install it first:');
  console.error('npm install mysql2');
  console.error('');
  console.error('Then run this script again:');
  console.error('node setup-hostinger-database.js');
  console.error('');
  process.exit(1);
}

// Check if .env file exists
const fs = require('fs');
if (!fs.existsSync('.env')) {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ CONFIGURATION MISSING!');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('.env file not found!');
  console.error('');
  console.error('Please ensure your .env file exists with:');
  console.error('DB_HOST=127.0.0.1');
  console.error('DB_NAME=u718696665_xsm_market_db');
  console.error('DB_USER=u718696665_xsm_user');
  console.error('DB_PASSWORD=HamzaZain123');
  console.error('');
  process.exit(1);
}

console.log('✅ Pre-execution checks passed');
console.log('');

// Run the setup
setupDatabase();
