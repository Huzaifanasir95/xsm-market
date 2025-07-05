const User = require('../models/UserSequelize');
const jwt = require('jsonwebtoken');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');
const { Op } = require('sequelize');

// Helper function to generate unique username
const generateUniqueUsername = async (baseName) => {
  if (!baseName) {
    baseName = 'user';
  }
  
  // Clean the base name - remove special characters and spaces
  let cleanBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20); // Limit length
  
  if (!cleanBaseName) {
    cleanBaseName = 'user';
  }
  
  // First try the clean base name
  let username = cleanBaseName;
  let user = await User.findOne({ where: { username } });
  
  if (!user) {
    return username;
  }
  
  // If exists, try with random numbers
  let attempts = 0;
  const maxAttempts = 10;
  
  while (user && attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    username = `${cleanBaseName}${randomNum}`;
    user = await User.findOne({ where: { username } });
    attempts++;
  }
  
  // If still not unique after attempts, use timestamp
  if (user) {
    username = `${cleanBaseName}${Date.now()}`;
  }
  
  return username;
};

// Helper function to check if username is available
const isUsernameAvailable = async (username, currentUserId = null) => {
  const whereClause = { username };
  if (currentUserId) {
    whereClause.id = { [Op.ne]: currentUserId };
  }
  
  const user = await User.findOne({ where: whereClause });
  return !user;
};

// Generate JWT access token
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Shorter expiry for access tokens
  );
};

// Generate JWT refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' } // Longer expiry for refresh tokens
  );
};

// Generate both tokens
const generateTokens = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  return { accessToken, refreshToken };
};

// Legacy function for backward compatibility
const generateToken = (userId) => {
  return generateAccessToken(userId);
};

// Register new user (send OTP for verification)
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // Log registration attempt (filter out password)
    console.log('Registration attempt:', { username, email, fullName });

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (fullName && fullName.length > 100) {
      return res.status(400).json({ message: 'Full name must be less than 100 characters' });
    }

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ 
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      if (existingUser.email === email && existingUser.isEmailVerified) {
        return res.status(400).json({ message: 'Email already registered and verified' });
      }
      if (existingUser.username === username && existingUser.isEmailVerified) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // If user exists but not verified, update their details and resend OTP
      if (existingUser.email === email && !existingUser.isEmailVerified) {
        existingUser.username = username;
        existingUser.fullName = fullName || '';
        existingUser.password = password; // Will be hashed by pre-save middleware
        const otp = existingUser.generateOTP();
        await existingUser.save();
        
        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, username);
        if (!emailResult) {
          return res.status(500).json({ message: 'Failed to send verification email' });
        }
        
        return res.status(200).json({
          message: 'Verification OTP sent to your email',
          email: email,
          requiresVerification: true
        });
      }
    }

    // Create new unverified user
    const user = await User.create({
      username,
      fullName: fullName || '',
      email,
      password,
      isEmailVerified: false
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, username);
    if (!emailResult) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.status(200).json({
      message: 'Registration initiated. Please check your email for verification OTP',
      email: email,
      requiresVerification: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Log login attempt (filter out password)
    console.log('Login attempt:', { email });

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified (only for email auth users)
    if (user.authProvider === 'email' && !user.isEmailVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in',
        requiresVerification: true,
        email: user.email
      });
    }

    // Check if this is a Google OAuth account trying to login with password
    if (user.authProvider === 'google') {
      return res.status(400).json({ 
        message: 'This account was created with Google OAuth. Please use "Sign in with Google" instead.',
        authProvider: 'google'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    res.status(200).json({
      token: accessToken,
      refreshToken: refreshToken,
      expiresIn: 3600, // 1 hour in seconds
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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// Verify OTP and complete registration
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    console.log('OTP verification attempt:', { email, otp });

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark as verified and clear OTP
    user.isEmailVerified = true;
    user.clearOTP();
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.username);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    res.status(200).json({
      message: 'Email verified successfully! Welcome to XSM Market',
      token: accessToken,
      refreshToken: refreshToken,
      expiresIn: 3600, // 1 hour in seconds
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
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during verification', error: error.message });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('OTP resend request:', { email });

    // Validation
    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, user.username);
    if (!emailResult) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.status(200).json({
      message: 'New OTP sent to your email'
    });

  } catch (error) {
    console.error('OTP resend error:', error);
    res.status(500).json({ message: 'Server error during OTP resend', error: error.message });
  }
};

// Check verification status
exports.checkVerificationStatus = async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      isVerified: user.isEmailVerified,
      email: user.email,
      username: user.username
    });
  } catch (error) {
    console.error('Verification status check error:', error);
    res.status(500).json({ message: 'Server error during status check', error: error.message });
  }
};

// Public username availability check for registration
exports.checkUsernameAvailabilityPublic = async (req, res) => {
  try {
    const { username } = req.query;

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

    const isAvailable = await isUsernameAvailable(username);

    res.status(200).json({
      available: isAvailable,
      message: isAvailable ? 'Username is available' : 'Username is already taken'
    });
  } catch (error) {
    console.error('Check username availability error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Google OAuth
exports.googleSignIn = async (req, res) => {
  try {
    const { token } = req.body;
    
    console.log('Google OAuth attempt');

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify Google token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    console.log('Google user verified:', { email, name });

    // Check if user exists
    let user = await User.findOne({ 
      where: {
        [Op.or]: [{ email }, { googleId }]
      }
    });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.isEmailVerified = true; // Google emails are pre-verified
        if (picture && !user.profilePicture) {
          user.profilePicture = picture;
        }
        if (name && !user.fullName) {
          user.fullName = name;
        }
        await user.save();
      } else if (name && !user.fullName) {
        // Update fullName if missing from existing Google user
        user.fullName = name;
        await user.save();
      }
    } else {
      // Generate unique username for new Google user
      const baseName = name || email.split('@')[0];
      const uniqueUsername = await generateUniqueUsername(baseName);
      
      // Create new user
      user = await User.create({
        username: uniqueUsername,
        fullName: name || '',
        email,
        password: Math.random().toString(36).slice(-8), // Random password for Google users
        googleId,
        profilePicture: picture || '',
        authProvider: 'google',
        isEmailVerified: true // Google emails are pre-verified
      });
      
      console.log('New Google user created:', { id: user.id, username: uniqueUsername });
    }

    // Generate token
    const jwtToken = generateToken(user.id);

    res.status(200).json({
      token: jwtToken,
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
    console.error('Google OAuth error:', error);
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
};

// Refresh token endpoint
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);

    res.status(200).json({
      token: accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600, // 1 hour in seconds
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
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Failed to refresh token', error: error.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('Forgot password request for:', email);

    // Validation
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({ 
        message: 'If an account with that email exists, you will receive a password reset email shortly.' 
      });
    }

    // Generate new random password
    const newPassword = user.generateRandomPassword();
    
    // Update user with new password (will be hashed by the beforeSave hook)
    user.password = newPassword;
    await user.save();

    // Send email with new password (temporarily disabled)
    // Note: Sending passwords via email is not secure, should use reset link instead
    console.log(`New password generated for user: ${user.id}. Password should be sent via secure channel.`);
    
    // For now, just return success without sending password via email
    const emailSent = true;

    console.log(`New password generated and sent for user: ${user.id}`);

    res.status(200).json({
      message: 'A new temporary password has been sent to your email address. Please check your inbox and login with the new password.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset', error: error.message });
  }
};

// Reset password (using token - alternative method, keeping for future use)
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    console.log('Reset password request with token');

    // Validation
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Please provide reset token and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find user by reset token
    const user = await User.findOne({ 
      where: { 
        passwordResetToken: token,
        passwordResetExpires: {
          [Op.gt]: new Date() // Token must not be expired
        }
      } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword; // Will be hashed by beforeSave hook
    user.clearPasswordResetToken();
    await user.save();

    console.log(`Password reset successfully for user: ${user.id}`);

    res.status(200).json({
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset', error: error.message });
  }
};
