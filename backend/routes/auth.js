const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

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

// Google Sign-In route
router.post('/google-signin', authController.googleSignIn);

// Public username availability check (for registration)
router.get('/check-username', authController.checkUsernameAvailabilityPublic);

// Forgot password route
router.post('/forgot-password', authController.forgotPassword);

// Reset password route
router.post('/reset-password', authController.resetPassword);

module.exports = router;
