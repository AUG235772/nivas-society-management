const mongoose = require('mongoose');

const GlobalSettingsSchema = new mongoose.Schema({
  securityNumber: { type: String, default: '' }
});

module.exports = mongoose.model('GlobalSettings', GlobalSettingsSchema);