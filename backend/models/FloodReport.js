const mongoose = require('mongoose');

const floodReportSchema = new mongoose.Schema({
  reporterName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  location: String,
  description: String,
  imageUrl: String,
  dangerLevel: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Moderate' },
  reportedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FloodReport', floodReportSchema);
