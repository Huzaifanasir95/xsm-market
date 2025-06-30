const { sequelize } = require('../config/database');
const User = require('./UserSequelize');
const Ad = require('./Ad');
const Chat = require('./Chat');
const Message = require('./Message');
const ChatParticipant = require('./ChatParticipant');

// Set up associations
const initializeAssociations = () => {
  // User associations
  User.hasMany(Ad, {
    foreignKey: 'userId',
    as: 'ads',
    onDelete: 'CASCADE'
  });

  User.hasMany(Ad, {
    foreignKey: 'soldTo',
    as: 'purchases',
    onDelete: 'SET NULL'
  });

  // Ad associations
  Ad.belongsTo(User, {
    foreignKey: 'userId',
    as: 'seller',
    onDelete: 'CASCADE'
  });

  Ad.belongsTo(User, {
    foreignKey: 'soldTo',
    as: 'buyer',
    onDelete: 'SET NULL'
  });

  // Chat associations
  Chat.hasMany(Message, {
    foreignKey: 'chatId',
    as: 'messages',
    onDelete: 'CASCADE'
  });

  Chat.hasMany(ChatParticipant, {
    foreignKey: 'chatId',
    as: 'participants',
    onDelete: 'CASCADE'
  });

  Chat.belongsTo(Ad, {
    foreignKey: 'adId',
    as: 'ad',
    onDelete: 'SET NULL'
  });

  // Message associations
  Message.belongsTo(Chat, {
    foreignKey: 'chatId',
    as: 'chat',
    onDelete: 'CASCADE'
  });

  Message.belongsTo(User, {
    foreignKey: 'senderId',
    as: 'sender',
    onDelete: 'CASCADE'
  });

  Message.belongsTo(Message, {
    foreignKey: 'replyToId',
    as: 'replyTo',
    onDelete: 'SET NULL'
  });

  // ChatParticipant associations
  ChatParticipant.belongsTo(Chat, {
    foreignKey: 'chatId',
    as: 'chat',
    onDelete: 'CASCADE'
  });

  ChatParticipant.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });

  // User chat associations through ChatParticipant
  User.hasMany(ChatParticipant, {
    foreignKey: 'userId',
    as: 'chatParticipants',
    onDelete: 'CASCADE'
  });

  User.hasMany(Message, {
    foreignKey: 'senderId',
    as: 'sentMessages',
    onDelete: 'CASCADE'
  });

  // Ad chat associations
  Ad.hasMany(Chat, {
    foreignKey: 'adId',
    as: 'chats',
    onDelete: 'SET NULL'
  });

  console.log('✅ Database associations initialized');
};

// Initialize database
const initializeDatabase = async () => {
  try {
    // Set up associations
    initializeAssociations();

    // Only sync chat tables to avoid key limit issues with existing tables
    console.log('📊 Syncing chat tables only...');
    
    // Sync chat tables individually without altering existing structure
    await Chat.sync({ force: false });
    console.log('✅ Chat table synced');
    
    await Message.sync({ force: false });
    console.log('✅ Message table synced');
    
    await ChatParticipant.sync({ force: false });
    console.log('✅ ChatParticipant table synced');

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't throw error, just log it and continue
    console.log('⚠️ Continuing without full database sync...');
    return false;
  }
};

module.exports = {
  initializeDatabase,
  initializeAssociations,
  User,
  Ad,
  Chat,
  Message,
  ChatParticipant
};
