const express = require('express');
const router = express.Router();
// FIX: Use destructuring {} because middleware exports { protect }
const { protect } = require('../middleware/authMiddleware'); 

const { 
    addUser, 
    login, 
    getAllResidents, 
    deleteResident, 
    updateProfile 
} = require('../controllers/authController');

// Debugging line (Optional: Remove in production)
// console.log("Auth Controllers Loaded:", { addUser, login }); 

router.post('/add-user', protect, addUser);
router.post('/login', login);
router.get('/residents', protect, getAllResidents); 
router.delete('/residents/:id', protect, deleteResident);
router.put('/me', protect, updateProfile);

module.exports = router;