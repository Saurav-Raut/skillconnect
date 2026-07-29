const express = require('express');
const { getHouseholdProfile, updateHouseholdProfile } = require('../controllers/householdController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, authorize('household'), getHouseholdProfile);
router.put('/profile', protect, authorize('household'), updateHouseholdProfile);

module.exports = router;
