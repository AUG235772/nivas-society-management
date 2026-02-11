const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    flatNo: { type: String, required: true },
    purpose: { type: String, required: true },
    vehicleNumber: { type: String, default: '' },
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date }, // Actual exit time
    expectedExitTime: { type: Date }, // NEW: Calculated limit
    status: {
        type: String,
        enum: ['Inside', 'Exited', 'Expected'],
        default: 'Inside'
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true }, // Society context
    addedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);