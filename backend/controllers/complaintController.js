const Complaint = require('../models/Complaint');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Household = require('../models/Household');
const { uploadImage } = require('../utils/imageUpload');
const { sanitizeText } = require('../utils/sanitize');

// @desc    Worker submits complaint against household
// @route   POST /api/complaints
// @desc    User (Worker or Household) submits complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const reason = sanitizeText(req.body.reason);
    let evidenceUrl = '';

    let booking = null;
    if (bookingId && bookingId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(bookingId);
    }

    let complaintData = {
      reason,
      evidence: evidenceUrl,
      status: 'pending'
    };

    if (booking) {
      complaintData.booking = booking._id;
    }

    if (req.user.role === 'worker') {
      const worker = await Worker.findOne({ user: req.user._id });
      if (!worker) {
        return res.status(404).json({ success: false, error: 'Worker profile not found' });
      }
      complaintData.worker = worker._id;
      if (booking) complaintData.household = booking.household;
      complaintData.raisedBy = 'worker';
    } else if (req.user.role === 'household') {
      const household = await Household.findOne({ user: req.user._id });
      if (!household) {
        return res.status(404).json({ success: false, error: 'Household profile not found' });
      }
      complaintData.household = household._id;
      if (booking) complaintData.worker = booking.worker;
      complaintData.raisedBy = 'household';
    } else {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (req.file) {
      evidenceUrl = await uploadImage(req.file);
      complaintData.evidence = evidenceUrl;
    }

    const complaint = await Complaint.create(complaintData);

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get complaints (worker/household gets their own, admin gets all)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    let complaints;
    if (req.user.role === 'admin') {
      complaints = await Complaint.find()
        .populate({ path: 'worker', populate: { path: 'user', select: 'name phone' } })
        .populate({ path: 'household', populate: { path: 'user', select: 'name phone' } })
        .populate('booking')
        .sort('-createdAt');
    } else if (req.user.role === 'worker') {
      const worker = await Worker.findOne({ user: req.user._id });
      if (!worker) return res.status(200).json({ success: true, data: [] });
      complaints = await Complaint.find({ worker: worker._id })
        .populate({ path: 'household', populate: { path: 'user', select: 'name' } })
        .populate('booking')
        .sort('-createdAt');
    } else if (req.user.role === 'household') {
      const household = await Household.findOne({ user: req.user._id });
      if (!household) return res.status(200).json({ success: true, data: [] });
      complaints = await Complaint.find({ household: household._id })
        .populate({ path: 'worker', populate: { path: 'user', select: 'name' } })
        .populate('booking')
        .sort('-createdAt');
    } else {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Admin updates complaint status (resolved / dismissed)
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin only)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
