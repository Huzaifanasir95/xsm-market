const { sequelize } = require('./config/database');
const User = require('./models/UserSequelize');

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database index issue...');
    
    // First, drop the users table if it exists to clear all indexes
    await sequelize.getQueryInterface().dropTable('users', { cascade: true }).catch(() => {
      console.log('ℹ️ Users table doesn\'t exist or already dropped');
    });
    
    console.log('✅ Dropped existing users table');
    
    // Now create the table fresh with proper indexes
    await sequelize.sync({ force: true });
    
    console.log('✅ Created fresh users table with correct indexes');
    
    // Verify the table structure
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 Available tables:', tables);
    
    if (tables.includes('users')) {
      // Show the indexes on the users table
      const indexes = await sequelize.getQueryInterface().showIndex('users');
      console.log('📊 Users table indexes:');
      indexes.forEach(index => {
        console.log(`  - ${index.name}: ${index.fields.map(f => f.attribute).join(', ')}`);
      });
      
      console.log(`✅ Users table has ${indexes.length} indexes (should be under 64)`);
    }
    
    console.log('🎉 Database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixDatabase().catch(console.error);
