const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['Normal', 'Urgent'], default: 'Normal' },
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true }, // Society context
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track who read
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', NoticeSchema);
