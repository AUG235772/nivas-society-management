const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. ADD USER (Admin Only)
exports.addUser = async (req, res) => {
    try {
        const { name, email, password, flatNo, phoneNumber } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        // Check if flat is already occupied in THIS society
        if (!req.societyId && req.user.role === 'admin') {
            return res.status(400).json({ message: "Admin has no society assigned" });
        }
        const existingResident = await User.findOne({ flatNo, role: 'resident', societyId: req.societyId });
        if (existingResident) return res.status(400).json({ message: `Flat ${flatNo} is already assigned to ${existingResident.name}` });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            flatNo,
            phoneNumber,
            role: 'resident',
            societyId: req.societyId // Assign to same society as admin
        });

        await user.save();
        res.status(201).json({ message: "New Resident Added Successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        // If user is developer, they might not have societyId
        const tokenPayload = {
            id: user._id,
            role: user.role,
            name: user.name,
            societyId: user.societyId
        };
        if (user.flatNo) tokenPayload.flatNo = user.flatNo;

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                flatNo: user.flatNo,
                email: user.email,
                phoneNumber: user.phoneNumber,
                societyId: user.societyId
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. GET ALL RESIDENTS
exports.getAllResidents = async (req, res) => {
    try {
        const query = { role: 'resident' };
        if (req.societyId) query.societyId = req.societyId;

        const residents = await User.find(query).select('-password');
        res.json(residents);
    } catch (err) {
        res.status(500).json({ message: "Server Error fetching residents" });
    }
};

// 4. DELETE RESIDENT
exports.deleteResident = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Resident removed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server Error deleting resident" });
    }
};

// 5. UPDATE PROFILE
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { name, email, phoneNumber, password } = req.body;

        const update = {};
        if (name) update.name = name;
        if (email) update.email = email;
        if (phoneNumber) update.phoneNumber = phoneNumber;

        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash(password, salt);
        }

        const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
        if (!updated) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Profile updated', user: updated });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};