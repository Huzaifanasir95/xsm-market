const Ad = require('../models/Ad');
const User = require('../models/UserSequelize');
const { Op, fn, col } = require('sequelize');

// Create a new ad/listing
exports.createAd = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      channelUrl,
      platform,
      category,
      contentType,
      contentCategory,
      price,
      subscribers,
      monthlyIncome,
      isMonetized,
      incomeDetails,
      promotionDetails,
      screenshots,
      tags
    } = req.body;

    // Validation
    if (!title || !channelUrl || !platform || !category || !price) {
      return res.status(400).json({
        message: 'Title, channel URL, platform, category, and price are required'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: 'Price must be greater than 0'
      });
    }

    // Auto-detect platform from URL if not provided correctly
    let detectedPlatform = platform.toLowerCase();
    if (channelUrl.includes('youtube.com') || channelUrl.includes('youtu.be')) {
      detectedPlatform = 'youtube';
    } else if (channelUrl.includes('facebook.com') || channelUrl.includes('fb.com')) {
      detectedPlatform = 'facebook';
    } else if (channelUrl.includes('instagram.com')) {
      detectedPlatform = 'instagram';
    } else if (channelUrl.includes('twitter.com') || channelUrl.includes('x.com')) {
      detectedPlatform = 'twitter';
    } else if (channelUrl.includes('tiktok.com')) {
      detectedPlatform = 'tiktok';
    }

    const ad = await Ad.create({
      userId,
      title,
      description,
      channelUrl,
      platform: detectedPlatform,
      category,
      contentType,
      contentCategory,
      price: parseFloat(price),
      subscribers: subscribers ? parseInt(subscribers) : 0,
      monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : 0,
      isMonetized: Boolean(isMonetized),
      incomeDetails,
      promotionDetails,
      screenshots: screenshots || [],
      tags: tags || [],
      status: 'active' // All new ads start as active for immediate listing
    });

    console.log(`New ad created: ${ad.id} by user ${userId}`);

    res.status(201).json({
      message: 'Ad created successfully and is now live!',
      ad: {
        id: ad.id,
        title: ad.title,
        platform: ad.platform,
        price: ad.price,
        status: ad.status,
        createdAt: ad.createdAt
      }
    });

  } catch (error) {
    console.error('Create ad error:', error);
    console.error('Request body:', req.body);
    console.error('User ID:', req.user?.id);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all ads (public - for marketplace display)
exports.getAllAds = async (req, res) => {
  try {
    const {
      platform,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = {
      status: 'active', // Only show active ads
    };

    if (platform && platform !== 'all') {
      whereConditions.platform = platform;
    }

    if (category && category !== 'all') {
      whereConditions.category = category;
    }

    if (minPrice || maxPrice) {
      whereConditions.price = {};
      if (minPrice) whereConditions.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereConditions.price[Op.lte] = parseFloat(maxPrice);
    }

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { contentCategory: { [Op.like]: `%${search}%` } }
      ];
    }

    // Valid sort fields
    const validSortFields = ['createdAt', 'price', 'subscribers', 'views'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const ads = await Ad.findAndCountAll({
      where: whereConditions,
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'username', 'profilePicture'],
        required: true
      }],
      order: [[sortField, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      ads: ads.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(ads.count / limit),
        totalItems: ads.count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all ads error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single ad by ID
exports.getAdById = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findOne({
      where: { 
        id: parseInt(id),
        status: { [Op.in]: ['active', 'pending'] } // Allow viewing pending ads
      },
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'username', 'profilePicture', 'createdAt']
      }]
    });

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    // Increment view count
    await ad.increment('views');

    res.status(200).json({ ad });

  } catch (error) {
    console.error('Get ad by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's ads (protected)
exports.getUserAds = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    
    const whereConditions = { userId };
    
    if (status && status !== 'all') {
      whereConditions.status = status;
    }

    const ads = await Ad.findAndCountAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      ads: ads.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(ads.count / limit),
        totalItems: ads.count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get user ads error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update ad (protected - only owner can update)
exports.updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const ad = await Ad.findOne({
      where: { id: parseInt(id), userId }
    });

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found or you do not have permission to edit it' });
    }

    // Prevent editing certain fields
    delete updateData.id;
    delete updateData.userId;
    delete updateData.status; // Only admin can change status
    delete updateData.verified;
    delete updateData.premium;
    delete updateData.views;
    delete updateData.soldAt;
    delete updateData.soldTo;

    await ad.update(updateData);

    res.status(200).json({
      message: 'Ad updated successfully',
      ad
    });

  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete ad (protected - only owner can delete)
exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const ad = await Ad.findOne({
      where: { id: parseInt(id), userId }
    });

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found or you do not have permission to delete it' });
    }

    await ad.destroy();

    res.status(200).json({ message: 'Ad deleted successfully' });

  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get platform statistics
exports.getPlatformStats = async (req, res) => {
  try {
    const stats = await Ad.findAll({
      attributes: [
        'platform',
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('price')), 'avgPrice'],
        [fn('SUM', col('subscribers')), 'totalSubscribers']
      ],
      where: {
        status: 'active'
      },
      group: ['platform'],
      raw: true
    });

    res.status(200).json({ stats });

  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
