const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAdminStats,
  getEventRegistrations,
  getAnalytics,
  getPendingOfflinePayments,
  approveOfflinePayment,
  rejectOfflinePayment,
} = require("../controllers/adminController");

router.get("/stats", protect, adminOnly, getAdminStats);

router.get(
  "/events/registrations",
  protect,
  adminOnly,
  getEventRegistrations
);

router.get("/analytics", protect, adminOnly, getAnalytics);

router.get("/payments/pending-offline", protect, adminOnly, getPendingOfflinePayments);
router.post("/payments/:paymentId/approve", protect, adminOnly, approveOfflinePayment);
router.post("/payments/:paymentId/reject", protect, adminOnly, rejectOfflinePayment);

module.exports = router;
