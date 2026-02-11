const ExcelJS = require('exceljs');
const Bill = require('../models/Bill');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Complaint = require('../models/Complaint');
const Visitor = require('../models/Visitor');

// Helper to set headers for download
const setExcelHeaders = (res, filename) => {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
};

// 1. Export Bills
exports.exportBills = async (req, res) => {
    try {
        const { month, excludeMonth } = req.query;
        let filter = {};

        if (req.user.role !== 'admin') {
            filter.user = req.user.id;
        }

        if (month) {
            filter.month = { $regex: month, $options: 'i' }; 
        } else if (excludeMonth) {
            filter.month = { $not: { $regex: excludeMonth, $options: 'i' } };
        }

        const bills = await Bill.find(filter).populate('user', 'name flatNo');
        
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Bills');
        
        sheet.columns = [
            { header: 'Month', key: 'month', width: 30 },
            { header: 'Resident', key: 'resident', width: 20 },
            { header: 'Flat No', key: 'flatNo', width: 10 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Paid Date', key: 'paidAt', width: 20 },
        ];

        bills.forEach(b => {
            sheet.addRow({
                month: b.month,
                resident: b.user?.name || 'N/A',
                flatNo: b.user?.flatNo || 'N/A',
                amount: b.amount,
                status: b.status,
                paidAt: b.paidAt ? new Date(b.paidAt).toLocaleDateString() : '-'
            });
        });

        const fileName = month ? `Bills_${month}` : 'Bills_History';
        setExcelHeaders(res, fileName);
        
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("Export Error:", err);
        res.status(500).json({ message: 'Export failed' });
    }
};

// 2. Export Residents
exports.exportResidents = async (req, res) => {
    try {
        const residents = await User.find({ role: 'resident' });
        
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Residents');
        
        sheet.columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Flat No', key: 'flatNo', width: 10 },
            { header: 'Phone', key: 'phone', width: 15 },
        ];

        residents.forEach(r => {
            sheet.addRow({
                name: r.name,
                email: r.email,
                flatNo: r.flatNo,
                phone: r.phoneNumber
            });
        });

        setExcelHeaders(res, 'Residents_List');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: 'Export failed' });
    }
};

// 3. Export Expenses
exports.exportExpenses = async (req, res) => {
    try {
        const { month, excludeMonth } = req.query;
        let filter = {};

        if (month) {
            const date = new Date(Date.parse(month + " 1"));
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
            filter.date = { $gte: start, $lte: end };
        } else if (excludeMonth) {
            const date = new Date(Date.parse(excludeMonth + " 1"));
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
            filter.date = { $not: { $gte: start, $lte: end } };
        }

        const expenses = await Expense.find(filter).sort({ date: -1 });
        
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Expenses');
        
        sheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Description', key: 'desc', width: 30 },
            { header: 'Amount', key: 'amount', width: 15 },
        ];

        expenses.forEach(e => {
            sheet.addRow({
                date: new Date(e.date).toLocaleDateString(),
                category: e.category,
                desc: e.description,
                amount: e.amount
            });
        });

        const fileName = month ? `Expenses_${month}` : 'Expenses_History';
        setExcelHeaders(res, fileName);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Export failed' });
    }
};

// 4. Export Complaints
exports.exportComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().populate('user', 'name flatNo').sort({ createdAt: -1 });
        
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Complaints');
        
        sheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Resident', key: 'resident', width: 20 },
            { header: 'Flat No', key: 'flat', width: 10 },
            { header: 'Title', key: 'title', width: 25 },
            { header: 'Description', key: 'desc', width: 40 },
            { header: 'Status', key: 'status', width: 15 },
        ];

        complaints.forEach(c => {
            sheet.addRow({
                date: new Date(c.createdAt).toLocaleDateString(),
                resident: c.user?.name || 'Unknown',
                flat: c.user?.flatNo || 'N/A',
                title: c.title,
                desc: c.description,
                status: c.status
            });
        });

        setExcelHeaders(res, 'Complaints_Report');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error("Export Error:", err);
        res.status(500).json({ message: 'Export failed' });
    }
};

// 5. Export Visitors
exports.exportVisitors = async (req, res) => {
    try {
        const { month, excludeMonth } = req.query;
        let filter = {};

        if (month) {
            const date = new Date(Date.parse(month + " 1"));
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
            filter.entryTime = { $gte: start, $lte: end };
        } else if (excludeMonth) {
            const date = new Date(Date.parse(excludeMonth + " 1"));
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
            filter.entryTime = { $not: { $gte: start, $lte: end } };
        }

        const visitors = await Visitor.find(filter).sort({ entryTime: -1 });
        
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Visitors');
        
        sheet.columns = [
            { header: 'Date', key: 'date', width: 12 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Flat', key: 'flat', width: 8 },
            { header: 'Purpose', key: 'purpose', width: 20 },
            { header: 'Vehicle', key: 'vehicle', width: 15 },
            { header: 'In Time', key: 'in', width: 12 },
            { header: 'Out Time', key: 'out', width: 12 },
            { header: 'Status', key: 'status', width: 10 },
        ];

        visitors.forEach(v => {
            sheet.addRow({
                date: new Date(v.entryTime).toLocaleDateString(),
                name: v.name,
                flat: v.flatNo,
                purpose: v.purpose,
                vehicle: v.vehicleNumber || '-',
                in: new Date(v.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                out: v.exitTime ? new Date(v.exitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
                status: v.status
            });
        });

        const fileName = month ? `Visitors_${month}` : 'Visitors_History';
        setExcelHeaders(res, fileName);
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Export failed' });
    }
};