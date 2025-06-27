const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working!' });
});

// Get user profile (protected route)
router.get('/profile', protect, userController.getProfile);

// Update username
router.put('/username', protect, userController.updateUsername);

// Update profile picture
router.put('/profile-picture', protect, userController.updateProfilePicture);

// Update full profile (username and/or profile picture)
router.put('/profile', protect, userController.updateProfile);

// Check username availability
router.get('/check-username', protect, userController.checkUsernameAvailability);

// Change password
router.put('/password', protect, userController.changePassword);

// Legacy route for backward compatibility
router.get('/profile-legacy', protect, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      fullName: req.user.fullName,
      email: req.user.email,
      profilePicture: req.user.profilePicture,
      isEmailVerified: req.user.isEmailVerified,
      authProvider: req.user.authProvider
    }
  });
});

module.exports = router;
