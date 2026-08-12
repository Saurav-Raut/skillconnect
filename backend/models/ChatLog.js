const mongoose = require('mongoose');

const ChatLogSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  role: {
    type: String,
    enum: ['worker', 'household', 'admin', 'guest'],
    default: 'guest'
  },
  message: {
    type: String,
    required: true
  },
  detectedLanguage: {
    type: String,
    default: 'en'
  },
  detectedIntent: {
    type: String,
    default: 'fallback'
  },
  botResponse: {
    type: String,
    required: true
  },
  escalated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('ChatLog', ChatLogSchema);
