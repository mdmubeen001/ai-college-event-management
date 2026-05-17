const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { 
  submitFeedback, 
  getFeedbackByEvent, 
  getFeedbackSummaryAll 
} = require("../controllers/feedbackController");

// Student routes
router.post("/", protect, submitFeedback);
router.get("/event/:id", protect, getFeedbackByEvent);

// Admin routes
router.get("/summary", protect, adminOnly, getFeedbackSummaryAll);

module.exports = router;