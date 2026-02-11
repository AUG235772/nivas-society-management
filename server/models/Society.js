const mongoose = require('mongoose');

const societySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    adminEmail: { type: String, required: true }, // Initial admin email
    secretKey: { type: String, required: true }, // For verification
    securityNumber: { type: String, default: '' }, // Society specific security number
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Society', societySchema);
