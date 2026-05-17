const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  requestOfflinePayment,
  recordFailedPayment,
  recommendEvents,
  getMyRegisteredEvents,
  getEventRegistrations,
  unregisterEvent,
  getMyPayments,
  downloadTicket,
} = require("../controllers/eventController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

/* =========================
   ADMIN: CREATE EVENT
========================= */
router.post("/", protect, adminOnly, upload.single("image"), createEvent);

// ✅ ADMIN: UPDATE EVENT
router.put("/:id", protect, adminOnly, upload.single("image"), updateEvent);

// ✅ ADMIN: DELETE EVENT
router.delete("/:id", protect, adminOnly, deleteEvent);

/* =========================
   PUBLIC: GET ALL EVENTS
========================= */
router.get("/", getEvents);

/* =========================
   STUDENT: REGISTER EVENT
========================= */
router.post("/:id/register", protect, registerForEvent);

/* =========================
   STUDENT: REQUEST OFFLINE CASH PAYMENT (PENDING, NO REGISTRATION)
========================= */
router.post("/:id/request-offline-payment", protect, requestOfflinePayment);

/* =========================
   STUDENT: RECORD FAILED PAYMENT
========================= */
router.post("/:id/payment-failed", protect, recordFailedPayment);

/* =========================
   STUDENT: MY REGISTERED EVENTS
========================= */
router.get("/my/registered", protect, getMyRegisteredEvents);

/* =========================
   RECOMMENDATION ENGINE (GET /api/events/recommended)
========================= */
router.get("/recommended", protect, recommendEvents);
router.get("/recommendations", protect, recommendEvents);

/* =========================
   ADMIN: VIEW EVENT REGISTRATIONS
========================= */
router.get("/:id/registrations", protect, adminOnly, getEventRegistrations);

/* =========================
   STUDENT: UNREGISTER EVENT
========================= */
router.post("/:id/unregister", protect, unregisterEvent);

/* =========================
   STUDENT: MY PAYMENTS
========================= */
router.get("/my/payments", protect, getMyPayments);

/* =========================
   STUDENT: DOWNLOAD TICKET
========================= */
router.get("/:id/ticket", protect, downloadTicket);

// ✅ PUBLIC: GET SINGLE EVENT (Place at bottom to avoid conflicts)
router.get("/:id", getEventById);

module.exports = router;
