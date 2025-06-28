const { sequelize } = require('./config/database');
const User = require('./models/UserSequelize');

async function setupDatabase() {
  try {
    // Verify environment variables are loaded
    if (!process.env.DB_NAME || !process.env.DB_HOST || !process.env.DB_USER) {
      console.error('❌ Missing database configuration in .env file');
      console.log('Required variables: DB_NAME, DB_HOST, DB_USER, DB_PASSWORD');
      process.exit(1);
    }

    console.log('🚀 Setting up XSM Market database...');
    console.log('📊 Database:', process.env.DB_NAME);
    console.log('🏠 Host:', process.env.DB_HOST);
    console.log('👤 User:', process.env.DB_USER);
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully!');
    
    // Create tables
    await sequelize.sync({ 
      force: false,  // Don't drop existing tables
      alter: true    // Update table structure if needed
    });
    
    console.log('✅ Database tables created/updated successfully!');
    
    // Show created tables
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Available tables:');
    tables.forEach(table => console.log(`  ✓ ${table}`));
    
    // Check if any users exist
    const userCount = await User.count();
    console.log(`👥 Current users in database: ${userCount}`);
    
    console.log('🎉 Database setup completed successfully!');
    console.log('🚀 Your XSM Market backend is ready to use!');
    
  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Verify database credentials in .env file');
      console.log('2. Ensure database server is running');
      console.log('3. Check if database user has proper privileges');
    }
    
    if (error.message.includes('Access denied')) {
      console.log('\n💡 Access denied - check:');
      console.log('1. Database username and password');
      console.log('2. User privileges in Hostinger panel');
    }
    
  } finally {
    await sequelize.close();
    console.log('🔐 Database connection closed');
  }
}

// Run setup
setupDatabase();
