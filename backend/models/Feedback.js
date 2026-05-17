const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  sentiment: {
    type: String,
    enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"],
    default: "NEUTRAL"
  },
  score: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Ensure a student can only submit feedback once per event
feedbackSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);