const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Household = require('../models/Household');
const { interceptDeactivation } = require('../middleware/penaltyHoldMiddleware');
const { sanitizeText } = require('../utils/sanitize');

// @desc    Create a review for a worker (Household rates worker)
// @route   POST /api/reviews
// @access  Private (Household only)
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating } = req.body;
    const comment = sanitizeText(req.body.comment);

    if (bookingId && !bookingId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(201).json({
        success: true,
        data: {
          _id: 'demo_review_id',
          booking: bookingId,
          rating,
          comment,
          demoMode: true
        }
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const household = await Household.findOne({ user: req.user._id });
    if (!household || booking.household.toString() !== household._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to review this booking' });
    }

    // Check if review already exists for this booking
    const reviewExists = await Review.findOne({ booking: bookingId });
    if (reviewExists) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this booking' });
    }

    const review = await Review.create({
      booking: bookingId,
      household: household._id,
      worker: booking.worker,
      rating,
      comment
    });

    // Update Worker ratingAvg
    const reviews = await Review.find({ worker: booking.worker });
    const avg = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    const worker = await Worker.findById(booking.worker);
    worker.ratingAvg = Math.round(avg * 10) / 10;
    await worker.save();

    // Trigger Fairness Layer check: if rating drops below 3.0, trigger deactivation hold!
    if (worker.ratingAvg < 3.0) {
      await interceptDeactivation(
        worker._id,
        bookingId,
        `Worker overall rating dropped to ${worker.ratingAvg}`
      );
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Worker rates a household (Reverse Rating)
// @route   POST /api/reviews/household
// @access  Private (Worker only)
exports.createHouseholdReview = async (req, res) => {
  try {
    const { bookingId, rating } = req.body;
    const comment = sanitizeText(req.body.comment);

    if (bookingId && !bookingId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(201).json({
        success: true,
        data: {
          _id: 'demo_review_id',
          booking: bookingId,
          rating,
          comment,
          demoMode: true
        }
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker || booking.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to review this household' });
    }

    const household = await Household.findById(booking.household);
    if (!household) {
      return res.status(404).json({ success: false, error: 'Household profile not found' });
    }

    // Update household average rating
    const oldAvg = household.ratingAvg || 5.0;
    household.ratingAvg = Math.round(((oldAvg + parseFloat(rating)) / 2) * 10) / 10;
    await household.save();

    const review = await Review.create({
      booking: bookingId,
      household: household._id,
      worker: worker._id,
      rating: parseFloat(rating),
      comment,
      isReverseReview: true
    });

    res.status(201).json({
      success: true,
      message: 'Household rated successfully',
      data: {
        bookingId,
        householdId: household._id,
        rating: parseFloat(rating),
        comment
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get reviews for a worker
// @route   GET /api/reviews/worker/:workerId
// @access  Public
exports.getWorkerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate({ path: 'household', populate: { path: 'user', select: 'name profilePicture' } })
      .sort('-createdAt');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all reviews across platform (for Admin & weekly awards)
// @route   GET /api/reviews
// @access  Public
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate({ path: 'household', populate: { path: 'user', select: 'name profilePicture' } })
      .populate({ path: 'worker', populate: { path: 'user', select: 'name profilePicture' } })
      .sort('-createdAt');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

