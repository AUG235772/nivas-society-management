const Society = require('../models/Society');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Create a new society
// @route   POST /api/developer/societies
// @access  Developer Only
exports.createSociety = async (req, res) => {
    try {
        const { name, address, adminEmail, adminPassword, secretKey } = req.body;

        // 1. Check if society exists
        const existingSociety = await Society.findOne({ name });
        if (existingSociety) {
            return res.status(400).json({ message: 'Society with this name already exists' });
        }

        // 2. Create Society
        const society = await Society.create({
            name,
            address,
            adminEmail,
            secretKey,
            isActive: true
        });

        // 3. Create Admin User for this Society
        // Check if user exists (maybe email used in another society? For now assuming global unique email)
        let adminUser = await User.findOne({ email: adminEmail });
        if (adminUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        adminUser = await User.create({
            name: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            societyId: society._id,
            flatNo: 'Admin Office',
            phoneNumber: '0000000000'
        });

        res.status(201).json({
            message: 'Society and Admin created successfully',
            society,
            admin: {
                id: adminUser._id,
                email: adminUser.email,
                societyId: adminUser.societyId
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Get all societies
// @route   GET /api/developer/societies
// @access  Developer Only
exports.getAllSocieties = async (req, res) => {
    try {
        const societies = await Society.find().select('-secretKey');
        res.json(societies);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete Society
// @route   DELETE /api/developer/societies/:id
// @access  Developer Only
exports.deleteSociety = async (req, res) => {
    try {
        const societyId = req.params.id;

        // 1. Delete Society
        const society = await Society.findByIdAndDelete(societyId);
        if (!society) {
            return res.status(404).json({ message: 'Society not found' });
        }

        // 2. Delete All Users in Society
        await User.deleteMany({ societyId });

        // 3. Delete All Related Data (Optional but recommended for clean slate)
        // require models if not already imported at top
        const Bill = require('../models/Bill');
        const Complaint = require('../models/Complaint');
        const Notice = require('../models/Notice');
        const Visitor = require('../models/Visitor');
        const Vehicle = require('../models/Vehicle');
        const SOS = require('../models/SOS');

        await Promise.all([
            Bill.deleteMany({ societyId }),
            Complaint.deleteMany({ societyId }),
            Notice.deleteMany({ societyId }),
            Visitor.deleteMany({ societyId }),
            Vehicle.deleteMany({ societyId }),
            SOS.deleteMany({ user: { $in: await User.find({ societyId }).select('_id') } })
        ]);

        res.json({ message: 'Society and all associated data deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset Admin Password
// @route   POST /api/developer/societies/:id/reset-password
// @access  Developer Only
exports.resetSocietyAdminPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const societyId = req.params.id;

        if (!password) {
            return res.status(400).json({ message: 'New password is required' });
        }

        // Find Admin for this Society
        const admin = await User.findOne({ role: 'admin', societyId });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found for this society' });
        }

        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);
        await admin.save();

        res.json({ message: 'Admin password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
