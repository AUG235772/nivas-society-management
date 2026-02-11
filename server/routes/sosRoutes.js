const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const { protect } = require('../middleware/authMiddleware');

// Public/Resident Routes
router.get('/my', protect, sosController.getSOSNumbers);
router.put('/update', protect, sosController.updateCustomSOS);
router.delete('/remove', protect, sosController.removeCustomSOS);

// Admin Routes
router.put('/security', protect, sosController.updateSecurityNumber); // New Route

module.exports = router;