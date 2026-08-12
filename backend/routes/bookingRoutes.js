const express = require('express');
const {
  createBooking,
  createLiveMatchBooking,
  getBookings,
  getBookingChat,
  getBookingCallInfo,
  acceptBooking,
  fundBookingEscrow,
  checkInBooking,
  checkOutBooking,
  disputeBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createBooking);
router.post('/live-match', createLiveMatchBooking);
router.get('/', getBookings);
router.get('/:id/chat', getBookingChat);
router.get('/:id/call', getBookingCallInfo);
router.put('/:id/accept', acceptBooking);
router.put('/:id/fund', fundBookingEscrow);
router.put('/:id/checkin', checkInBooking);
router.put('/:id/checkout', checkOutBooking);
router.put('/:id/dispute', disputeBooking);

module.exports = router;
