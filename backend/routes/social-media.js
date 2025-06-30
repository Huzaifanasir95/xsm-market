const express = require('express');
const router = express.Router();

// Placeholder social media routes
router.get('/test', (req, res) => {
  res.json({ message: 'Social media routes working!' });
});

module.exports = router;