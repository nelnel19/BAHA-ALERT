const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');

// POST /api/flood-analyze
router.post('/flood-analyze', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file.path; // cloudinary URL

    // Simulated danger level (replace with real ML logic if needed)
    const levels = ['Low', 'Moderate', 'High'];
    const randomIndex = Math.floor(Math.random() * 3);
    const dangerLevel = levels[randomIndex];

    const result = {
      imageUrl,
      dangerLevel,
      safeToPass: dangerLevel === 'Low',
      description:
        dangerLevel === 'Low'
          ? 'Safe to cross. Water appears shallow.'
          : dangerLevel === 'Moderate'
          ? 'Moderate flooding. Be cautious.'
          : 'Dangerous water levels. Avoid crossing.',
    };

    res.json(result);
  } catch (error) {
    console.error('Flood analyze error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
