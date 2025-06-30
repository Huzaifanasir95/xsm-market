const express = require('express');
const router = express.Router();
const {
  getUserChats,
  createOrGetChat,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  createAdInquiryChat
} = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Middleware: All chat routes require authentication
router.use(authenticateToken);

// Get all chats for the authenticated user
router.get('/chats', getUserChats);

// Create or get existing chat
router.post('/chats', createOrGetChat);

// Create ad inquiry chat
router.post('/ad-inquiry', createAdInquiryChat);

// Check if chat exists between users
router.post('/check-existing', async (req, res) => {
  try {
    const { sellerId, adId } = req.body;
    const buyerId = parseInt(req.user.id);
    
    const { Chat, ChatParticipant } = require('../models');
    
    // Find all existing chats for this ad that might have these users as participants
    const existingChats = await Chat.findAll({
      where: {
        adId: adId,
        type: 'ad_inquiry'
      },
      include: [{
        model: ChatParticipant,
        as: 'participants',
        where: {
          isActive: true
        }
      }]
    });
    
    // Check each chat to see if it has both specific users as participants
    for (const chat of existingChats) {
      const participantIds = chat.participants.map(p => p.userId);
      const hasBothUsers = participantIds.includes(parseInt(buyerId)) && participantIds.includes(parseInt(sellerId));
      
      if (hasBothUsers) {
        console.log(`Found existing chat ${chat.id} for buyer ${buyerId} and seller ${sellerId} for ad ${adId}`);
        return res.json({ exists: true, chatId: chat.id });
      }
    }
    
    console.log(`No existing chat found for buyer ${buyerId} and seller ${sellerId} for ad ${adId}`);
    res.json({ exists: false });
  } catch (error) {
    console.error('Error checking existing chat:', error);
    res.status(500).json({ message: 'Failed to check existing chat' });
  }
});

// Get messages for a specific chat
router.get('/chats/:chatId/messages', getChatMessages);

// Send a message to a specific chat
router.post('/chats/:chatId/messages', sendMessage);

// Mark messages as read in a specific chat
router.put('/chats/:chatId/read', markMessagesAsRead);

module.exports = router;
