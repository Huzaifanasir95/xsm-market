const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('direct', 'group', 'ad_inquiry'),
    defaultValue: 'direct',
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Chat name for group chats'
  },
  adId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Associated ad ID for ad inquiry chats'
  },
  lastMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastMessageTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'chats',
  timestamps: true,
  indexes: [
    {
      fields: ['type', 'isActive']
    },
    {
      fields: ['adId']
    }
  ]
});

module.exports = Chat;
