const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const cron = require('node-cron');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');

// --- MODELS ---
const Bill = require('./models/Bill');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Visitor = require('./models/Visitor');
const Complaint = require('./models/Complaint');
const Notice = require('./models/Notice');

const migrateData = require('./config/migration');

dotenv.config();

// DB Connect
connectDB().then(() => {
  if (typeof migrateData === 'function') {
    migrateData(); 
  }
});

const app = express();
app.get('/', (req, res) => {
  res.send('✅ NIVAS Server is Running Successfully!');
});
// 👇 CHANGE IS HERE (CORS allow all)
const corsOptions = {
  origin: '*', // Sabko allow karo taaki Vercel connect ho sake
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/developer', require('./routes/developerRoutes'));
app.use('/api/residents', require('./routes/residentRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/visitors', require('./routes/visitorRoutes'));
app.use('/api/sos', require('./routes/sosRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CRON JOBS (Wese hi rahenge jo aapne likhe hain...)
// ... (Aapke existing cron jobs yahan rahenge)

// PORT SETUP
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });
