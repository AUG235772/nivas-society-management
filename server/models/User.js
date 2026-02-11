const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    flatNo: { type: String }, // Not required for developer
    phoneNumber: { type: String }, // Not required for developer
    role: { type: String, enum: ['admin', 'resident', 'developer'], default: 'resident' },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' } // Link to Society
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);