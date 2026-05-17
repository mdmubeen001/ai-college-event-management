const express = require("express");
const router = express.Router();

const { generateEventDescription } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/ai/event-description
router.post("/event-description", protect, generateEventDescription);

module.exports = router;
