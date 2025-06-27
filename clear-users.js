const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize('xsm_market_local', 'root', 'localpassword123', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log
});

async function clearUsers() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('🗑️ Deleting all users...');
    const result = await sequelize.query('DELETE FROM users', { type: Sequelize.QueryTypes.DELETE });
    
    console.log(`✅ Successfully deleted all users from the database`);
    console.log('📊 You can now register new users and test the application fresh');
    
  } catch (error) {
    console.error('❌ Error clearing users:', error.message);
  } finally {
    await sequelize.close();
    console.log('🔐 Database connection closed');
  }
}

clearUsers();
