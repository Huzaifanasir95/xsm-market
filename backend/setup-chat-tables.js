require('dotenv').config();
const { sequelize } = require('./config/database');
const Chat = require('./models/Chat');
const Message = require('./models/Message');
const ChatParticipant = require('./models/ChatParticipant');

async function setupChatTables() {
  try {
    console.log('🚀 Setting up chat tables...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established!');
    
    // Create chat tables
    await Chat.sync({ force: false });
    console.log('✅ Chat table created/verified');
    
    await Message.sync({ force: false });
    console.log('✅ Message table created/verified');
    
    await ChatParticipant.sync({ force: false });
    console.log('✅ ChatParticipant table created/verified');
    
    console.log('🎉 Chat tables setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Chat tables setup failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔐 Database connection closed');
  }
}

if (require.main === module) {
  setupChatTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = setupChatTables;
