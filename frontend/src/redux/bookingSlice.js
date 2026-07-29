import bookingReducer, {
  fetchBookings,
  createBooking,
  acceptBooking,
  fundEscrow,
  verifyCheckIn,
  verifyCheckOut,
  disputeBooking,
  clearBookingStatus
} from '@skillconnect/shared/redux/bookingSlice';

export {
  fetchBookings,
  createBooking,
  acceptBooking,
  fundEscrow,
  verifyCheckIn,
  verifyCheckOut,
  disputeBooking,
  clearBookingStatus
};

export default bookingReducer;
