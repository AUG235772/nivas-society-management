const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, complaintController.raiseComplaint);
router.get('/all', protect, complaintController.getAllComplaints);
router.get('/my', protect, complaintController.getMyComplaints);
router.put('/status/:id', protect, complaintController.updateStatus);

// ✅ DELETE ROUTE - ENSURE THIS IS PRESENT
router.delete('/:id', protect, complaintController.deleteComplaint);

module.exports = router;