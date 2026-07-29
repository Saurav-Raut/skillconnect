const express = require('express');
const { createComplaint, getComplaints, updateComplaintStatus } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', protect, authorize('worker', 'household'), upload.single('evidence'), createComplaint);
router.get('/', protect, getComplaints);
router.put('/:id/status', protect, authorize('admin'), updateComplaintStatus);

module.exports = router;
