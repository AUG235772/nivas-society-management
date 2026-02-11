const Complaint = require('../models/Complaint');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({ from: `"Nivas System" <${process.env.EMAIL_USER}>`, to, subject, html });
};

exports.raiseComplaint = async (req, res) => {
    try {
        const { title, description, photo } = req.body;
        const complaint = new Complaint({
            user: req.user.id,
            societyId: req.societyId,
            title,
            description,
            photo,
            status: 'Pending'
        });
        await complaint.save();

        const president = await User.findOne({ role: 'admin', societyId: req.societyId });
        if (president?.email) {
            sendEmail(
                president.email,
                `New Complaint: ${title}`,
                `<p><strong>Resident:</strong> ${req.user.name}</p><p><strong>Issue:</strong> ${description}</p>`
            ).catch(e => console.error("Email failed:", e));
        }
        res.status(201).json(complaint);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ societyId: req.societyId }).populate('user', 'name flatNo').sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

exports.getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(complaint);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

// ✅ ADDED THIS FUNCTION - IT WAS MISSING CAUSING 404
exports.deleteComplaint = async (req, res) => {
    try {
        const deleted = await Complaint.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.json({ message: 'Complaint deleted successfully' });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};