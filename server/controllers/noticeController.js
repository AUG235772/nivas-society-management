const Notice = require('../models/Notice');
const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.addNotice = async (req, res) => {
    try {
        const { title, message, priority } = req.body;
        const notice = new Notice({ title, message, priority, societyId: req.societyId });
        await notice.save();

        // 📧 SEND EMAIL TO ALL RESIDENTS IN THIS SOCIETY
        const residents = await User.find({ role: 'resident', societyId: req.societyId }).select('email');
        const emails = residents.map(r => r.email).filter(e => e);

        if (emails.length > 0) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            // Send Emails
            emails.forEach(email => {
                transporter.sendMail({
                    from: `"Nivas Management" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: `📢 New Announcement: ${title}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                            <h2 style="color: ${priority === 'Urgent' ? '#e11d48' : '#4f46e5'}">${title}</h2>
                            <p style="color: #333; font-size: 16px;">${message}</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #888;">Log in to the Nivas Dashboard to view more details.</p>
                        </div>
                    `
                }).catch(err => console.error("Email failed:", err));
            });
        }
        res.status(201).json(notice);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

// ... (Keep getAllNotices, deleteNotice, markRead as before) ...
exports.getAllNotices = async (req, res) => { try { res.json(await Notice.find({ societyId: req.societyId }).sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ message: 'Error' }); } };
exports.deleteNotice = async (req, res) => { try { await Notice.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } catch (e) { res.status(500).json({ message: 'Error' }); } };
exports.markRead = async (req, res) => { try { await Notice.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user.id } }); res.json({ message: 'Read' }); } catch (e) { res.status(500).json({ message: 'Error' }); } };