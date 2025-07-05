const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  // You may want to implement a proper check based on your user model
  // For now, we'll use a simple check if username contains "admin"
  if (req.user && req.user.username && req.user.username.includes('admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Apply auth middleware to all routes
router.use(authMiddleware.authenticateToken);

// Admin routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId/status', adminController.updateUserStatus);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/chats', adminController.getAllChats);
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/recent-activities', adminController.getRecentActivities);

module.exports = router;
