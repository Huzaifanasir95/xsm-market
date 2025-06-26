const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register new user (send OTP for verification)
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Log registration attempt (filter out password)
    console.log('Registration attempt:', { username, email });

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
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
        existingUser.password = password; // Will be hashed by pre-save middleware
        const otp = existingUser.generateOTP();
        await existingUser.save();
        
        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, username);
        if (!emailResult.success) {
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
    const user = new User({
      username,
      email,
      password,
      isEmailVerified: false
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, username);
    if (!emailResult.success) {
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
    const user = await User.findOne({ email });
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

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
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
    const user = await User.findOne({ email });
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

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Email verified successfully! Welcome to XSM Market',
      token,
      user: {
        id: user._id,
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
    const user = await User.findOne({ email });
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
    if (!emailResult.success) {
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
    
    console.log('Verification status check:', { email });

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      authProvider: user.authProvider
    });

  } catch (error) {
    console.error('Verification status check error:', error);
    res.status(500).json({ message: 'Server error during status check', error: error.message });
  }
};

// Google OAuth
exports.googleAuth = async (req, res) => {
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
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.isEmailVerified = true; // Google emails are pre-verified
        if (picture && !user.profilePicture) {
          user.profilePicture = picture;
        }
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        username: name || email.split('@')[0],
        email,
        password: Math.random().toString(36).slice(-8), // Random password for Google users
        googleId,
        profilePicture: picture || '',
        authProvider: 'google',
        isEmailVerified: true // Google emails are pre-verified
      });
      
      console.log('New Google user created:', user._id);
    }

    // Generate token
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
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

// Alias for backward compatibility
exports.googleSignIn = exports.googleAuth;
