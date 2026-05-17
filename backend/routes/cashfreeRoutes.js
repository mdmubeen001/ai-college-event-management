const express = require("express");
const router = express.Router();
const { 
  createCashfreeOrder, 
  handleCashfreeWebhook 
} = require("../controllers/cashfreeController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create-order", protect, createCashfreeOrder);
router.post("/webhook", handleCashfreeWebhook); // ✅ No protect middleware

module.exports = router;
