#!/usr/bin/env node

/**
 * XSM Market - Simple Local Database Setup
 * Creates the complete database schema for local development
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'xsm_user',
  password: process.env.DB_PASSWORD || 'localpassword123',
  database: process.env.DB_NAME || 'xsm_market_local',
  port: process.env.DB_PORT || 3306
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🚀 Setting up XSM Market local database...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Drop existing tables
    console.log('🧹 Cleaning existing tables...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('DROP TABLE IF EXISTS ads');
    await connection.execute('DROP TABLE IF EXISTS users');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Tables cleaned');

    // Create users table
    console.log('👥 Creating users table...');
    await connection.execute(`
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
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Users table created');

    // Create ads table
    console.log('📢 Creating ads table...');
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
        CONSTRAINT ads_ibfk_1 FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Ads table created');

    // Insert sample users
    console.log('👤 Creating user accounts...');
    await connection.execute(`
      INSERT INTO users (username, fullName, email, password, authProvider, isEmailVerified, isVerified) VALUES 
      ('hamza_sheikh', 'Hamza Sheikh', 'hamzasheikh1228@gmail.com', '$2a$10$nOUWNMhKqFDqfKCYnCE5deVfTtYyoKyqxNrJBF0UhSpbUtpwPKyyu', 'email', 1, 1),
      ('admin', 'XSM Admin', 'admin@xsmmarket.com', '$2a$10$rQF8H.ykB89ErFhCdyFNueJE/cIc6xwKGZ4jKl6.nV7TgELYqH7E6', 'email', 1, 1)
    `);
    console.log('✅ User accounts created');

    // Insert sample ads
    console.log('📝 Creating sample ads...');
    await connection.execute(`
      INSERT INTO ads (userId, title, description, channelUrl, platform, category, contentType, price, subscribers, monthlyIncome, isMonetized, status) VALUES
      (1, 'Gaming Channel - 50K Subscribers', 'Established gaming channel with consistent content and engaged audience.', 'https://youtube.com/channel/UCX6OQ3DkcsbYNE6H8uQQuVA', 'youtube', 'Gaming', 'Unique content', 2500.00, 50000, 800.00, 1, 'active'),
      (1, 'Tech Review Channel', 'Professional tech review channel with high-quality content.', 'https://youtube.com/channel/sample2', 'youtube', 'Tech', 'Unique content', 5000.00, 120000, 1500.00, 1, 'active'),
      (1, 'Cars & Bikes Channel', 'Automotive content with detailed reviews and tutorials.', 'https://youtube.com/channel/sample3', 'youtube', 'Cars & Bikes', 'Mixed', 3200.00, 85000, 900.00, 1, 'active'),
      (2, 'Lifestyle Instagram', 'Popular lifestyle Instagram account with high engagement rate.', 'https://instagram.com/lifestyle_sample', 'instagram', 'Lifestyle', 'Mixed', 1200.00, 25000, 300.00, 1, 'active'),
      (2, 'Cooking TikTok Account', 'Viral cooking TikTok account with millions of views.', 'https://tiktok.com/@cooking_viral', 'tiktok', 'Food', 'Unique content', 800.00, 75000, 400.00, 0, 'active')
    `);
    console.log('✅ Sample ads created');

    // Verify setup
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [adCount] = await connection.execute('SELECT COUNT(*) as count FROM ads');
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('📊 Summary:');
    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Ads: ${adCount[0].count}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Your Account: hamzasheikh1228@gmail.com / Hello12@');
    console.log('   Admin Account: admin@xsmmarket.com / admin123');
    console.log('\n🚀 Ready to start development!');
    console.log('   Backend: cd backend && npm run dev');
    console.log('   Frontend: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();
