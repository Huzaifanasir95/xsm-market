const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working!' });
});

// Get user profile (protected route)
router.get('/profile', protect, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      profilePicture: req.user.profilePicture,
      isEmailVerified: req.user.isEmailVerified,
      authProvider: req.user.authProvider
    }
  });
});

module.exports = router;
