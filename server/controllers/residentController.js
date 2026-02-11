const User = require('../models/User');
const Bill = require('../models/Bill');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Visitor = require('../models/Visitor');
const SOS = require('../models/SOS');

// Get All Residents
exports.getAllResidents = async (req, res) => {
    try {
        const query = { role: 'resident' };
        if (req.societyId) query.societyId = req.societyId;

        const residents = await User.find(query).select('-password');
        res.json(residents);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete Resident & Associated Data
exports.deleteResident = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Cleanup associated data to keep DB clean
        await Bill.deleteMany({ user: userId });
        await Complaint.deleteMany({ user: userId });
        await SOS.deleteMany({ user: userId });
        // Optional: Remove user from 'readBy' in Notices if you want extreme cleanup

        await User.findByIdAndDelete(userId);

        res.json({ message: 'Resident and associated data removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};