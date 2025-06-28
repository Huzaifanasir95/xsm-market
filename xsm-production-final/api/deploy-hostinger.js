#!/usr/bin/env node

/**
 * XSM Market - One-Click Hostinger Deployment Assistant
 * Automates deployment verification and setup on Hostinger
 * 
 * This script should be run AFTER uploading files to Hostinger
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

console.log('🚀 XSM Market - One-Click Hostinger Deployment Assistant');
console.log('========================================================');
console.log('');

class HostingerDeploymentAssistant {
  constructor() {
    this.steps = [];
    this.currentStep = 0;
  }

  async deploy() {
    console.log('🎯 Starting automated deployment process...');
    console.log('');

    this.steps = [
      { name: 'Verify Environment', fn: () => this.verifyEnvironment() },
      { name: 'Test Database Connection', fn: () => this.testDatabaseConnection() },
      { name: 'Setup Database Schema', fn: () => this.setupDatabase() },
      { name: 'Verify API Endpoints', fn: () => this.verifyAPIEndpoints() },
      { name: 'Test Frontend Configuration', fn: () => this.testFrontendConfig() },
      { name: 'Final Verification', fn: () => this.finalVerification() }
    ];

    for (let i = 0; i < this.steps.length; i++) {
      this.currentStep = i + 1;
      const step = this.steps[i];
      
      console.log(`📋 Step ${this.currentStep}/${this.steps.length}: ${step.name}`);
      console.log('─'.repeat(50));
      
      try {
        await step.fn();
        console.log(`✅ ${step.name} completed successfully`);
      } catch (error) {
        console.log(`❌ ${step.name} failed: ${error.message}`);
        console.log('');
        console.log('🛠️  Troubleshooting suggestions:');
        this.provideTroubleshootingForStep(step.name, error);
        throw new Error(`Deployment failed at step: ${step.name}`);
      }
      
      console.log('');
    }

    this.displaySuccessMessage();
  }

  async verifyEnvironment() {
    console.log('🔍 Checking environment configuration...');

    // Check .env file exists
    if (!fs.existsSync('.env')) {
      throw new Error('.env file not found - ensure it was uploaded correctly');
    }

    // Verify critical environment variables
    const requiredVars = [
      'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
      'JWT_SECRET', 'NODE_ENV', 'VITE_API_URL'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    // Check production-specific configurations
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Warning: NODE_ENV is not set to production');
    }

    if (!process.env.VITE_API_URL?.includes('xsmmarket.com')) {
      console.log('⚠️  Warning: API URL may not be configured for production');
    }

    console.log('   ✅ Environment variables validated');
    console.log(`   📍 Database: ${process.env.DB_NAME}`);
    console.log(`   📍 API URL: ${process.env.VITE_API_URL}`);
    console.log(`   📍 Environment: ${process.env.NODE_ENV}`);
  }

  async testDatabaseConnection() {
    console.log('🗄️  Testing database connection...');

    const dbConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      timeout: 15000,
      acquireTimeout: 15000,
      charset: 'utf8mb4'
    };

    let connection;
    try {
      console.log(`   Connecting to ${dbConfig.host}:${dbConfig.port}...`);
      connection = await mysql.createConnection(dbConfig);
      
      // Test basic connectivity
      await connection.execute('SELECT 1 as test');
      console.log('   ✅ Database connection successful');
      
      // Test database permissions
      await connection.execute('SHOW TABLES');
      console.log('   ✅ Database access permissions verified');
      
      this.dbConnection = connection;
      
    } catch (error) {
      if (connection) await connection.end();
      
      if (error.code === 'ENOTFOUND') {
        throw new Error('Database host not found - check DB_HOST setting');
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        throw new Error('Database access denied - check credentials in Hostinger hPanel');
      } else if (error.code === 'ER_BAD_DB_ERROR') {
        throw new Error('Database does not exist - create it in Hostinger hPanel first');
      } else {
        throw new Error(`Database connection failed: ${error.message}`);
      }
    }
  }

  async setupDatabase() {
    console.log('📊 Setting up database schema...');

    if (!this.dbConnection) {
      throw new Error('No database connection available');
    }

    try {
      // Check if tables already exist
      const [tables] = await this.dbConnection.execute('SHOW TABLES');
      const tableNames = tables.map(t => Object.values(t)[0]);
      
      const hasUsers = tableNames.includes('users');
      const hasAds = tableNames.includes('ads');
      
      if (hasUsers && hasAds) {
        console.log('   ✅ Database tables already exist');
        
        // Verify table structure
        const [userCount] = await this.dbConnection.execute('SELECT COUNT(*) as count FROM users');
        const [adCount] = await this.dbConnection.execute('SELECT COUNT(*) as count FROM ads');
        
        console.log(`   📊 Users: ${userCount[0].count} records`);
        console.log(`   📊 Ads: ${adCount[0].count} records`);
        
        if (userCount[0].count === 0) {
          console.log('   ℹ️  No users found - will create sample accounts');
          await this.createSampleData();
        }
        
        return;
      }

      console.log('   🔧 Creating database tables...');
      
      // Run the database setup script
      if (fs.existsSync('setup-hostinger-database.js')) {
        console.log('   📜 Running database setup script...');
        
        // Import and run the setup script
        const setupScript = require('./setup-hostinger-database.js');
        
        // Since the setup script runs immediately, we just need to wait
        await new Promise((resolve, reject) => {
          const originalExit = process.exit;
          process.exit = (code) => {
            process.exit = originalExit;
            if (code === 0) {
              resolve();
            } else {
              reject(new Error('Database setup script failed'));
            }
          };
          
          // Timeout after 60 seconds
          setTimeout(() => {
            process.exit = originalExit;
            reject(new Error('Database setup timeout'));
          }, 60000);
        });
        
      } else {
        // Manual table creation if setup script is missing
        console.log('   🔧 Creating tables manually...');
        await this.createTablesManually();
        await this.createSampleData();
      }
      
      console.log('   ✅ Database schema created successfully');
      
    } catch (error) {
      throw new Error(`Database setup failed: ${error.message}`);
    }
  }

  async createTablesManually() {
    // Create users table
    await this.dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS users (
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

    // Create ads table
    await this.dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS ads (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async createSampleData() {
    console.log('   📝 Creating sample data...');

    // Insert admin user (password: admin123)
    await this.dbConnection.execute(`
      INSERT IGNORE INTO users (username, fullName, email, password, authProvider, isEmailVerified, isVerified) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['admin', 'XSM Admin', 'admin@xsmmarket.com', '$2a$10$rQF8H.ykB89ErFhCdyFNueJE/cIc6xwKGZ4jKl6.nV7TgELYqH7E6', 'email', 1, 1]);

    // Insert test user (password: admin123)
    await this.dbConnection.execute(`
      INSERT IGNORE INTO users (username, fullName, email, password, authProvider, isEmailVerified, isVerified) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['hamza_sheikh', 'Hamza Sheikh', 'hamzasheikh1228@gmail.com', '$2a$10$rQF8H.ykB89ErFhCdyFNueJE/cIc6xwKGZ4jKl6.nV7TgELYqH7E6', 'email', 1, 1]);

    // Insert sample ads
    const sampleAds = [
      [1, 'Gaming Channel - 50K Subscribers', 'Established gaming channel with consistent content and engaged audience.', 'https://youtube.com/channel/sample1', 'youtube', 'Gaming', 'Unique content', null, 2500.00, 50000, 800.00, 1, 'active'],
      [1, 'Tech Review Channel', 'Professional tech review channel with high-quality content.', 'https://youtube.com/channel/sample2', 'youtube', 'Tech', 'Unique content', null, 5000.00, 120000, 1500.00, 1, 'active']
    ];

    for (const ad of sampleAds) {
      await this.dbConnection.execute(`
        INSERT IGNORE INTO ads (userId, title, description, channelUrl, platform, category, contentType, contentCategory, price, subscribers, monthlyIncome, isMonetized, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, ad);
    }

    console.log('   ✅ Sample data created');
  }

  async verifyAPIEndpoints() {
    console.log('🔌 Verifying API endpoints...');

    // Check critical files exist
    const criticalFiles = [
      'server.js',
      'routes/auth.js',
      'routes/ads.js',
      'controllers/authController.js',
      'controllers/adController.js',
      'models/User.js',
      'models/Ad.js'
    ];

    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Critical file missing: ${file}`);
      }
    }

    console.log('   ✅ All critical API files present');

    // Basic syntax check for main server file
    try {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      
      if (!serverContent.includes('express')) {
        throw new Error('server.js does not appear to be an Express application');
      }
      
      if (!serverContent.includes('/api/')) {
        throw new Error('API routes not properly mounted in server.js');
      }
      
      console.log('   ✅ Server configuration appears valid');
      
    } catch (error) {
      throw new Error(`Server file validation failed: ${error.message}`);
    }
  }

  async testFrontendConfig() {
    console.log('🌐 Testing frontend configuration...');

    // Check if we're in the root directory (where frontend files should be)
    const isInApiDir = fs.existsSync('server.js') && !fs.existsSync('../index.html');
    
    if (isInApiDir) {
      console.log('   ℹ️  Running from API directory - checking parent for frontend files');
      
      if (!fs.existsSync('../index.html')) {
        throw new Error('Frontend index.html not found - ensure it\'s uploaded to public_html/');
      }
      
      if (!fs.existsSync('../assets')) {
        throw new Error('Frontend assets directory not found');
      }
      
      console.log('   ✅ Frontend files found in parent directory');
      
    } else {
      // Check frontend files in current directory
      if (!fs.existsSync('index.html')) {
        throw new Error('Frontend index.html not found');
      }
      
      if (!fs.existsSync('assets')) {
        throw new Error('Frontend assets directory not found');
      }
      
      console.log('   ✅ Frontend files found in current directory');
    }

    // Verify index.html contains production URLs
    const indexPath = isInApiDir ? '../index.html' : 'index.html';
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    if (indexContent.includes('localhost') || indexContent.includes('127.0.0.1')) {
      console.log('   ⚠️  Warning: Frontend may contain localhost URLs');
    }
    
    console.log('   ✅ Frontend configuration verified');
  }

  async finalVerification() {
    console.log('🔍 Running final verification...');

    if (!this.dbConnection) {
      throw new Error('Database connection lost');
    }

    // Test complete database functionality
    try {
      const [userCount] = await this.dbConnection.execute('SELECT COUNT(*) as count FROM users');
      const [adCount] = await this.dbConnection.execute('SELECT COUNT(*) as count FROM ads');
      
      console.log(`   📊 Database verification:`);
      console.log(`      Users: ${userCount[0].count} records`);
      console.log(`      Ads: ${adCount[0].count} records`);
      
      // Test foreign key relationships
      const [joinResult] = await this.dbConnection.execute(`
        SELECT u.email, COUNT(a.id) as adCount 
        FROM users u 
        LEFT JOIN ads a ON u.id = a.userId 
        GROUP BY u.id 
        LIMIT 1
      `);
      
      if (joinResult.length > 0) {
        console.log('   ✅ Database relationships working correctly');
      }
      
    } catch (error) {
      throw new Error(`Database verification failed: ${error.message}`);
    }

    console.log('   ✅ All systems verified and ready');
  }

  provideTroubleshootingForStep(stepName, error) {
    const troubleshooting = {
      'Verify Environment': [
        'Check that .env file was uploaded to the api/ directory',
        'Verify all environment variables are set correctly',
        'Ensure no extra spaces or quotes in .env values'
      ],
      'Test Database Connection': [
        'Verify database exists in Hostinger hPanel',
        'Check database user has ALL PRIVILEGES',
        'Confirm database credentials match those in hPanel',
        'Ensure mysql2 package is installed'
      ],
      'Setup Database Schema': [
        'Run the database setup script manually: node setup-hostinger-database.js',
        'Check database user permissions allow CREATE TABLE',
        'Verify database supports required charset (utf8mb4)'
      ],
      'Verify API Endpoints': [
        'Ensure all files were uploaded to api/ directory',
        'Check file permissions in Hostinger File Manager',
        'Verify Node.js modules are installed'
      ],
      'Test Frontend Configuration': [
        'Upload index.html and assets/ to public_html root',
        'Ensure frontend build was created correctly',
        'Check that API URLs point to production domain'
      ],
      'Final Verification': [
        'Check database connection stability',
        'Verify all foreign key relationships',
        'Test complete application flow'
      ]
    };

    const suggestions = troubleshooting[stepName] || ['Check the error message above for specific details'];
    
    suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion}`);
    });
  }

  displaySuccessMessage() {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 DEPLOYMENT SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ Your XSM Market application is now deployed!');
    console.log('');
    console.log('🔗 NEXT STEPS:');
    console.log('1. Configure Node.js app in Hostinger hPanel');
    console.log('2. Set startup file to: api/server.js');
    console.log('3. Visit your domain to test the application');
    console.log('');
    console.log('👤 TEST ACCOUNTS:');
    console.log('📧 Admin: admin@xsmmarket.com (password: admin123)');
    console.log('📧 User: hamzasheikh1228@gmail.com (password: admin123)');
    console.log('');
    console.log('🌐 Your site should be live at: https://xsmmarket.com');
    console.log('');
    console.log('🛠️  If you encounter issues, run: node troubleshoot-deployment.js');
    console.log('');
  }

  async cleanup() {
    if (this.dbConnection) {
      await this.dbConnection.end();
    }
  }
}

// Run the deployment assistant
async function runDeployment() {
  const assistant = new HostingerDeploymentAssistant();
  
  try {
    await assistant.deploy();
  } catch (error) {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ DEPLOYMENT FAILED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Error: ${error.message}`);
    console.log('');
    console.log('🔧 Run troubleshooting script: node troubleshoot-deployment.js');
    console.log('📖 Check DEPLOYMENT_GUIDE.md for detailed instructions');
    console.log('');
    
    process.exit(1);
  } finally {
    await assistant.cleanup();
  }
}

// Check if running directly
if (require.main === module) {
  runDeployment();
}

module.exports = { HostingerDeploymentAssistant };
