const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// FIX: Use destructuring {}
const { protect } = require('../middleware/authMiddleware'); 

router.post('/', protect, expenseController.addExpense); 
router.get('/', protect, expenseController.getAllExpenses); 
router.get('/public', expenseController.getPublicExpenses); 
router.get('/summary', protect, expenseController.getExpenseSummary); 
router.delete('/:id', protect, expenseController.deleteExpense);

// NEW: Delete Month
router.post('/delete-month', protect, expenseController.deleteMonthExpenses);

module.exports = router;