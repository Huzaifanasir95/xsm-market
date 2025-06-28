#!/usr/bin/env node

/**
 * XSM Market Production Database Cleaner
 * Ensures a completely clean start for production deployment
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🧹 XSM Market Production Database Cleaner');
console.log('==========================================');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

async function cleanProductionDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to production database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Show current status
    console.log('\n📊 Current Database Status:');
    console.log('──────────────────────────');
    
    try {
      const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
      const [adCount] = await connection.execute('SELECT COUNT(*) as count FROM ads');
      
      console.log(`👥 Users: ${userCount[0].count}`);
      console.log(`📢 Ads: ${adCount[0].count}`);
    } catch (error) {
      console.log('ℹ️  Tables may not exist yet - will be created');
    }
    
    // Clean all data
    console.log('\n🗑️  Cleaning all data...');
    console.log('─────────────────────────');
    
    // Drop and recreate tables for a completely fresh start
    await connection.execute('DROP TABLE IF EXISTS ads');
    await connection.execute('DROP TABLE IF EXISTS users');
    console.log('✅ Dropped existing tables');
    
    // Create fresh tables that match Sequelize models
    await connection.execute(`
      CREATE TABLE users (
        id int(11) NOT NULL AUTO_INCREMENT,
        username varchar(50) NOT NULL UNIQUE,
        fullName varchar(100),
        email varchar(255) NOT NULL UNIQUE,
        password varchar(255),
        profilePicture text,
        firstName varchar(100),
        lastName varchar(100),
        phone varchar(20),
        avatar text,
        googleId varchar(100) UNIQUE,
        authProvider enum('email', 'google') DEFAULT 'email',
        isEmailVerified tinyint(1) DEFAULT 0,
        emailOTP varchar(100),
        otpExpires datetime,
        passwordResetToken varchar(255),
        passwordResetExpires datetime,
        lastLogin datetime,
        isActive tinyint(1) DEFAULT 1,
        isVerified tinyint(1) DEFAULT 0,
        isAdmin tinyint(1) DEFAULT 0,
        createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_email (email),
        KEY idx_username (username),
        KEY idx_googleId (googleId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created fresh users table');
    
    await connection.execute(`
      CREATE TABLE ads (
        id int(11) NOT NULL AUTO_INCREMENT,
        userId int(11) NOT NULL,
        title varchar(255) NOT NULL,
        description text,
        channelUrl varchar(500) NOT NULL,
        platform enum('facebook','instagram','twitter','tiktok','youtube') NOT NULL,
        category varchar(100) NOT NULL,
        contentType enum('Unique content','Rewritten','Not unique content','Mixed'),
        contentCategory varchar(100),
        price decimal(10,2) NOT NULL,
        subscribers int(11) DEFAULT 0,
        monthlyIncome decimal(10,2) DEFAULT 0.00,
        isMonetized tinyint(1) NOT NULL DEFAULT 0,
        incomeDetails text,
        promotionDetails text,
        status enum('active','pending','sold','suspended','rejected') NOT NULL DEFAULT 'active',
        verified tinyint(1) NOT NULL DEFAULT 0,
        premium tinyint(1) NOT NULL DEFAULT 0,
        views int(11) NOT NULL DEFAULT 0,
        totalViews bigint(20) DEFAULT 0,
        rating decimal(2,1) DEFAULT 0.0,
        thumbnail text,
        screenshots longtext,
        tags longtext,
        adminNotes text,
        soldAt datetime DEFAULT NULL,
        soldTo int(11) DEFAULT NULL,
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id),
        KEY idx_userId (userId),
        KEY idx_platform (platform),
        KEY idx_category (category),
        KEY idx_status (status),
        KEY idx_price (price),
        KEY idx_createdAt (createdAt),
        KEY fk_soldTo (soldTo),
        CONSTRAINT ads_ibfk_1 FOREIGN KEY (userId) REFERENCES users (id),
        CONSTRAINT ads_ibfk_2 FOREIGN KEY (soldTo) REFERENCES users (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created fresh ads table');
    
    // Verify clean state
    const [finalUserCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [finalAdCount] = await connection.execute('SELECT COUNT(*) as count FROM ads');
    
    console.log('\n🎉 Production Database Ready!');
    console.log('════════════════════════════');
    console.log(`👥 Users: ${finalUserCount[0].count} (clean start)`);
    console.log(`📢 Ads: ${finalAdCount[0].count} (clean start)`);
    console.log('\n✅ Database is completely clean and ready for production');
    console.log('🚀 Users can now register and create ads normally');
    
  } catch (error) {
    console.error('\n❌ Database cleanup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check database connection settings in .env');
    console.error('2. Ensure database user has CREATE, DROP, and ALTER privileges');
    console.error('3. Verify database exists and is accessible');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔐 Database connection closed');
    }
  }
}

// Run cleanup
cleanProductionDatabase();
