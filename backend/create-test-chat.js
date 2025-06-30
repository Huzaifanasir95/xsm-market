require('dotenv').config();
const { sequelize } = require('./config/database');
const User = require('./models/User');
const Ad = require('./models/Ad');
const Chat = require('./models/Chat');
const Message = require('./models/Message');
const ChatParticipant = require('./models/ChatParticipant');

async function createTestData() {
  try {
    console.log('🧪 Creating test data for chat...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find existing users
    const users = await User.findAll({ limit: 2 });
    if (users.length < 2) {
      console.log('❌ Need at least 2 users in the database to create test chat');
      return;
    }

    // Find an existing ad
    const ad = await Ad.findOne();
    if (!ad) {
      console.log('❌ Need at least 1 ad in the database to create test chat');
      return;
    }

    const user1 = users[0];
    const user2 = users[1];

    console.log(`👥 Using users: ${user1.username} and ${user2.username}`);
    console.log(`📦 Using ad: ${ad.title}`);

    // Create a test chat
    const testChat = await Chat.create({
      type: 'ad_inquiry',
      name: null,
      adId: ad.id,
      lastMessage: 'Hi, I\'m interested in this item!',
      lastMessageTime: new Date(),
      isActive: true
    });

    console.log('💬 Test chat created');

    // Add participants
    await ChatParticipant.create({
      chatId: testChat.id,
      userId: user1.id,
      role: 'member',
      isActive: true
    });

    await ChatParticipant.create({
      chatId: testChat.id,
      userId: user2.id,
      role: 'member',
      isActive: true
    });

    console.log('👥 Chat participants added');

    // Create a test message
    await Message.create({
      chatId: testChat.id,
      senderId: user1.id,
      content: 'Hi, I\'m interested in this item!',
      messageType: 'text',
      isRead: false
    });

    console.log('📨 Test message created');
    console.log('🎉 Test data created successfully!');
    console.log(`📊 Chat ID: ${testChat.id}`);

  } catch (error) {
    console.error('❌ Failed to create test data:', error);
  } finally {
    await sequelize.close();
  }
}

createTestData();
