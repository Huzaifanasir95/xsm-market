const { Op } = require('sequelize');
const { User, Chat, Message, ChatParticipant, Ad } = require('../models');

// Get all chats for a user
const getUserChats = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    const chats = await Chat.findAll({
      include: [
        {
          model: ChatParticipant,
          as: 'participants',
          where: { userId, isActive: true },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'fullName', 'email']
          }]
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'fullName']
          }]
        },
        {
          model: Ad,
          as: 'ad',
          attributes: ['id', 'title', 'price'],
          required: false
        }
      ],
      order: [['lastMessageTime', 'DESC']],
      distinct: true
    });

    // Get other participants for each chat
    const chatsWithParticipants = await Promise.all(
      chats.map(async (chat) => {
        const allParticipants = await ChatParticipant.findAll({
          where: { chatId: chat.id, isActive: true },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'fullName', 'email']
          }]
        });

        const otherParticipants = allParticipants.filter(p => p.userId !== userId);
        
        return {
          ...chat.toJSON(),
          otherParticipants: otherParticipants.map(p => p.user)
        };
      })
    );

    res.json(chatsWithParticipants);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create or get existing chat
const createOrGetChat = async (req, res) => {
  try {
    const { participantId, adId, type = 'direct' } = req.body;
    const currentUserId = parseInt(req.user.id);
    const participantIdInt = parseInt(participantId);

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }

    // Check if direct chat already exists between these users
    if (type === 'direct') {
      const existingChat = await Chat.findOne({
        include: [{
          model: ChatParticipant,
          as: 'participants',
          where: { isActive: true },
          required: true
        }],
        where: {
          type: 'direct',
          [Op.and]: [
            {
              '$participants.userId$': {
                [Op.in]: [currentUserId, participantIdInt]
              }
            }
          ]
        },
        group: ['Chat.id'],
        having: {
          [Op.and]: [
            { '$participants.userId$': currentUserId },
            { '$participants.userId$': participantIdInt }
          ]
        }
      });

      if (existingChat) {
        return res.json(existingChat);
      }
    }

    // Create new chat
    const newChat = await Chat.create({
      type,
      adId: adId || null,
      name: type === 'group' ? req.body.name : null
    });

    // Add participants
    await ChatParticipant.bulkCreate([
      { chatId: newChat.id, userId: currentUserId, role: 'admin' },
      { chatId: newChat.id, userId: participantIdInt, role: 'member' }
    ]);

    // Fetch complete chat data
    const chatWithDetails = await Chat.findByPk(newChat.id, {
      include: [
        {
          model: ChatParticipant,
          as: 'participants',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'fullName', 'email']
          }]
        },
        {
          model: Ad,
          as: 'ad',
          attributes: ['id', 'title', 'price'],
          required: false
        }
      ]
    });

    res.status(201).json(chatWithDetails);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages for a chat
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = parseInt(req.user.id);
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant in this chat
    const participant = await ChatParticipant.findOne({
      where: { chatId, userId, isActive: true }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.findAll({
      where: { chatId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: Message,
          as: 'replyTo',
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'fullName']
          }],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    // Update last seen
    await ChatParticipant.update(
      { lastSeenAt: new Date() },
      { where: { chatId, userId } }
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text', replyToId } = req.body;
    const senderId = parseInt(req.user.id);

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Verify user is participant in this chat
    const participant = await ChatParticipant.findOne({
      where: { chatId, userId: senderId, isActive: true }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create message
    const message = await Message.create({
      content: content.trim(),
      senderId,
      chatId,
      messageType,
      replyToId: replyToId || null
    });

    // Update chat's last message
    await Chat.update({
      lastMessage: content.trim(),
      lastMessageTime: new Date()
    }, {
      where: { id: chatId }
    });

    // Fetch complete message data
    const messageWithDetails = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: Message,
          as: 'replyTo',
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'fullName']
          }],
          required: false
        }
      ]
    });

    res.status(201).json(messageWithDetails);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = parseInt(req.user.id);

    // Verify user is participant
    const participant = await ChatParticipant.findOne({
      where: { chatId, userId, isActive: true }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark all unread messages as read
    await Message.update(
      { isRead: true },
      {
        where: {
          chatId,
          senderId: { [Op.ne]: userId },
          isRead: false
        }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create ad inquiry chat
const createAdInquiryChat = async (req, res) => {
  try {
    const { adId, message, sellerId, sellerName } = req.body;
    const buyerId = parseInt(req.user.id);

    if (!adId || !message) {
      return res.status(400).json({ message: 'Ad ID and message are required' });
    }

    // Get ad details
    const ad = await Ad.findByPk(adId, {
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'username', 'fullName']
      }]
    });

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    const actualSellerId = sellerId || ad.userId;
    const actualSellerName = sellerName || ad.seller?.fullName || ad.seller?.username || 'Unknown Seller';

    if (actualSellerId === buyerId) {
      return res.status(400).json({ message: 'Cannot create chat with yourself' });
    }

    // First, comprehensively check if chat already exists between these specific users for this ad
    const existingChats = await Chat.findAll({
      where: { adId, type: 'ad_inquiry' },
      include: [{
        model: ChatParticipant,
        as: 'participants',
        where: {
          isActive: true
        }
      }]
    });

    let existingChat = null;
    for (const chat of existingChats) {
      const participantIds = chat.participants.map(p => p.userId);
      const hasBothUsers = participantIds.includes(parseInt(buyerId)) && participantIds.includes(parseInt(actualSellerId));
      
      if (hasBothUsers) {
        existingChat = chat;
        break;
      }
    }

    let chat;
    if (existingChat) {
      // Use existing chat - don't send a new message
      chat = existingChat;
      console.log(`Using existing chat ${chat.id} for buyer ${buyerId} and seller ${actualSellerId} for ad ${adId}`);
    } else {
      // Create new ad inquiry chat
      chat = await Chat.create({
        type: 'ad_inquiry',
        adId,
        name: `Chat with ${actualSellerName}`
      });

      // Add participants
      await ChatParticipant.bulkCreate([
        { chatId: chat.id, userId: actualSellerId, role: 'admin' },
        { chatId: chat.id, userId: buyerId, role: 'member' }
      ]);

      // Send initial message only for new chats
      const newMessage = await Message.create({
        content: message.trim(),
        senderId: buyerId,
        chatId: chat.id,
        messageType: 'text'
      });

      // Update chat's last message
      await Chat.update({
        lastMessage: message.trim(),
        lastMessageTime: new Date()
      }, {
        where: { id: chat.id }
      });

      console.log(`Created new chat ${chat.id} for buyer ${buyerId} and seller ${actualSellerId} for ad ${adId}`);
    }

    // Return chat with details
    const chatWithDetails = await Chat.findByPk(chat.id, {
      include: [
        {
          model: ChatParticipant,
          as: 'participants',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'fullName', 'email']
          }]
        },
        {
          model: Ad,
          as: 'ad',
          attributes: ['id', 'title', 'price']
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'fullName']
          }]
        }
      ]
    });

    res.status(existingChat ? 200 : 201).json(chatWithDetails);
  } catch (error) {
    console.error('Error creating ad inquiry chat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserChats,
  createOrGetChat,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  createAdInquiryChat
};
