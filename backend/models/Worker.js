const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: [true, 'Please specify a skill'],
    enum: ['Electrician', 'Plumber', 'Carpenter', 'Daily Laborer', 'Cook', 'Cleaner']
  },
  experience: {
    type: Number,
    required: [true, 'Please specify years of experience']
  },
  ratePerHour: {
    type: Number,
    required: [true, 'Please specify hourly rate']
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [80.5180, 16.5190] // Thullur AP default
    }
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [80.5180, 16.5190] // Real-time GPS coordinates
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  ratingAvg: {
    type: Number,
    default: 5.0
  },
  reverseRatingAvg: {
    type: Number,
    default: 5.0 // Average rating of households this worker has worked with
  },
  idVerificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  faceEncodingEncrypted: {
    type: String,
    default: ''
  },
  faceDataExpiresAt: {
    type: Date
  },
  isDeactivated: {
    type: Boolean,
    default: false
  },
  penaltyHoldUntil: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Set 2dsphere index for location queries
WorkerSchema.index({ location: '2dsphere' });
WorkerSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Worker', WorkerSchema);
