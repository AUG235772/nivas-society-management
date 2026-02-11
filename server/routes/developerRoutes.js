const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developerController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to check if user is developer
const developerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'developer') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as developer' });
    }
};

router.post('/societies', protect, developerOnly, developerController.createSociety);
router.get('/societies', protect, developerOnly, developerController.getAllSocieties);
router.delete('/societies/:id', protect, developerOnly, developerController.deleteSociety);
router.post('/societies/:id/reset-password', protect, developerOnly, developerController.resetSocietyAdminPassword);

module.exports = router;
