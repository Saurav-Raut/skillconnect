const Worker = require('../models/Worker');
const Complaint = require('../models/Complaint');
const Appeal = require('../models/Appeal');
const Booking = require('../models/Booking');
const { sendPushNotification } = require('../utils/notifications');

// @desc    Approve/Reject Worker ID (police check verification)
// @route   PUT /api/admin/verify-worker/:id
// @access  Private (Admin only)
exports.verifyWorkerId = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const worker = await Worker.findById(req.params.id).populate('user');
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker profile not found' });
    }

    worker.idVerificationStatus = status;
    await worker.save();

    await sendPushNotification(
      worker.user._id,
      `ID Verification ${status === 'approved' ? 'Passed' : 'Failed'}`,
      status === 'approved' 
        ? 'Your background/ID check has passed. You can now accept booking requests!'
        : 'Your background/ID check was rejected. Please contact support.',
      { status }
    );

    res.status(200).json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Resolve a complaint against a household
// @route   PUT /api/admin/complaints/:id
// @access  Private (Admin only)
exports.resolveComplaint = async (req, res) => {
  try {
    const { status } = req.body; // 'resolved' or 'dismissed'
    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const complaint = await Complaint.findById(req.params.id)
      .populate({ path: 'worker', populate: { path: 'user' } })
      .populate({ path: 'household', populate: { path: 'user' } });

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    complaint.status = status;
    await complaint.save();

    // Notify worker
    await sendPushNotification(
      complaint.worker.user._id,
      'Complaint Case Update',
      `Your complaint regarding Booking #${complaint.booking} has been ${status}.`,
      { complaintId: complaint._id, status }
    );

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Resolve Worker Appeal (uphold rating/block or overturn it)
// @route   PUT /api/admin/appeals/:id
// @access  Private (Admin only)
exports.resolveAppeal = async (req, res) => {
  try {
    const { status } = req.body; // 'upheld' or 'overturned'
    if (!['upheld', 'overturned'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const appeal = await Appeal.findById(req.params.id).populate({ path: 'worker', populate: { path: 'user' } });
    if (!appeal) {
      return res.status(404).json({ success: false, error: 'Appeal not found' });
    }

    appeal.status = status;
    appeal.reviewedBy = req.user._id;
    appeal.resolvedAt = Date.now();
    await appeal.save();

    const worker = await Worker.findById(appeal.worker._id);

    if (status === 'overturned') {
      // Restore ratings or prevent auto-block
      worker.isAvailable = true;
      // Reset low rating to safety boundary
      if (worker.ratingAvg < 3.0) {
        worker.ratingAvg = 3.0; // Reset to minimal compliance rating
      }
      await worker.save();
      
      await sendPushNotification(
        appeal.worker.user._id,
        'Appeal Approved (Overturned)',
        'Your appeal was upheld. Your account holds and penalties have been fully cleared.',
        { appealId: appeal._id, status }
      );
    } else {
      // Upheld: Enforce suspension/block
      worker.isAvailable = false; // Suspend worker
      await worker.save();

      await sendPushNotification(
        appeal.worker.user._id,
        'Appeal Rejected (Upheld)',
        'Your appeal was rejected. The deactivation/penalty has been enforced on your account.',
        { appealId: appeal._id, status }
      );
    }

    res.status(200).json({ success: true, data: appeal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Resolve dispute & determine escrow payout
// @route   PUT /api/admin/bookings/:id/dispute-resolve
// @access  Private (Admin only)
exports.resolveBookingDispute = async (req, res) => {
  try {
    const { action } = req.body; // 'release' (pay worker) or 'refund' (pay household)
    if (!['release', 'refund'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action. Must release or refund.' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'household', populate: { path: 'user' } })
      .populate({ path: 'worker', populate: { path: 'user' } });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    booking.disputeStatus = 'resolved';
    booking.status = action === 'release' ? 'completed' : 'cancelled';
    booking.escrowStatus = action === 'release' ? 'released' : 'refunded';
    await booking.save();

    // Notify household
    await sendPushNotification(
      booking.household.user._id,
      'Dispute Resolved',
      `Dispute resolved by Admin. Escrow payment was ${action === 'release' ? 'released to worker' : 'refunded to you'}.`,
      { bookingId: booking._id, action }
    );

    // Notify worker
    await sendPushNotification(
      booking.worker.user._id,
      'Dispute Resolved',
      `Dispute resolved by Admin. Escrow payment was ${action === 'release' ? 'released to you' : 'refunded to household'}.`,
      { bookingId: booking._id, action }
    );

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
