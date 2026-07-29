const Worker = require('../models/Worker');
const User = require('../models/User');
const { generateFaceDescriptor, encryptFaceEncoding } = require('../utils/faceVerify');
const { getFaceDataExpiryDate } = require('../utils/faceDataPolicy');

// @desc    Get all workers (with filters for skill, availability, and location radius)
// @route   GET /api/workers
// @access  Public
exports.getWorkers = async (req, res) => {
  try {
    const { skill, isAvailable, lng, lat, maxDistance } = req.query;
    const query = {};

    if (skill) {
      query.skill = skill;
    }
    if (isAvailable) {
      query.isAvailable = isAvailable === 'true';
    }

    // Near location search (GeoJSON 2dsphere)
    if (lng && lat) {
      const distance = maxDistance ? parseFloat(maxDistance) : 10000; // Default 10km radius
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: distance
        }
      };
    }

    const workers = await Worker.find(query).populate('user', '-password');
    res.status(200).json({ success: true, count: workers.length, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get worker by ID
// @route   GET /api/workers/:id
// @access  Public
exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('user', '-password');
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker profile not found' });
    }
    res.status(200).json({ success: true, data: worker });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Private (Worker only)
exports.updateWorkerProfile = async (req, res) => {
  try {
    const { skill, experience, ratePerHour, bio, coordinates, isAvailable } = req.body;
    let worker = await Worker.findOne({ user: req.user._id });

    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker profile not found' });
    }

    // Update fields
    if (skill) worker.skill = skill;
    if (experience) worker.experience = experience;
    if (ratePerHour) worker.ratePerHour = ratePerHour;
    if (bio !== undefined) worker.bio = bio;
    if (isAvailable !== undefined) worker.isAvailable = isAvailable;

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      worker.location = {
        type: 'Point',
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      };
    }

    await worker.save();

    const populatedWorker = await Worker.findById(worker._id).populate('user', '-password');
    res.status(200).json({ success: true, data: populatedWorker });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Register worker face verification encoding
// @route   POST /api/workers/face-register
// @access  Private (Worker only)
exports.registerFace = async (req, res) => {
  try {
    const { faceData } = req.body; // Base64 or identifier text from video frame
    if (!faceData) {
      return res.status(400).json({ success: false, error: 'Please provide face scan data' });
    }

    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker profile not found' });
    }

    // Generate 128-float descriptor using worker's details + photo seed
    const descriptor = generateFaceDescriptor(faceData + worker._id.toString());
    const encryptedEncoding = encryptFaceEncoding(descriptor);

    // Save and set retention expiry (e.g. 7 days for safety/compliance)
    worker.faceEncodingEncrypted = encryptedEncoding;
    worker.faceDataExpiresAt = getFaceDataExpiryDate(7); // 7 days retention
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Face signature encrypted and registered successfully.',
      expiresAt: worker.faceDataExpiresAt
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete worker biometric face encoding (GDPR/DPDP compliance)
// @route   DELETE /api/workers/face-data
// @access  Private (Worker only)
exports.deleteFaceData = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker profile not found' });
    }

    worker.faceEncodingEncrypted = '';
    worker.faceDataExpiresAt = null;
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Biometric face data permanently deleted from server.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete worker profile and all biometric data
// @route   DELETE /api/workers/me
// @access  Private (Worker only)
exports.deleteWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });
    if (!worker) {
      return res.status(404).json({ success: false, error: 'Worker profile not found' });
    }

    // Wipe biometric data
    worker.faceEncodingEncrypted = '';
    worker.faceDataExpiresAt = null;
    await worker.save();
    await Worker.deleteOne({ _id: worker._id });
    await User.deleteOne({ _id: req.user._id });

    res.status(200).json({
      success: true,
      message: 'Worker profile and all associated biometric data permanently deleted.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
