const mongoose = require('mongoose');

const HouseholdSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  city: {
    type: String,
    required: [true, 'Please add a city']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [72.8777, 19.0760] // Mumbai default
    }
  },
  ratingAvg: {
    type: Number,
    default: 5.0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

HouseholdSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Household', HouseholdSchema);
