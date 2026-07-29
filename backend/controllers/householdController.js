const Household = require('../models/Household');

// @desc    Get household profile
// @route   GET /api/households/profile
// @access  Private (Household only)
exports.getHouseholdProfile = async (req, res) => {
  try {
    const household = await Household.findOne({ user: req.user._id }).populate('user', '-password');
    if (!household) {
      return res.status(404).json({ success: false, error: 'Household profile not found' });
    }
    res.status(200).json({ success: true, data: household });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update household profile
// @route   PUT /api/households/profile
// @access  Private (Household only)
exports.updateHouseholdProfile = async (req, res) => {
  try {
    const { address, city, coordinates } = req.body;
    let household = await Household.findOne({ user: req.user._id });

    if (!household) {
      return res.status(404).json({ success: false, error: 'Household profile not found' });
    }

    if (address) household.address = address;
    if (city) household.city = city;

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      household.location = {
        type: 'Point',
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      };
    }

    await household.save();

    const populatedHousehold = await Household.findById(household._id).populate('user', '-password');
    res.status(200).json({ success: true, data: populatedHousehold });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
