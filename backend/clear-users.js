const User = require('./models/UserSequelize');
const { sequelize } = require('./config/database');

async function clearUsers() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    console.log('🗑️ Deleting all users...');
    const deletedCount = await User.destroy({
      where: {},
      truncate: true
    });
    
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
