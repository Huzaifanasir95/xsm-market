const express = require('express');
const router = express.Router();
const User = require('../models/UserSequelize');
const { authenticateToken } = require('../middleware/authMiddleware');

// Debug user data endpoint
router.get('/debug-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'username', 'fullName', 'email', 'profilePicture', 'authProvider', 'isEmailVerified', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check for potential issues
    const issues = [];
    if (!user.username) issues.push('Missing username');
    if (!user.fullName) issues.push('Missing fullName');
    if (!user.email) issues.push('Missing email');
    if (user.authProvider === 'email' && !user.isEmailVerified) issues.push('Email not verified');
    
    res.json({
      user: user.toJSON(),
      issues,
      status: issues.length === 0 ? 'OK' : 'HAS_ISSUES'
    });
    
  } catch (error) {
    console.error('Debug user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fix user data endpoint
router.post('/fix-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { username, fullName } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fix missing data
    if (username && !user.username) {
      user.username = username;
    }
    if (fullName && !user.fullName) {
      user.fullName = fullName;
    }
    
    await user.save();
    
    res.json({
      message: 'User data fixed',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified
      }
    });
    
  } catch (error) {
    console.error('Fix user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Manually verify user email (for testing purposes)
router.put('/verify-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Manually verify the email
    user.isEmailVerified = true;
    await user.save();
    
    res.json({
      message: 'User email verified successfully',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified
      }
    });
    
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Manual email verification for testing
router.post('/verify-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Manually verify the email
    user.isEmailVerified = true;
    await user.save();
    
    res.json({ 
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Manual email verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Debug user by ID endpoint
router.get('/debug-user-by-id/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'fullName', 'email', 'profilePicture', 'authProvider', 'isEmailVerified', 'createdAt', 'updatedAt']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: user.toJSON(),
      status: 'OK'
    });
    
  } catch (error) {
    console.error('Debug user by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
