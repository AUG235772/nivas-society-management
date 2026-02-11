const Visitor = require('../models/Visitor');

// 1. Entry Visitor (Public/Admin/Security)
exports.entryVisitor = async (req, res) => {
    try {
        const { name, phone, flatNo, purpose, vehicleNumber, expectedDuration, duration, societyId } = req.body;

        // Determine Society ID
        // 1. From authenticated user
        // 2. From body (for public kiosk)
        const targetSocietyId = req.societyId || societyId;

        if (!targetSocietyId) {
            return res.status(400).json({ message: 'Society ID is required' });
        }

        // Safety: Handle Duration (Support both field names)
        let durationVal = parseFloat(duration || expectedDuration);
        if (isNaN(durationVal)) durationVal = 24; // Default to 24 hours

        // Safety: Handle Flat Number
        const safeFlatNo = flatNo ? flatNo.toString().trim() : 'Unknown';

        const entryDate = new Date();
        const calculatedExit = new Date(entryDate.getTime() + durationVal * 60 * 60 * 1000);

        const visitor = new Visitor({
            name: name || 'Guest',
            phone: phone || 'N/A',
            flatNo: safeFlatNo,
            purpose: purpose || 'Visit',
            vehicleNumber: vehicleNumber ? vehicleNumber.toUpperCase() : '',
            status: 'Inside',
            entryTime: entryDate,
            expectedExitTime: calculatedExit,
            addedBy: req.user ? req.user.role : 'Security/Kiosk',
            societyId: targetSocietyId
        });

        await visitor.save();
        res.status(201).json(visitor);
    } catch (err) {
        console.error("Entry Visitor Error:", err.message); // Log error, don't crash
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. Exit Visitor
exports.exitVisitor = async (req, res) => {
    try {
        await Visitor.findByIdAndUpdate(req.body.visitorId, {
            status: 'Exited',
            exitTime: Date.now()
        });
        res.json({ message: "Visitor Exited" });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. Get All Visitors (Admin)
exports.getAllVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.find({ societyId: req.societyId }).sort({ entryTime: -1 });
        res.json(visitors);
    } catch (err) {
        console.error("Get All Visitors Error:", err.message);
        res.json([]); // Return empty array to keep Dashboard alive
    }
};

// 4. Delete Visitor (Admin)
exports.deleteVisitor = async (req, res) => {
    try {
        await Visitor.findByIdAndDelete(req.params.id);
        res.json({ message: 'Visitor record deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 5. Get My Flat Visitors (Resident) - CRASH PROOFED
exports.getMyVisitors = async (req, res) => {
    try {
        // Safety: If user has no flat number (e.g. Admin account), return empty
        if (!req.user || !req.user.flatNo) {
            return res.json([]);
        }

        const myFlat = req.user.flatNo.toString().trim();

        // Regex search
        const visitors = await Visitor.find({
            flatNo: { $regex: new RegExp(myFlat, 'i') },
            societyId: req.societyId
        }).sort({ entryTime: -1 });

        res.json(visitors);
    } catch (err) {
        console.error("My Visitors Error:", err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 6. Pre-approve (Resident)
exports.preApproveVisitor = async (req, res) => {
    try {
        const { name, phone, purpose, vehicleNumber, duration } = req.body;

        let d = parseFloat(duration);
        if (isNaN(d)) d = 24;

        const visitor = new Visitor({
            name,
            phone,
            flatNo: req.user.flatNo || 'N/A',
            purpose,
            vehicleNumber: vehicleNumber || '',
            status: 'Expected',
            entryTime: new Date(),
            expectedExitTime: new Date(Date.now() + d * 60 * 60 * 1000),
            addedBy: 'Resident',
            societyId: req.societyId
        });
        await visitor.save();
        res.status(201).json(visitor);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};