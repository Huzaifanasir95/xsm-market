const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!' });
});

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Verify OTP route
router.post('/verify-otp', authController.verifyOTP);

// Resend OTP route
router.post('/resend-otp', authController.resendOTP);

// Refresh token route
router.post('/refresh-token', authController.refreshToken);

// Check verification status
router.get('/verification-status/:email', authController.checkVerificationStatus);

// Comment out Google route temporarily
// router.post('/google-signin', authController.googleSignIn);

module.exports = router;
