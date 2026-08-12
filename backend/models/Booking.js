const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: false
  },
  skillRequested: {
    type: String,
    default: ''
  },
  matchingMode: {
    type: String,
    enum: ['direct', 'live_match_broadcast'],
    default: 'direct'
  },
  radiusKm: {
    type: Number,
    default: 5
  },
  broadcastRound: {
    type: Number,
    default: 1
  },
  notifiedWorkers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  }],
  householdLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [80.5180, 16.5190]
    }
  },
  householdAddressText: {
    type: String,
    default: ''
  },
  chatChannelId: {
    type: String,
    default: ''
  },
  callSessionId: {
    type: String,
    default: ''
  },
  cancelledBy: {
    type: String,
    enum: ['none', 'household', 'worker'],
    default: 'none'
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  hours: {
    type: Number,
    required: true,
    default: 1
  },
  ratePerHour: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['searching', 'pending', 'accepted', 'escrow_funded', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  escrowStatus: {
    type: String,
    enum: ['held', 'released', 'refunded'],
    default: 'held'
  },
  facilityAccessAgreed: {
    type: Boolean,
    default: false
  },
  disputeStatus: {
    type: String,
    enum: ['none', 'pending', 'resolved'],
    default: 'none'
  },
  faceVerifiedCheckIn: {
    type: Boolean,
    default: false
  },
  faceVerifiedCheckOut: {
    type: Boolean,
    default: false
  },
  sosTriggered: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
