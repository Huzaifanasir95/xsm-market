const User = require('../models/UserSequelize');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Helper function to check if username is available
const isUsernameAvailable = async (username, currentUserId = null) => {
  const whereClause = { username };
  if (currentUserId) {
    whereClause.id = { [Op.ne]: currentUserId };
  }
  
  const user = await User.findOne({ where: whereClause });
  return !user;
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'fullName', 'email', 'profilePicture', 'isEmailVerified', 'authProvider', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update username
exports.updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    // Validation
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ message: 'Username must be between 3 and 50 characters' });
    }

    // Check if username contains only valid characters
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
    }

    // Check if username is available
    const isAvailable = await isUsernameAvailable(username, userId);
    if (!isAvailable) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Update username
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldUsername = user.username;
    user.username = username;
    await user.save();

    console.log(`Username updated for user ${userId}: ${oldUsername} -> ${username}`);

    res.status(200).json({
      message: 'Username updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Update username error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Username is already taken' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = profilePicture || '';
    await user.save();

    console.log(`Profile picture updated for user ${userId}`);

    res.status(200).json({
      message: 'Profile picture updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update full profile (username, full name, profile picture)
exports.updateProfile = async (req, res) => {
  try {
    const { username, fullName, profilePicture } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};
    const changes = [];

    // Update username if provided
    if (username && username !== user.username) {
      // Validation
      if (username.length < 3 || username.length > 50) {
        return res.status(400).json({ message: 'Username must be between 3 and 50 characters' });
      }

      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
      }

      // Check if username is available
      const isAvailable = await isUsernameAvailable(username, userId);
      if (!isAvailable) {
        return res.status(400).json({ message: 'Username is already taken' });
      }

      updates.username = username;
      changes.push(`username: ${user.username} -> ${username}`);
    }

    // Update full name if provided
    if (fullName !== undefined && fullName !== user.fullName) {
      if (fullName && fullName.length > 100) {
        return res.status(400).json({ message: 'Full name must be less than 100 characters' });
      }
      
      updates.fullName = fullName || '';
      changes.push('full name updated');
    }

    // Update profile picture if provided
    if (profilePicture !== undefined && profilePicture !== user.profilePicture) {
      updates.profilePicture = profilePicture || '';
      changes.push('profile picture updated');
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await user.update(updates);
      console.log(`Profile updated for user ${userId}: ${changes.join(', ')}`);
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Username is already taken' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check username availability
exports.checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.query;
    const userId = req.user.id;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username must be between 3 and 50 characters' 
      });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username can only contain letters, numbers, and underscores' 
      });
    }

    const isAvailable = await isUsernameAvailable(username, userId);

    res.status(200).json({
      available: isAvailable,
      message: isAvailable ? 'Username is available' : 'Username is already taken'
    });
  } catch (error) {
    console.error('Check username availability error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle Google users (they can set password without providing current password)
    if (user.authProvider === 'google') {
      // For Google users, they don't need to provide current password
      if (currentPassword) {
        return res.status(400).json({ 
          message: 'Google account users don\'t have a current password. Leave current password empty to set a new password.' 
        });
      }
      
      // Set password for Google user
      user.password = newPassword;
      await user.save();
      
      console.log(`Password set for Google user ${userId}`);
      
      return res.status(200).json({ 
        message: 'Password set successfully! You can now login with email/password in addition to Google.' 
      });
    }

    // Handle email users (existing password required)
    if (user.authProvider === 'email') {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log(`Password changed for user ${userId}`);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProfile: exports.getProfile,
  updateUsername: exports.updateUsername,
  updateProfilePicture: exports.updateProfilePicture,
  updateProfile: exports.updateProfile,
  checkUsernameAvailability: exports.checkUsernameAvailability,
  changePassword: exports.changePassword
};
