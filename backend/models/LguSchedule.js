const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  category: { type: String, enum: ['pump_truck', 'relief_goods', 'road_closure'] },
  location: String,
  imageUrl: String,
  imagePublicId: String, // 👈 Add this to track image for deletion
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model('LguSchedule', scheduleSchema);
