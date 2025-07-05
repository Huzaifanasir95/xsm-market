const User = require('../models/UserSequelize');
const { Op } = require('sequelize');
const { Chat, ChatParticipant, Message } = require('../models');
const Ad = require('../models/Ad');

// Get all users for admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id', 
        'username', 
        'email', 
        'profilePicture', 
        'isEmailVerified', 
        'authProvider', 
        'createdAt', 
        'updatedAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform data to match the frontend expectations
    const transformedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.isEmailVerified ? 'active' : 'pending',
      role: user.username.includes('admin') ? 'admin' : 'user', // Simple rule for demonstration
      joinDate: user.createdAt,
      lastActive: user.updatedAt || user.createdAt
    }));

    res.status(200).json(transformedUsers);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user by ID for admin
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 
        'username', 
        'email', 
        'profilePicture', 
        'isEmailVerified', 
        'authProvider', 
        'createdAt', 
        'updatedAt'
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.isEmailVerified ? 'active' : 'pending',
      role: user.username.includes('admin') ? 'admin' : 'user',
      joinDate: user.createdAt,
      lastActive: user.updatedAt || user.createdAt
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Map frontend status to database fields
    if (status === 'active') {
      user.isEmailVerified = true;
    } else if (status === 'suspended') {
      user.isEmailVerified = false;
    }
    
    await user.save();
    
    res.status(200).json({ 
      message: 'User status updated successfully',
      user: {
        id: user.id,
        status: user.isEmailVerified ? 'active' : 'pending'
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.destroy();
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all chats for admin review
exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.findAll({
      include: [
        {
          model: ChatParticipant,
          as: 'participants',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }]
        },
        {
          model: Message,
          as: 'messages',
          order: [['createdAt', 'ASC']],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username']
          }]
        }
      ],
      order: [['lastMessageTime', 'DESC']]
    });

    // Transform for frontend
    const result = chats.map(chat => ({
      id: chat.id,
      participants: (chat.participants || []).map(p => ({
        id: p.user?.id,
        username: p.user?.username
      })),
      messages: (chat.messages || []).map(m => ({
        id: m.id,
        content: m.content,
        sender: m.sender?.username,
        timestamp: m.createdAt
      })),
      lastMessage: chat.lastMessage,
      lastMessageTime: chat.lastMessageTime
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching all chats for admin:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalListings = await Ad.count();
    const totalChats = await Chat.count();
    res.status(200).json({
      totalUsers,
      totalListings,
      totalChats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']], limit: 5 });
    const ads = await Ad.findAll({ order: [['createdAt', 'DESC']], limit: 5 });
    const chats = await Chat.findAll({ order: [['createdAt', 'DESC']], limit: 5 });

    // Map to unified activity format
    const activities = [
      ...users.map(u => ({
        type: 'user',
        user: u.username,
        action: 'New registration',
        time: u.createdAt
      })),
      ...ads.map(a => ({
        type: 'listing',
        user: a.sellerUsername || 'Unknown',
        action: 'Created new listing',
        time: a.createdAt
      })),
      ...chats.map(c => ({
        type: 'chat',
        user: c.id,
        action: 'New chat started',
        time: c.createdAt
      }))
    ];

    // Sort by time descending and take top 10
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recent = activities.slice(0, 10);
    res.status(200).json(recent);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllUsers: exports.getAllUsers,
  getUserById: exports.getUserById,
  updateUserStatus: exports.updateUserStatus,
  deleteUser: exports.deleteUser,
  getAllChats: exports.getAllChats,
  getDashboardStats: exports.getDashboardStats,
  getRecentActivities: exports.getRecentActivities
};
