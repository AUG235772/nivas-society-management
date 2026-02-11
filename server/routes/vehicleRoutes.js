const express = require('express');
const router = express.Router();

// Controllers Import
const { 
    addVehicle, 
    searchVehicle, 
    getAllVehicles, 
    deleteVehicle 
} = require('../controllers/vehicleController');

// Middleware Import - FIXED (Added Curly Braces)
const { protect } = require('../middleware/authMiddleware');

// --- Routes ---

// POST /api/vehicles/add
router.post('/add', protect, addVehicle);

// GET /api/vehicles/all
router.get('/all', protect, getAllVehicles);

// GET /api/vehicles/search/:plateNumber
router.get('/search/:plateNumber', protect, searchVehicle);

// DELETE /api/vehicles/:id (Added for future use)
router.delete('/:id', protect, deleteVehicle);

module.exports = router;