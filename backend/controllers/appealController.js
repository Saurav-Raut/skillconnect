const Appeal = require('../models/Appeal');
const Worker = require('../models/Worker');
const { sendPushNotification } = require('../utils/notifications');

// @desc    Worker submits an appeal
// @route   POST /api/appeals
// @access  Private (Worker only)
exports.createAppeal = async (req, res) => {
  try {
    const { bookingId, reviewId, reason } = req.body;

    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker profile not found' });
    }

    const appeal = await Appeal.create({
      worker: worker._id,
      booking: bookingId || null,
      review: reviewId || null,
      reason,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: appeal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get appeals (worker gets their own, admin gets all)
// @route   GET /api/appeals
// @access  Private
exports.getAppeals = async (req, res) => {
  try {
    let appeals;

    if (req.user.role === 'admin') {
      appeals = await Appeal.find()
        .populate({ path: 'worker', populate: { path: 'user', select: 'name phone' } })
        .populate('review')
        .sort('-createdAt');
    } else if (req.user.role === 'worker') {
      const worker = await Worker.findOne({ user: req.user._id });
      if (!worker) return res.status(200).json({ success: true, data: [] });
      appeals = await Appeal.find({ worker: worker._id })
        .populate('review')
        .sort('-createdAt');
    } else {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.status(200).json({ success: true, data: appeals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Admin updates appeal status (approved / rejected)
// @route   PUT /api/appeals/:id/status
// @access  Private (Admin only)
exports.updateAppealStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'upheld', 'overturned'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const appeal = await Appeal.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appeal) {
      return res.status(404).json({ success: false, error: 'Appeal not found' });
    }

    if ((status === 'approved' || status === 'upheld') && appeal.worker) {
      await Worker.findByIdAndUpdate(appeal.worker, {
        isDeactivated: false,
        penaltyHoldUntil: null
      });
    }

    res.status(200).json({ success: true, data: appeal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
