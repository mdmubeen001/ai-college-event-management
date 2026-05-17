const express = require("express");
const router = express.Router();

const {
  getStudentDashboard,
  registerEvent,          // ✅ STEP 5.1 added
  updateStudentProfile,   // ✅ ADD THIS
} = require("../controllers/studentController");

const { protect } = require("../middleware/authMiddleware");

const { unregisterEvent } = require("../controllers/studentController");

router.post(
  "/unregister/:eventId",
  protect,
  unregisterEvent
);


router.get("/dashboard", protect, getStudentDashboard);

// ✅ STEP 5.1: Register event API
router.post("/register/:eventId", protect, registerEvent);

// ✅ Update Profile API
router.put("/profile", protect, updateStudentProfile);

module.exports = router;
