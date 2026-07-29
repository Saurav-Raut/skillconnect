const express = require('express');
const {
  verifyWorkerId,
  resolveComplaint,
  resolveAppeal,
  resolveBookingDispute
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.put('/verify-worker/:id', verifyWorkerId);
router.put('/complaints/:id', resolveComplaint);
router.put('/appeals/:id', resolveAppeal);
router.put('/bookings/:id/dispute-resolve', resolveBookingDispute);

module.exports = router;
