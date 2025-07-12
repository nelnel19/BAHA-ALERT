// routes/floodReports.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const FloodReport = require('../models/FloodReport');

// POST endpoint for uploading flood report
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { reporterName, contactNumber, location, description, dangerLevel } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image is required' });
    }

    const imageUrl = req.file.path;

    // Standardize contact number format
    const cleanedContactNumber = contactNumber.replace(/\D/g, '');

    const report = new FloodReport({
      reporterName,
      contactNumber: cleanedContactNumber, // Store cleaned number
      location,
      description,
      imageUrl,
      dangerLevel,
    });

    await report.save();
    res.status(201).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET endpoint for fetching reports
router.get('/my-reports', async (req, res) => {
  try {
    const { reporterName, contactNumber } = req.query;

    if (!reporterName && !contactNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing reporterName or contactNumber in query',
      });
    }

    const filter = {};
    if (reporterName) filter.reporterName = new RegExp(reporterName, 'i');
    if (contactNumber) {
      // Clean the contact number for comparison
      const cleanedNumber = contactNumber.replace(/\D/g, '');
      filter.contactNumber = cleanedNumber;
    }

    const reports = await FloodReport.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add this route before module.exports
// GET endpoint for fetching all reports (for admin purposes)
router.get('/', async (req, res) => {
  try {
    const reports = await FloodReport.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT endpoint for updating a report
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reporterName, contactNumber, location, description, dangerLevel } = req.body;
    
    const updateData = {
      reporterName,
      contactNumber: contactNumber.replace(/\D/g, ''),
      location,
      description,
      dangerLevel
    };

    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const updatedReport = await FloodReport.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedReport) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.status(200).json({ success: true, report: updatedReport });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE endpoint for deleting a report
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReport = await FloodReport.findByIdAndDelete(id);
    
    if (!deletedReport) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// GET endpoint for getting report count
router.get('/reportcount', async (req, res) => {
  try {
    const count = await FloodReport.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;