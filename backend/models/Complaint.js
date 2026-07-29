const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: false
  },
  household: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    required: false
  },
  raisedBy: {
    type: String,
    enum: ['worker', 'household', 'admin'],
    default: 'worker'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  reason: {
    type: String,
    required: [true, 'Please add a reason for the complaint']
  },
  evidence: {
    type: String, // Path to uploaded image/file or text description
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
