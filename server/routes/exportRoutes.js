const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware'); 

router.get('/bills', protect, exportController.exportBills);
router.get('/residents', protect, exportController.exportResidents);
router.get('/expenses', protect, exportController.exportExpenses);
router.get('/complaints', protect, exportController.exportComplaints);

// NEW: Visitor Export
router.get('/visitors', protect, exportController.exportVisitors);

module.exports = router;