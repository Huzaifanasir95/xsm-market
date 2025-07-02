const User = require('../models/UserSequelize');
const { Op } = require('sequelize');

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

module.exports = {
  getAllUsers: exports.getAllUsers,
  getUserById: exports.getUserById,
  updateUserStatus: exports.updateUserStatus,
  deleteUser: exports.deleteUser
};
