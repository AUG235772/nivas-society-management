const mongoose = require('mongoose');

const SOSSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true }, // Society context
  securityNumber: { type: String, default: '+91-9876543210' }, // Default security number
  presidentNumber: { type: String, default: '+91-8765432109' }, // Default president number
  customNumber: { type: String, required: true, default: '' }, // User can add their own number
  customName: { type: String, default: 'Emergency Contact' }, // Name for custom number
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SOS', SOSSchema);
