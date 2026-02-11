const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    vehicleNumber: {
        type: String,
        required: [true, 'Vehicle Number is required'],
        unique: true,
        uppercase: true
    },
    vehicleType: {
        type: String,
        required: true
        // REMOVED 'enum' to allow any type like "4 Wheeler (Car)"
    },
    modelName: {
        type: String,
        default: 'Unknown Model'
    },
    // We keep this field in DB but don't show it in UI
    parkingSlot: {
        type: String,
        default: ''
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    societyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Vehicle', vehicleSchema);