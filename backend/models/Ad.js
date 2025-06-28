const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ad = sequelize.define('Ad', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  channelUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true,
      isUrl: true
    }
  },
  platform: {
    type: DataTypes.ENUM('facebook', 'instagram', 'twitter', 'tiktok', 'youtube'),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  contentType: {
    type: DataTypes.ENUM('Unique content', 'Rewritten', 'Not unique content', 'Mixed'),
    allowNull: true
  },
  contentCategory: {
    type: DataTypes.STRING(100),
    allowNull: true

    // Categories like: Cars & Bikes, Luxury & Motivation, Pets & Animals, Games, etc.
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true
    }
  },
  subscribers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  monthlyIncome: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isMonetized: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  incomeDetails: {
    type: DataTypes.TEXT,
    allowNull: true
    // Ways of earning
  },
  promotionDetails: {
    type: DataTypes.TEXT,
    allowNull: true
    // Ways of promotion
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'sold', 'suspended', 'rejected'),
    allowNull: false,
    defaultValue: 'active'
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  premium: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  totalViews: {
    type: DataTypes.BIGINT,
    allowNull: true,
    defaultValue: 0
    // Total views on the channel/account
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  thumbnail: {
    type: DataTypes.TEXT,
    allowNull: true
    // URL or base64 of thumbnail image
  },
  screenshots: {
    type: DataTypes.JSON,
    allowNull: true
    // Array of screenshot URLs (proof of income, analytics, etc.)
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
    // Array of tags for better search
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
    // Internal notes for admin review
  },
  soldAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  soldTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'ads',
  timestamps: true, // createdAt and updatedAt
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['platform']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['price']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['platform', 'category']
    },
    {
      fields: ['status', 'verified']
    }
  ]
});

// Define associations
Ad.associate = (models) => {
  // An ad belongs to a user (seller)
  Ad.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'seller',
    onDelete: 'CASCADE'
  });

  // An ad can be sold to a user (buyer)
  Ad.belongsTo(models.User, {
    foreignKey: 'soldTo',
    as: 'buyer',
    onDelete: 'SET NULL'
  });
};

module.exports = Ad;
