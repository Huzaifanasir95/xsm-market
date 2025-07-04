const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase().trim());
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true, // Can be null for Google users
    validate: {
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters long'
      }
    }
  },
  profilePicture: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  googleId: {
    type: DataTypes.STRING(255),
    allowNull: true
    // Note: Unique constraint on nullable field can cause issues in some DBs
    // We'll handle uniqueness in application logic for Google IDs
  },
  authProvider: {
    type: DataTypes.ENUM('email', 'google'),
    allowNull: false,
    defaultValue: 'email'
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  emailOTP: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  otpExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true, // This adds createdAt and updatedAt
  hooks: {
    beforeSave: async (user) => {
      // Hash password before saving if it's modified
      if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
  // Removed duplicate indexes - unique constraints in field definitions are sufficient
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.emailOTP = otp;
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  return otp;
};

User.prototype.verifyOTP = function(otp) {
  if (!this.emailOTP || !this.otpExpires) {
    return false;
  }
  
  const now = new Date();
  if (now > this.otpExpires) {
    return false; // OTP expired
  }
  
  return this.emailOTP === otp;
};

User.prototype.clearOTP = function() {
  this.emailOTP = null;
  this.otpExpires = null;
};

// Generate password reset token
User.prototype.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
  return resetToken;
};

// Verify password reset token
User.prototype.verifyPasswordResetToken = function(token) {
  if (!this.passwordResetToken || !this.passwordResetExpires) {
    return false;
  }
  
  const now = new Date();
  if (now > this.passwordResetExpires) {
    return false; // Token expired
  }
  
  return this.passwordResetToken === token;
};

// Clear password reset token
User.prototype.clearPasswordResetToken = function() {
  this.passwordResetToken = null;
  this.passwordResetExpires = null;
};

// Generate random password
User.prototype.generateRandomPassword = function() {
  const length = 10;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Custom validation for password requirement
User.addHook('beforeValidate', (user) => {
  // Password is required if not a Google user
  if (!user.googleId && !user.password) {
    throw new Error('Password is required for email registration');
  }
});

// Define associations
User.associate = (models) => {
  // A user can have many ads
  User.hasMany(models.Ad, {
    foreignKey: 'userId',
    as: 'ads',
    onDelete: 'CASCADE'
  });

  // A user can buy many ads
  User.hasMany(models.Ad, {
    foreignKey: 'soldTo',
    as: 'purchases',
    onDelete: 'SET NULL'
  });
};

module.exports = User;
