const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  ambience: {
    type: String,
    required: true,
    enum: ['forest', 'ocean', 'mountain']
  },
  text: {
    type: String,
    required: true
  },
  emotion: {
    type: String,
    default: null
  },
  keywords: {
    type: [String],
    default: []
  },
  summary: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries on userId and date
journalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Journal', journalSchema);