const SOS = require('../models/SOS');
const User = require('../models/User');
const Society = require('../models/Society');

// 1. Get SOS Numbers (For Residents & Admin Profile)
exports.getSOSNumbers = async (req, res) => {
    try {
        // A. Fetch President's Number from User Table (Scoped to Society)
        const president = await User.findOne({ role: 'admin', societyId: req.societyId }).select('phoneNumber');

        // B. Fetch Security Number from Society Settings
        const society = await Society.findById(req.societyId);

        // C. Fetch Custom Number (Only if user exists)
        let customData = { customNumber: '', customName: 'Emergency Contact' };
        if (req.user) {
            let userSOS = await SOS.findOne({ user: req.user.id });
            if (userSOS) {
                customData.customNumber = userSOS.customNumber;
                customData.customName = userSOS.customName;
            }
        }

        res.json({
            presidentNumber: president?.phoneNumber || '',
            securityNumber: society?.securityNumber || '',
            ...customData
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. Update Security Number (Admin Only)
exports.updateSecurityNumber = async (req, res) => {
    try {
        const { securityNumber } = req.body;

        // Update Society Settings
        await Society.findByIdAndUpdate(req.societyId, { securityNumber });

        res.json({ message: 'Security Number Updated', securityNumber });
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

// ... (Keep updateCustomSOS and removeCustomSOS as is) ...
exports.updateCustomSOS = async (req, res) => {
    try {
        const { customNumber, customName } = req.body;
        const sos = await SOS.findOneAndUpdate({ user: req.user.id }, { customNumber, customName }, { new: true, upsert: true });
        res.json({ sos });
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

exports.removeCustomSOS = async (req, res) => {
    try {
        await SOS.findOneAndUpdate({ user: req.user.id }, { customNumber: '', customName: 'Emergency Contact' });
        res.json({ message: 'Removed' });
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};