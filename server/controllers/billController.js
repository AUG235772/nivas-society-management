const Bill = require('../models/Bill');
const User = require('../models/User');
const crypto = require('crypto');
const PDFDocument = require('pdfkit'); // 📦 REQUIRED: npm install pdfkit

let Razorpay = null;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        Razorpay = require('razorpay');
    }
} catch (e) {
    console.warn('Razorpay module not found.');
}

// 1. Generate Bills
exports.generateBills = async (req, res) => {
    try {
        const { month, amount } = req.body;
        const residents = await User.find({ role: 'resident', societyId: req.societyId });
        if (residents.length === 0) return res.status(400).json({ message: 'No residents found in this society' });

        const existing = await Bill.findOne({ month, societyId: req.societyId });
        if (existing) return res.status(400).json({ message: `Bills for ${month} already generated!` });

        const bills = residents.map(resident => ({
            user: resident._id,
            month,
            amount,
            status: 'Unpaid',
            societyId: req.societyId
        }));

        await Bill.insertMany(bills);
        res.status(201).json({ message: `Generated bills for ${residents.length} residents!` });
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

// 2. Get My Bills
exports.getMyBills = async (req, res) => {
    try {
        const bills = await Bill.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(bills);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

// 3. Create Payment Order
exports.createPaymentOrder = async (req, res) => {
    try {
        const { amount, billId } = req.body;
        if (!amount || !billId) return res.status(400).json({ message: 'Invalid Data' });

        if (Razorpay) {
            const razor = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
            const order = await razor.orders.create({
                amount: Math.round(Number(amount) * 100),
                currency: 'INR',
                receipt: `bill_${billId}`,
                payment_capture: 1
            });
            return res.json({ orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID });
        }

        // Mock
        return res.json({ orderId: 'order_mock_' + Date.now(), amount: Math.round(Number(amount) * 100), currency: 'INR', key: 'rzp_test_mock' });
    } catch (err) { res.status(500).json({ message: 'Order Creation Failed' }); }
};

// 4. Verify Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billId } = req.body;
        const bill = await Bill.findById(billId);
        if (!bill) return res.status(404).json({ success: false });

        if (process.env.RAZORPAY_KEY_SECRET && razorpay_signature) {
            const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
            if (expected !== razorpay_signature) return res.status(400).json({ success: false });
        }

        bill.status = 'Paid';
        bill.paidAt = new Date();
        bill.razorpayPaymentId = razorpay_payment_id;
        bill.paymentMethod = 'razorpay';
        await bill.save();

        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
};

exports.verifyPaymentExternal = async (req, res) => {
    res.json({ success: true });
};

// 7. Get Key
exports.getRazorpayKey = async (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock' });
};

// 8. 📄 DOWNLOAD PDF RECEIPT (FIXED LAYOUT)
exports.downloadReceipt = async (req, res) => {
    try {
        const bill = await Bill.findById(req.params.billId).populate('user');

        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        if (req.user.role !== 'admin' && bill.user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Receipt_${bill.month}.pdf`);

        doc.pipe(res);

        // --- STYLING ---
        // 1. Top Bar (Logo)
        doc.rect(0, 0, 600, 100).fill('#4F46E5');
        doc.fillColor('#FFFFFF').fontSize(30).font('Helvetica-Bold').text('NIVAS', 50, 40);
        doc.fontSize(10).font('Helvetica').text('SOCIETY MANAGER', 50, 75);

        // 2. Receipt Title
        doc.fillColor('#FFFFFF').fontSize(20).text('PAYMENT RECEIPT', 400, 45, { align: 'right' });

        // 3. Info Grid
        const y = 150;
        doc.fillColor('#000000');

        // Left Column (Bill To)
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#6b7280').text('BILLED TO', 50, y);
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#111827').text(bill.user.name, 50, y + 15);
        doc.fontSize(10).font('Helvetica').fillColor('#374151').text(`Flat No: ${bill.user.flatNo}`, 50, y + 35);
        doc.text(`Email: ${bill.user.email}`, 50, y + 50);

        // Right Column (Receipt Details) - FIXED SPACING
        // Shifted X from 350 to 300 to give more width for long IDs
        const rightColX = 300;
        const rightColValX = 380;

        doc.fontSize(10).font('Helvetica-Bold').fillColor('#6b7280').text('RECEIPT DETAILS', rightColX, y);
        doc.fontSize(10).font('Helvetica').fillColor('#374151');

        doc.text(`Receipt ID:`, rightColX, y + 20)
            .text(bill._id.toString(), rightColValX, y + 20); // Now has more space

        doc.text(`Date Paid:`, rightColX, y + 35)
            .text(new Date(bill.paidAt || Date.now()).toLocaleDateString(), rightColValX, y + 35);

        doc.text(`Payment ID:`, rightColX, y + 50)
            .text(bill.razorpayPaymentId || 'Cash/Manual', rightColValX, y + 50);

        // 4. Divider
        doc.moveTo(50, y + 90).lineTo(550, y + 90).strokeColor('#e5e7eb').stroke();

        // 5. Line Items Header
        const tableTop = y + 110;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#4F46E5');
        doc.text('DESCRIPTION', 50, tableTop);
        doc.text('BILLING PERIOD', 250, tableTop);
        doc.text('AMOUNT', 450, tableTop, { align: 'right' });

        // 6. Line Item Row
        const rowTop = tableTop + 30;
        doc.rect(50, rowTop - 10, 500, 40).fill('#F3F4F6');
        doc.fillColor('#111827').fontSize(10).font('Helvetica');
        doc.text('Society Maintenance Charge', 60, rowTop + 5);
        doc.text(bill.month, 250, rowTop + 5);
        doc.font('Helvetica-Bold').text(`Rs. ${bill.amount.toLocaleString()}`, 450, rowTop + 5, { align: 'right' });

        // 7. Total
        const totalTop = rowTop + 60;
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#4F46E5');
        doc.text('TOTAL PAID', 350, totalTop);
        doc.text(`Rs. ${bill.amount.toLocaleString()}`, 450, totalTop, { align: 'right' });

        // 8. Footer
        doc.fontSize(10).font('Helvetica').fillColor('#9ca3af');
        doc.text('This is a computer generated receipt.', 50, 700, { align: 'center' });
        doc.text('Thank you for being a valued member of Nivas.', 50, 715, { align: 'center' });

        // 9. Watermark
        doc.save();
        doc.rotate(-45, { origin: [300, 400] });
        doc.fontSize(100).fillOpacity(0.1).fillColor('#10B981').text('PAID', 150, 400);
        doc.restore();

        doc.end();

    } catch (err) {
        console.error("PDF Error:", err);
        res.status(500).json({ message: 'Error generating receipt' });
    }
};

// 9. Get All Bills (Admin)
exports.getAllBills = async (req, res) => {
    try {
        const bills = await Bill.find({ societyId: req.societyId }).populate('user', 'name flatNo').sort({ createdAt: -1 });
        res.json(bills);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
};

// 10. Delete
exports.deleteBill = async (req, res) => {
    try { await Bill.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
    catch (err) { res.status(500).json({ message: 'Error' }); }
};

// 11. Delete Month
exports.deleteMonthBills = async (req, res) => {
    try { await Bill.deleteMany({ month: req.body.month, societyId: req.societyId }); res.json({ message: 'Deleted' }); }
    catch (err) { res.status(500).json({ message: 'Error' }); }
};