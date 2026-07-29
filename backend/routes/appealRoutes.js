const express = require('express');
const { createAppeal, getAppeals, updateAppealStatus } = require('../controllers/appealController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('worker'), createAppeal);
router.get('/', protect, getAppeals);
router.put('/:id/status', protect, authorize('admin'), updateAppealStatus);

module.exports = router;
