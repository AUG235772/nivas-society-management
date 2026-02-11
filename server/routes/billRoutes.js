const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController'); // Ensure path is correct
const { protect } = require('../middleware/authMiddleware');

// ... existing routes ...
router.post('/generate', protect, billController.generateBills);
router.get('/all', protect, billController.getAllBills);
router.get('/my', protect, billController.getMyBills);
router.get('/razorpay-key', protect, billController.getRazorpayKey);
router.post('/create-order-public', protect, billController.createPaymentOrder);
router.post('/verify-public', protect, billController.verifyPayment);
router.post('/verify-external', billController.verifyPaymentExternal);
router.get('/receipt/:billId', protect, billController.downloadReceipt);
router.get('/receipt/:billId', protect, billController.downloadReceipt); // Must have 'protect'
// --- NEW ROUTES ---
router.delete('/:id', protect, billController.deleteBill); // Delete single
router.post('/delete-month', protect, billController.deleteMonthBills); // Delete bulk

module.exports = router;