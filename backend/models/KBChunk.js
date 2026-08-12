const mongoose = require('mongoose');

const KBChunkSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['worker', 'household', 'admin', 'general'],
    default: 'general',
    index: true
  },
  category: {
    type: String,
    default: 'general',
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  keywords: {
    type: [String],
    default: [],
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Text index for simple, offline fuzzy text searching
KBChunkSchema.index({ title: 'text', content: 'text', keywords: 'text' });

module.exports = mongoose.model('KBChunk', KBChunkSchema);
