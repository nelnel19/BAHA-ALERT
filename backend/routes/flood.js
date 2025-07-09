const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const axios = require('axios');
const sharp = require('sharp');

// POST /api/flood-analyze
router.post('/flood-analyze', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file.path; // Cloudinary URL

    // Download image from Cloudinary
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');

    // Analyze image with sharp
    const metadata = await sharp(imageBuffer).stats();
    const avgGreen = metadata.channels[1].mean;
    const avgBlue = metadata.channels[2].mean;

    // Simulate severity score
    const severityScore = Math.min(100, Math.max(0, Math.floor((avgGreen + avgBlue) / 2)));

    // Classify danger level
    let dangerLevel = '';
    let description = '';
    let safeToPass = false;

    if (severityScore < 35) {
      dangerLevel = 'Low';
      description = 'Safe to cross. Water appears shallow and manageable.';
      safeToPass = true;
    } else if (severityScore < 70) {
      dangerLevel = 'Moderate';
      description = 'Moderate flooding detected. Exercise caution. Small vehicles and pedestrians should avoid crossing.';
    } else {
      dangerLevel = 'High';
      description = 'Severe flooding detected. Water levels are dangerously high. Avoid crossing at all costs.';
    }

    const result = {
      imageUrl,
      dangerLevel,
      severityScore,
      safeToPass,
      description,
      recommendations: [
        dangerLevel === 'High' && 'Seek higher ground immediately.',
        dangerLevel === 'Moderate' && 'Monitor water level changes closely.',
        dangerLevel === 'Low' && 'Stay alert and inform others of clear routes.',
      ].filter(Boolean),
      timestamp: new Date().toISOString()
    };

    res.json(result);
  } catch (error) {
    console.error('Flood analyze error:', error);
    res.status(500).json({ error: 'Something went wrong during flood analysis.' });
  }
});

module.exports = router;
