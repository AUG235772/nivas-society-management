const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');

// Debug check
if (!noticeController.addNotice || !noticeController.markRead) {
    console.error("❌ Notice Controller functions missing!");
}

router.post('/add', protect, noticeController.addNotice);
router.get('/all', protect, noticeController.getAllNotices);
router.delete('/:id', protect, noticeController.deleteNotice);
router.put('/:id/read', protect, noticeController.markRead); // Crash happened here

module.exports = router;