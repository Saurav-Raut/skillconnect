const mongoose = require('mongoose');

const AppealSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false // May be a general block appeal
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: false
  },
  reason: {
    type: String,
    required: [true, 'Please provide the reason for your appeal']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'upheld', 'overturned'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  resolvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appeal', AppealSchema);
