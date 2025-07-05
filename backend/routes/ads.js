const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', adController.getAllAds);
router.get('/stats', adController.getPlatformStats);

// Protected routes (require authentication)
router.post('/', protect, adController.createAd);
router.get('/user/my-ads', protect, adController.getUserAds);
router.put('/:id', protect, adController.updateAd);
router.delete('/:id', protect, adController.deleteAd);

// This should be last to avoid conflicts
router.get('/:id', adController.getAdById);

module.exports = router;
