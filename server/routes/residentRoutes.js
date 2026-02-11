const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');
const { protect } = require('../middleware/authMiddleware');

// Route: /api/residents
router.get('/', protect, residentController.getAllResidents);
router.delete('/:id', protect, residentController.deleteResident);

module.exports = router;