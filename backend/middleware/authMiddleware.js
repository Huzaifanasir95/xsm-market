const jwt = require('jsonwebtoken');
const User = require('../models/UserSequelize');

exports.protect = async (req, res, next) => {
  try {
    // 1) Check if token exists
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'You are not logged in. Please log in to get access.' });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findByPk(decoded.userId);
    if (!currentUser) {
      return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
    }

    // 4) Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your token has expired. Please log in again.' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Error checking authentication', error: error.message });
  }
};

// Alias for compatibility with chat routes
exports.authenticateToken = exports.protect;
