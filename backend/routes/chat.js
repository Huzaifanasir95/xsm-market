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

// Get messages for a specific chat
router.get('/chats/:chatId/messages', getChatMessages);

// Send a message to a specific chat
router.post('/chats/:chatId/messages', sendMessage);

// Mark messages as read in a specific chat
router.put('/chats/:chatId/read', markMessagesAsRead);

module.exports = router;
