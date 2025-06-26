const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Google Sign-In route
router.post('/google-signin', authController.googleSignIn);

module.exports = router;
