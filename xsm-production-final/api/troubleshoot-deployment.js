#!/usr/bin/env node

/**
 * XSM Market - Hostinger Deployment Troubleshooter
 * Diagnoses and fixes common deployment issues on Hostinger
 * 
 * Run this script if you encounter problems after deployment
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🔧 XSM Market - Hostinger Deployment Troubleshooter');
console.log('===================================================');
console.log('');

class HostingerTroubleshooter {
  constructor() {
    this.issues = [];
    this.fixes = [];
    this.dbConnection = null;
  }

  async runDiagnostics() {
    console.log('🔍 Running comprehensive diagnostics...');
    console.log('');

    await this.checkEnvironmentVariables();
    await this.checkDatabaseConnection();
    await this.checkDatabaseSchema();
    await this.checkFilePermissions();
    await this.checkServerConfiguration();
    await this.checkAPIEndpoints();
    
    this.generateReport();
  }

  async checkEnvironmentVariables() {
    console.log('📋 CHECKING ENVIRONMENT VARIABLES');
    console.log('─────────────────────────────────');

    const requiredVars = [
      'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
      'JWT_SECRET', 'NODE_ENV', 'VITE_API_URL'
    ];

    let missingVars = [];
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (!value) {
        missingVars.push(varName);
        console.log(`❌ ${varName}: Missing`);
      } else {
        console.log(`✅ ${varName}: ${varName.includes('PASSWORD') ? '[HIDDEN]' : value}`);
      }
    });

    if (missingVars.length > 0) {
      this.issues.push('Missing environment variables');
      this.fixes.push(`Add missing variables to .env file: ${missingVars.join(', ')}`);
    }

    // Check production-specific values
    if (process.env.NODE_ENV !== 'production') {
      this.issues.push('Environment not set to production');
      this.fixes.push('Set NODE_ENV=production in .env file');
      console.log('⚠️  NODE_ENV is not set to production');
    }

    if (process.env.VITE_API_URL && !process.env.VITE_API_URL.includes('xsmmarket.com')) {
      this.issues.push('API URL not set for production');
      this.fixes.push('Set VITE_API_URL=https://xsmmarket.com/api in .env file');
      console.log('⚠️  API URL may not be correct for production');
    }

    console.log('');
  }

  async checkDatabaseConnection() {
    console.log('🗄️  CHECKING DATABASE CONNECTION');
    console.log('─────────────────────────────────');

    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      timeout: 10000
    };

    try {
      console.log(`Attempting connection to: ${dbConfig.host}:${dbConfig.port}`);
      console.log(`Database: ${dbConfig.database}`);
      console.log(`User: ${dbConfig.user}`);

      this.dbConnection = await mysql.createConnection(dbConfig);
      
      // Test basic connectivity
      await this.dbConnection.execute('SELECT 1 as test');
      console.log('✅ Database connection successful');

      // Test database access
      const [tables] = await this.dbConnection.execute('SHOW TABLES');
      console.log(`✅ Database accessible (${tables.length} tables found)`);

    } catch (error) {
      console.log('❌ Database connection failed');
      console.log(`   Error: ${error.message}`);
      
      this.issues.push('Database connection failed');
      
      if (error.code === 'ENOTFOUND') {
        this.fixes.push('Check DB_HOST - ensure it\'s correct for Hostinger (usually 127.0.0.1 or localhost)');
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        this.fixes.push('Check database credentials in Hostinger hPanel - ensure user has ALL PRIVILEGES');
      } else if (error.code === 'ER_BAD_DB_ERROR') {
        this.fixes.push('Database does not exist - create it in Hostinger hPanel first');
      } else {
        this.fixes.push('Check database configuration and Hostinger database settings');
      }
    }

    console.log('');
  }

  async checkDatabaseSchema() {
    if (!this.dbConnection) {
      console.log('🚫 Skipping database schema check (no connection)');
      console.log('');
      return;
    }

    console.log('📊 CHECKING DATABASE SCHEMA');
    console.log('───────────────────────────');

    try {
      // Check if required tables exist
      const [tables] = await this.dbConnection.execute('SHOW TABLES');
      const tableNames = tables.map(t => Object.values(t)[0]);
      
      const requiredTables = ['users', 'ads'];
      let missingTables = [];

      requiredTables.forEach(table => {
        if (tableNames.includes(table)) {
          console.log(`✅ Table '${table}' exists`);
        } else {
          console.log(`❌ Table '${table}' missing`);
          missingTables.push(table);
        }
      });

      if (missingTables.length > 0) {
        this.issues.push('Database tables missing');
        this.fixes.push('Run: node setup-hostinger-database.js to create tables');
      }

      // Check table structure for existing tables
      if (tableNames.includes('users')) {
        const [userCols] = await this.dbConnection.execute('DESCRIBE users');
        const userColNames = userCols.map(col => col.Field);
        
        const requiredUserCols = ['id', 'username', 'email', 'password'];
        const missingUserCols = requiredUserCols.filter(col => !userColNames.includes(col));
        
        if (missingUserCols.length === 0) {
          console.log('✅ Users table structure correct');
        } else {
          console.log(`❌ Users table missing columns: ${missingUserCols.join(', ')}`);
          this.issues.push('Users table structure incorrect');
          this.fixes.push('Re-run database setup script to fix table structure');
        }
      }

      if (tableNames.includes('ads')) {
        const [adCols] = await this.dbConnection.execute('DESCRIBE ads');
        const adColNames = adCols.map(col => col.Field);
        
        const requiredAdCols = ['id', 'userId', 'title', 'channelUrl', 'platform', 'price'];
        const missingAdCols = requiredAdCols.filter(col => !adColNames.includes(col));
        
        if (missingAdCols.length === 0) {
          console.log('✅ Ads table structure correct');
        } else {
          console.log(`❌ Ads table missing columns: ${missingAdCols.join(', ')}`);
          this.issues.push('Ads table structure incorrect');
          this.fixes.push('Re-run database setup script to fix table structure');
        }
      }

      // Check for sample data
      if (tableNames.includes('users')) {
        const [userCount] = await this.dbConnection.execute('SELECT COUNT(*) as count FROM users');
        if (userCount[0].count > 0) {
          console.log(`✅ Sample users present (${userCount[0].count} users)`);
        } else {
          console.log('⚠️  No users in database');
          this.fixes.push('Consider running setup script to add sample users');
        }
      }

    } catch (error) {
      console.log('❌ Database schema check failed');
      console.log(`   Error: ${error.message}`);
      this.issues.push('Database schema check failed');
      this.fixes.push('Check database permissions and re-run setup script');
    }

    console.log('');
  }

  async checkFilePermissions() {
    console.log('📁 CHECKING FILE PERMISSIONS');
    console.log('────────────────────────────');

    const criticalFiles = [
      'server.js',
      '.env',
      'package.json',
      'setup-hostinger-database.js'
    ];

    criticalFiles.forEach(file => {
      try {
        const stats = fs.statSync(file);
        const isReadable = fs.access !== undefined;
        
        if (isReadable) {
          console.log(`✅ ${file} - accessible`);
        } else {
          console.log(`❌ ${file} - permission denied`);
          this.issues.push(`File permission issue: ${file}`);
          this.fixes.push(`Check file permissions for ${file} in Hostinger File Manager`);
        }
      } catch (error) {
        console.log(`❌ ${file} - not found or inaccessible`);
        this.issues.push(`Missing file: ${file}`);
        this.fixes.push(`Ensure ${file} is uploaded to the correct directory`);
      }
    });

    console.log('');
  }

  async checkServerConfiguration() {
    console.log('⚙️  CHECKING SERVER CONFIGURATION');
    console.log('─────────────────────────────────');

    // Check package.json for Node.js app requirements
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts.start) {
        console.log('✅ Start script configured');
      } else {
        console.log('❌ No start script in package.json');
        this.issues.push('Missing start script');
        this.fixes.push('Add "start": "node server.js" to package.json scripts');
      }

      // Check main entry point
      const mainFile = packageJson.main || 'server.js';
      if (fs.existsSync(mainFile)) {
        console.log(`✅ Main entry point (${mainFile}) exists`);
      } else {
        console.log(`❌ Main entry point (${mainFile}) missing`);
        this.issues.push('Main entry point missing');
        this.fixes.push(`Ensure ${mainFile} exists or update package.json main field`);
      }

      // Check Node.js version compatibility
      if (packageJson.engines && packageJson.engines.node) {
        console.log(`✅ Node.js version specified: ${packageJson.engines.node}`);
      } else {
        console.log('⚠️  Node.js version not specified');
        this.fixes.push('Consider adding engines.node to package.json for Hostinger compatibility');
      }

    } catch (error) {
      console.log('❌ package.json invalid or missing');
      this.issues.push('Invalid package.json');
      this.fixes.push('Fix package.json syntax or ensure it exists');
    }

    console.log('');
  }

  async checkAPIEndpoints() {
    console.log('🔌 CHECKING API ENDPOINT CONFIGURATION');
    console.log('─────────────────────────────────────');

    const routeFiles = [
      'routes/auth.js',
      'routes/ads.js',
      'routes/user.js'
    ];

    routeFiles.forEach(routeFile => {
      if (fs.existsSync(routeFile)) {
        console.log(`✅ Route file exists: ${routeFile}`);
        
        // Basic validation
        const content = fs.readFileSync(routeFile, 'utf8');
        if (content.includes('router') && content.includes('module.exports')) {
          console.log(`   ✅ ${routeFile} appears valid`);
        } else {
          console.log(`   ⚠️  ${routeFile} may have syntax issues`);
          this.fixes.push(`Check syntax in ${routeFile}`);
        }
      } else {
        console.log(`❌ Route file missing: ${routeFile}`);
        this.issues.push(`Missing route file: ${routeFile}`);
        this.fixes.push(`Ensure ${routeFile} is uploaded`);
      }
    });

    // Check server.js for proper route mounting
    if (fs.existsSync('server.js')) {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      
      const hasAuthRoute = serverContent.includes('/api/auth');
      const hasAdRoute = serverContent.includes('/api/ads');
      
      if (hasAuthRoute && hasAdRoute) {
        console.log('✅ API routes properly mounted in server.js');
      } else {
        console.log('❌ API routes not properly mounted');
        this.issues.push('API routes not mounted');
        this.fixes.push('Check route mounting in server.js');
      }
    }

    console.log('');
  }

  generateReport() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TROUBLESHOOTING REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (this.issues.length === 0) {
      console.log('🎉 NO ISSUES DETECTED!');
      console.log('✅ Your deployment appears to be configured correctly.');
      console.log('');
      console.log('If you\'re still experiencing problems:');
      console.log('1. Check Hostinger Node.js app configuration');
      console.log('2. Verify domain DNS settings');
      console.log('3. Check Hostinger error logs');
      console.log('4. Contact Hostinger support if needed');
    } else {
      console.log(`❌ ${this.issues.length} ISSUES DETECTED`);
      console.log('');
      console.log('🔧 ISSUES FOUND:');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
      
      console.log('');
      console.log('💡 RECOMMENDED FIXES:');
      this.fixes.forEach((fix, index) => {
        console.log(`${index + 1}. ${fix}`);
      });
    }

    console.log('');
    console.log('📋 HOSTINGER-SPECIFIC CHECKLIST:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('□ Files uploaded to public_html/api/');
    console.log('□ MySQL database created in hPanel');
    console.log('□ Database user has ALL PRIVILEGES');
    console.log('□ Node.js app configured in hPanel');
    console.log('□ Environment variables set correctly');
    console.log('□ Domain pointing to public_html');
    console.log('□ SSL certificate installed');
    console.log('');
    console.log('📞 Need more help? Check DEPLOYMENT_GUIDE.md');
    console.log('');
  }

  async cleanup() {
    if (this.dbConnection) {
      await this.dbConnection.end();
    }
  }
}

// Run the troubleshooter
async function runTroubleshooter() {
  const troubleshooter = new HostingerTroubleshooter();
  
  try {
    await troubleshooter.runDiagnostics();
  } catch (error) {
    console.error('❌ Troubleshooter encountered an error:', error.message);
  } finally {
    await troubleshooter.cleanup();
  }
}

// Check if running directly
if (require.main === module) {
  runTroubleshooter();
}

module.exports = { HostingerTroubleshooter };
