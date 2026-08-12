const mongoose = require('mongoose');

const IntentRouteSchema = new mongoose.Schema({
  intentName: {
    type: String,
    required: [true, 'Intent name is required'],
    unique: true,
    trim: true,
    index: true
  },
  route: {
    type: String,
    required: [true, 'Redirect route is required'],
    trim: true
  },
  buttonLabel: {
    type: String,
    required: [true, 'Button label is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('IntentRoute', IntentRouteSchema);
