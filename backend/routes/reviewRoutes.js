const express = require('express');
const { createReview, createHouseholdReview, getWorkerReviews, getAllReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllReviews);
router.post('/', protect, createReview);
router.post('/household', protect, authorize('worker'), createHouseholdReview);
router.get('/worker/:workerId', getWorkerReviews);

module.exports = router;
