const Expense = require('../models/Expense');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper: Send immediate email notification
const sendExpenseNotification = async (expense, adderName) => {
    try {
        const users = await User.find({}, 'email');
        const recipients = users.map(u => u.email).filter(email => email);

        if (recipients.length === 0) return;

        const mailOptions = {
            from: `"Nivas Society Manager" <${process.env.EMAIL_USER}>`,
            to: recipients,
            subject: `New Society Expense: ₹${expense.amount} (${expense.category})`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; max-width: 600px;">
                    <h2 style="color: #4F46E5;">New Expense Recorded</h2>
                    <p>Recorded by <strong>${adderName}</strong>.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <tr><td style="padding: 8px; border: 1px solid #ddd;">Category</td><td style="padding: 8px; border: 1px solid #ddd;">${expense.category}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd;">Amount</td><td style="padding: 8px; border: 1px solid #ddd; color: #d97706; font-weight: bold;">₹${expense.amount}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd;">Date</td><td style="padding: 8px; border: 1px solid #ddd;">${new Date(expense.date).toLocaleDateString()}</td></tr>
                        <tr><td style="padding: 8px; border: 1px solid #ddd;">Description</td><td style="padding: 8px; border: 1px solid #ddd;">${expense.description}</td></tr>
                    </table>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Expense Notification Sent!");
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
    }
};

// 1. Add Expense
exports.addExpense = async (req, res) => {
    try {
        const { title, amount, category, description, date } = req.body;

        const expense = new Expense({
            title,
            amount,
            category,
            description,
            date: date || Date.now(),
            addedBy: req.user.id,
            societyId: req.societyId // Auto-inject societyId
        });

        await expense.save();

        // Send Email
        const adderName = req.user.name || 'Society Admin';
        sendExpenseNotification(expense, adderName);

        res.status(201).json(expense);
    } catch (err) {
        console.error("Add Expense Error:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 2. Get All Expenses (Admin)
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ societyId: req.societyId }).sort({ date: -1 });
        res.json(expenses);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

// 3. Get Public Expenses (Resident)
exports.getPublicExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ societyId: req.societyId }).select('category amount description date').sort({ date: -1 });
        res.json(expenses);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

// 4. Get Summary
exports.getExpenseSummary = async (req, res) => {
    try {
        const summary = await Expense.aggregate([
            { $match: { societyId: req.societyId } }, // Filter by society
            { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);
        res.json(summary);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

// 5. Delete Single Expense
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, societyId: req.societyId });
        if (!expense) return res.status(404).json({ message: 'Expense not found or unauthorized' });
        res.json({ message: 'Expense deleted successfully' });
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

// 6. Delete Month Expenses (Bulk)
exports.deleteMonthExpenses = async (req, res) => {
    try {
        const { month } = req.body; // e.g., "February 2026"

        // Parse "Month Year" to Date Range
        const date = new Date(Date.parse(month + " 1"));
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const result = await Expense.deleteMany({
            societyId: req.societyId, // Ensure isolation
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        res.json({ message: `Deleted ${result.deletedCount} expenses for ${month}` });
    } catch (err) {
        console.error("Delete Month Error:", err);
        res.status(500).json({ message: 'Error deleting monthly expenses' });
    }
};