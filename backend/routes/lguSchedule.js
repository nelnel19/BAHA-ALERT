const express = require('express');
const router = express.Router();
const LguSchedule = require('../models/LguSchedule');
const upload = require('../middleware/multer');
const cloudinary = require('../utils/cloudinary');

// GET public schedules
router.get('/', async (req, res) => {
  const events = await LguSchedule.find().sort({ date: 1 });
  res.json(events);
});

// GET admin schedules
router.get('/admin', async (req, res) => {
  try {
    const schedules = await LguSchedule.find().sort({ createdAt: -1 });
    res.status(200).json(schedules);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch schedules." });
  }
});

// POST create new schedule (with image)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, date, category, location } = req.body;

    const newEvent = new LguSchedule({
      title,
      description,
      date,
      category,
      location,
      imageUrl: req.file?.path || '',
      imagePublicId: req.file?.filename || '',
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create schedule.' });
  }
});

// PATCH update a schedule (with optional new image)
router.patch('/:id', upload.single('image'), async (req, res) => {
  try {
    const schedule = await LguSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Event not found' });

    // Remove old image from Cloudinary if new one is uploaded
    if (req.file && schedule.imagePublicId) {
      await cloudinary.uploader.destroy(schedule.imagePublicId);
    }

    // Update schedule fields
    schedule.title = req.body.title || schedule.title;
    schedule.description = req.body.description || schedule.description;
    schedule.date = req.body.date || schedule.date;
    schedule.category = req.body.category || schedule.category;
    schedule.location = req.body.location || schedule.location;

    // If new image uploaded, update image fields
    if (req.file) {
      schedule.imageUrl = req.file.path;
      schedule.imagePublicId = req.file.filename;
    }

    await schedule.save();
    res.status(200).json(schedule);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update schedule.' });
  }
});

// DELETE schedule (and image from Cloudinary)
router.delete('/:id', async (req, res) => {
  try {
    const schedule = await LguSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Event not found' });

    // Delete image if present
    if (schedule.imagePublicId) {
      await cloudinary.uploader.destroy(schedule.imagePublicId);
    }

    await LguSchedule.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Event and image deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// GET count of all schedules
router.get('/count', async (req, res) => {
  try {
    const count = await LguSchedule.countDocuments();
    res.status(200).json({ totalEvents: count });
  } catch (err) {
    res.status(500).json({ error: "Failed to count schedules." });
  }
});

module.exports = router;
