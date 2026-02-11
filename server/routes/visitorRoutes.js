const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { protect } = require('../middleware/authMiddleware'); 

// 1. PUBLIC ROUTE (For Self-Registration Kiosk/Page)
// No 'protect' middleware here so anyone can access it
router.post('/public-entry', visitorController.entryVisitor); 

// 2. PROTECTED ROUTES (Admin/Security)
router.post('/entry', protect, visitorController.entryVisitor); 
router.post('/exit', protect, visitorController.exitVisitor);
router.get('/all', protect, visitorController.getAllVisitors); 
router.delete('/:id', protect, visitorController.deleteVisitor); 

// 3. RESIDENT ROUTES
router.post('/pre-approve', protect, visitorController.preApproveVisitor);
router.get('/my-flat', protect, visitorController.getMyVisitors);

module.exports = router;