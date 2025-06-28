#!/usr/bin/env node

/**
 * XSM Market Database Cleanup Script
 * Removes unnecessary data and optimizes database
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🧹 XSM Market Database Cleanup');
console.log('===============================');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

async function cleanupDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Show current database status
    console.log('\n📊 Current Database Status:');
    console.log('──────────────────────────');
    
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [adCount] = await connection.execute('SELECT COUNT(*) as count FROM ads');
    
    console.log(`👥 Users: ${userCount[0].count}`);
    console.log(`📢 Ads: ${adCount[0].count}`);
    
    // Check for test/duplicate data
    console.log('\n🔍 Analyzing data...');
    
    // Find duplicate users
    const [duplicateUsers] = await connection.execute(`
      SELECT email, COUNT(*) as count 
      FROM users 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `);
    
    // Find old/inactive ads
    const [oldAds] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM ads 
      WHERE status = 'sold' OR status = 'suspended' OR status = 'rejected'
    `);
    
    // Find test data
    const [testUsers] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE email LIKE '%test%' OR email LIKE '%example%' OR username LIKE '%test%'
    `);
    
    console.log(`🔄 Duplicate users: ${duplicateUsers.length}`);
    console.log(`🗑️  Inactive ads: ${oldAds[0].count}`);
    console.log(`🧪 Test users: ${testUsers[0].count}`);
    
    // Start cleanup
    console.log('\n🧹 Starting cleanup...');
    console.log('─────────────────────');
    
    let cleanupActions = [];
    
    // 1. Remove test users (but keep admin accounts)
    const [testUserList] = await connection.execute(`
      SELECT id, username, email 
      FROM users 
      WHERE (email LIKE '%test%' OR email LIKE '%example%' OR username LIKE '%test%')
      AND email NOT LIKE '%admin%'
      AND username NOT LIKE '%admin%'
    `);
    
    if (testUserList.length > 0) {
      console.log(`🗑️  Removing ${testUserList.length} test users...`);
      for (const user of testUserList) {
        console.log(`   - ${user.username} (${user.email})`);
        await connection.execute('DELETE FROM ads WHERE userId = ?', [user.id]);
        await connection.execute('DELETE FROM users WHERE id = ?', [user.id]);
      }
      cleanupActions.push(`Removed ${testUserList.length} test users and their ads`);
    }
    
    // 2. Remove sold/rejected/suspended ads older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [oldAdsList] = await connection.execute(`
      SELECT id, title, status 
      FROM ads 
      WHERE status IN ('sold', 'rejected', 'suspended') 
      AND updatedAt < ?
    `, [thirtyDaysAgo]);
    
    if (oldAdsList.length > 0) {
      console.log(`🗑️  Removing ${oldAdsList.length} old inactive ads...`);
      await connection.execute(`
        DELETE FROM ads 
        WHERE status IN ('sold', 'rejected', 'suspended') 
        AND updatedAt < ?
      `, [thirtyDaysAgo]);
      cleanupActions.push(`Removed ${oldAdsList.length} old inactive ads`);
    }
    
    // 3. Remove duplicate user entries (keep the most recent)
    if (duplicateUsers.length > 0) {
      console.log(`🔄 Fixing ${duplicateUsers.length} duplicate user entries...`);
      for (const dup of duplicateUsers) {
        const [userInstances] = await connection.execute(`
          SELECT id, createdAt 
          FROM users 
          WHERE email = ? 
          ORDER BY createdAt DESC
        `, [dup.email]);
        
        // Keep the most recent, delete others
        for (let i = 1; i < userInstances.length; i++) {
          await connection.execute('DELETE FROM ads WHERE userId = ?', [userInstances[i].id]);
          await connection.execute('DELETE FROM users WHERE id = ?', [userInstances[i].id]);
        }
      }
      cleanupActions.push(`Fixed ${duplicateUsers.length} duplicate user entries`);
    }
    
    // 4. Clean up orphaned ads (ads without valid users)
    const [orphanedAds] = await connection.execute(`
      SELECT a.id, a.title 
      FROM ads a 
      LEFT JOIN users u ON a.userId = u.id 
      WHERE u.id IS NULL
    `);
    
    if (orphanedAds.length > 0) {
      console.log(`🧹 Removing ${orphanedAds.length} orphaned ads...`);
      await connection.execute(`
        DELETE FROM ads 
        WHERE userId NOT IN (SELECT id FROM users)
      `);
      cleanupActions.push(`Removed ${orphanedAds.length} orphaned ads`);
    }
    
    // 5. Reset auto-increment counters
    console.log('🔧 Optimizing database...');
    await connection.execute('OPTIMIZE TABLE users');
    await connection.execute('OPTIMIZE TABLE ads');
    cleanupActions.push('Optimized database tables');
    
    // 6. Update statistics
    const [finalUserCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [finalAdCount] = await connection.execute('SELECT COUNT(*) as count FROM ads');
    const [activeAdCount] = await connection.execute('SELECT COUNT(*) as count FROM ads WHERE status = "active"');
    
    console.log('\n✅ Cleanup Complete!');
    console.log('════════════════════');
    console.log('\n📊 Final Database Status:');
    console.log(`👥 Users: ${finalUserCount[0].count}`);
    console.log(`📢 Total Ads: ${finalAdCount[0].count}`);
    console.log(`🟢 Active Ads: ${activeAdCount[0].count}`);
    
    console.log('\n🧹 Cleanup Actions Performed:');
    if (cleanupActions.length > 0) {
      cleanupActions.forEach((action, index) => {
        console.log(`${index + 1}. ${action}`);
      });
    } else {
      console.log('✨ Database was already clean - no actions needed!');
    }
    
    // Show remaining user accounts
    const [remainingUsers] = await connection.execute('SELECT username, email FROM users ORDER BY createdAt');
    console.log('\n👥 Remaining User Accounts:');
    remainingUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email})`);
    });
    
    console.log('\n🎉 Database cleanup successful!');
    
  } catch (error) {
    console.error('\n❌ Database cleanup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check database connection settings');
    console.error('2. Ensure user has DELETE and OPTIMIZE privileges');
    console.error('3. Verify database exists and is accessible');
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Database connection closed');
    }
  }
}

// Run cleanup
cleanupDatabase();
