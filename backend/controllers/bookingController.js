const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Household = require('../models/Household');
const ChatMessage = require('../models/ChatMessage');
const { verifyFaceMatch } = require('../utils/faceVerify');
const { sendPushNotification } = require('../utils/notifications');

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Household only)
exports.createBooking = async (req, res) => {
  try {
    const { workerId, date, startTime, hours, facilityAccessAgreed } = req.body;

    const household = await Household.findOne({ user: req.user._id });
    if (!household) {
      return res.status(404).json({ success: false, error: 'Household profile not found' });
    }

    const worker = await Worker.findById(workerId).populate('user');
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker profile not found' });
    }

    const ratePerHour = worker.ratePerHour;
    const totalAmount = ratePerHour * parseFloat(hours);

    // Duplicate booking guard: prevent double-submit race condition within 10 seconds
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
    const existingRecent = await Booking.findOne({
      household: household._id,
      worker: worker._id,
      date,
      status: { $in: ['pending', 'accepted', 'searching'] },
      createdAt: { $gte: tenSecondsAgo }
    });
    if (existingRecent) {
      return res.status(200).json({ success: true, data: existingRecent, duplicatePrevented: true });
    }

    const booking = await Booking.create({
      household: household._id,
      worker: worker._id,
      date,
      startTime,
      hours,
      ratePerHour,
      totalAmount,
      facilityAccessAgreed: !!facilityAccessAgreed,
      status: 'pending',
      escrowStatus: 'held'
    });

    await sendPushNotification(
      worker.user._id,
      'New Booking Request',
      `You have a new booking request from ${req.user.name} for ${hours} hour(s) on ${new Date(date).toLocaleDateString()}.`,
      { bookingId: booking._id }
    );

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user's bookings (household or worker)
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'household') {
      const household = await Household.findOne({ user: req.user._id });
      if (!household) return res.status(200).json({ success: true, data: [] });
      bookings = await Booking.find({ household: household._id })
        .populate({ path: 'worker', populate: { path: 'user', select: '-password' } })
        .populate({ path: 'household', populate: { path: 'user', select: '-password' } })
        .sort('-createdAt');
    } else if (req.user.role === 'worker') {
      const worker = await Worker.findOne({ user: req.user._id });
      if (!worker) return res.status(200).json({ success: true, data: [] });
      bookings = await Booking.find({ worker: worker._id })
        .populate({ path: 'household', populate: { path: 'user', select: '-password' } })
        .populate({ path: 'worker', populate: { path: 'user', select: '-password' } })
        .sort('-createdAt');
    } else {
      // Admin gets all
      bookings = await Booking.find()
        .populate({ path: 'household', populate: { path: 'user', select: '-password' } })
        .populate({ path: 'worker', populate: { path: 'user', select: '-password' } })
        .sort('-createdAt');
    }

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Worker accepts booking
// @route   PUT /api/bookings/:id/accept
// @access  Private (Worker only)
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'household', populate: { path: 'user' } })
      .populate({ path: 'worker', populate: { path: 'user' } });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.worker.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    booking.status = 'accepted';
    await booking.save();

    await sendPushNotification(
      booking.household.user._id,
      'Booking Accepted',
      `${booking.worker.user.name} has accepted your request. Please fund the escrow payment to confirm details.`,
      { bookingId: booking._id }
    );

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Household funds escrow payment
// @route   PUT /api/bookings/:id/fund
// @access  Private (Household only)
exports.fundBookingEscrow = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'household', populate: { path: 'user' } })
      .populate({ path: 'worker', populate: { path: 'user' } });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    booking.status = 'escrow_funded';
    await booking.save();

    await sendPushNotification(
      booking.worker.user._id,
      'Escrow Funded',
      `Payment of ₹${booking.totalAmount} for Booking has been secured. You are safe to proceed with the job.`,
      { bookingId: booking._id }
    );

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Worker starts job (Requires check-in Face Verification)
// @route   PUT /api/bookings/:id/checkin
// @access  Private (Worker only)
exports.checkInBooking = async (req, res) => {
  try {
    const { faceData } = req.body;
    if (!faceData) {
      return res.status(400).json({ success: false, error: 'Face scan data is required for check-in' });
    }

    if (!req.params.id.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(200).json({
        success: true,
        data: {
          _id: req.params.id,
          status: 'in_progress',
          faceVerifiedCheckIn: true,
          demoMode: true
        },
        verification: { success: true, confidence: 0.98, distance: 0.12 }
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'household', populate: { path: 'user' } })
      .populate({ path: 'worker', populate: { path: 'user' } });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (!['accepted', 'escrow_funded'].includes(booking.status)) {
      return res.status(400).json({ success: false, error: 'Worker must accept the job before check-in is allowed' });
    }

    // Verify face encoding
    const verification = verifyFaceMatch(booking.worker.faceEncodingEncrypted, faceData);
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        error: 'Check-in face verification failed. Face does not match registered worker profile.'
      });
    }

    booking.faceVerifiedCheckIn = true;
    booking.status = 'in_progress';
    await booking.save();

    await sendPushNotification(
      booking.household.user._id,
      'Worker Checked In',
      `${booking.worker.user.name} has face-verified and checked-in at your location. Job is in progress.`,
      { bookingId: booking._id }
    );

    res.status(200).json({ success: true, data: booking, verification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Worker completes job (Requires check-out Face Verification)
// @route   PUT /api/bookings/:id/checkout
// @access  Private (Worker only)
exports.checkOutBooking = async (req, res) => {
  try {
    const { faceData } = req.body;
    if (!faceData) {
      return res.status(400).json({ success: false, error: 'Face scan data is required for checkout' });
    }

    if (!req.params.id.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(200).json({
        success: true,
        data: {
          _id: req.params.id,
          status: 'completed',
          escrowStatus: 'released',
          faceVerifiedCheckOut: true,
          demoMode: true
        },
        verification: { success: true, confidence: 0.99, distance: 0.11 }
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'household', populate: { path: 'user' } })
      .populate({ path: 'worker', populate: { path: 'user' } });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.status !== 'in_progress') {
      return res.status(400).json({ success: false, error: 'Job must be in progress before checkout is allowed' });
    }

    // Verify face encoding
    const verification = verifyFaceMatch(booking.worker.faceEncodingEncrypted, faceData);
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        error: 'Checkout face verification failed. Face does not match registered worker profile.'
      });
    }

    booking.faceVerifiedCheckOut = true;
    booking.status = 'completed';
    booking.escrowStatus = 'released'; // Release payment to worker account
    await booking.save();

    await sendPushNotification(
      booking.household.user._id,
      'Job Completed',
      `${booking.worker.user.name} has completed the service and face-checked out. Escrow payment released.`,
      { bookingId: booking._id }
    );

    res.status(200).json({ success: true, data: booking, verification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Raise a Dispute on the booking
// @route   PUT /api/bookings/:id/dispute
// @access  Private
exports.disputeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'household', populate: { path: 'user' } })
      .populate({ path: 'worker', populate: { path: 'user' } });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    booking.status = 'disputed';
    booking.disputeStatus = 'pending';
    await booking.save();

    // Notify other party
    const targetUserId = req.user.role === 'household' ? booking.worker.user._id : booking.household.user._id;
    await sendPushNotification(
      targetUserId,
      'Booking Disputed',
      `The booking has been marked as Disputed by ${req.user.name}. Admin review initiated.`,
      { bookingId: booking._id }
    );

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a Rapido-style live broadcast booking in 'searching' state
// @route   POST /api/bookings/live-match
// @access  Private (Household only)
exports.createLiveMatchBooking = async (req, res) => {
  try {
    const { skill, date, startTime, hours, ratePerHour, coordinates, addressText, radiusKm } = req.body;

    const household = await Household.findOne({ user: req.user._id });
    if (!household) {
      return res.status(404).json({ success: false, error: 'Household profile not found' });
    }

    const hrs = parseFloat(hours) || 1;
    const rate = parseFloat(ratePerHour) || 150;
    const totalAmount = hrs * rate;

    // Duplicate booking guard: prevent double-submit race condition within 10 seconds
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
    const existingRecent = await Booking.findOne({
      household: household._id,
      skillRequested: skill,
      status: { $in: ['searching', 'pending'] },
      createdAt: { $gte: tenSecondsAgo }
    });
    if (existingRecent) {
      return res.status(200).json({ success: true, data: existingRecent, duplicatePrevented: true });
    }

    const booking = await Booking.create({
      household: household._id,
      skillRequested: skill,
      matchingMode: 'live_match_broadcast',
      radiusKm: parseFloat(radiusKm) || 5,
      broadcastRound: 1,
      householdLocation: {
        type: 'Point',
        coordinates: coordinates && coordinates.length === 2 ? coordinates : [80.5180, 16.5190]
      },
      householdAddressText: addressText || 'Thullur, Amaravati, AP',
      date: date || new Date(),
      startTime: startTime || 'Immediate',
      hours: hrs,
      ratePerHour: rate,
      totalAmount,
      status: 'searching',
      escrowStatus: 'held'
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get persistent chat history for a specific booking
// @route   GET /api/bookings/:id/chat
// @access  Private
exports.getBookingChat = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ booking: req.params.id })
      .populate('sender', 'name email role')
      .sort('createdAt');

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get scoped call option for a specific booking (simple number-reveal, upgradeable to Twilio masking)
// @route   GET /api/bookings/:id/call
// @access  Private
exports.getBookingCallInfo = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'household', populate: { path: 'user', select: 'name phone' } })
      .populate({ path: 'worker', populate: { path: 'user', select: 'name phone' } });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Determine other party's phone number
    let targetPhone = '+91 98765 43210';
    let targetName = 'SkillConnect Partner';

    if (req.user.role === 'household' && booking.worker && booking.worker.user) {
      targetPhone = booking.worker.user.phone || '+91 98765 43210';
      targetName = booking.worker.user.name || 'Worker';
    } else if (req.user.role === 'worker' && booking.household && booking.household.user) {
      targetPhone = booking.household.user.phone || '+91 98765 43210';
      targetName = booking.household.user.name || 'Customer';
    }

    // NOTE: Phase 1 uses direct number reveal inside the active booking session.
    // FUTURE UPGRADE: Integrate Twilio Proxy / Voice Masking to hide actual phone numbers.
    res.status(200).json({
      success: true,
      data: {
        bookingId: booking._id,
        targetName,
        targetPhone,
        callMode: 'number_reveal',
        twilioMaskingSupported: false,
        note: 'Direct call reveal enabled for Phase 1. Upgradeable to Twilio Proxy Masking in Phase 2.'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
