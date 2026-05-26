const Event = require("../models/Event");
const Payment = require("../models/Payment");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const contentDisposition = require("content-disposition");

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === "string") return tags.split(",").map((t) => t.trim()).filter(Boolean);
  return [];
};

/* =========================
   CREATE EVENT (ADMIN)
========================= */
const createEvent = async (req, res) => {
  try {
    const image = req.file
      ? req.file.path
      : req.body.image;
    const tags = parseTags(req.body.tags);

    const event = await Event.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      tags,
      date: req.body.date,
      location: req.body.location,
      isFree: req.body.isFree,
      price: req.body.price,
      image,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET ALL EVENTS
========================= */
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate(
      "createdBy",
      "name email role"
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET SINGLE EVENT
========================= */
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("createdBy", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE EVENT (ADMIN)
========================= */
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    let imagePath = event.image;

    if (req.file) {
     imagePath = req.file.path;
    } else if (req.body.image && req.body.image.trim() !== "") {
     imagePath = req.body.image;
    }

    event.title = req.body.title;
    event.description = req.body.description;
    event.category = req.body.category;
    if (Object.prototype.hasOwnProperty.call(req.body, "tags")) {
      event.tags = parseTags(req.body.tags);
    }
    event.date = req.body.date;
    event.location = req.body.location;
    event.isFree = req.body.isFree === 'true';
    event.price = req.body.isFree === 'true' ? 0 : req.body.price;
    event.image = imagePath;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   DELETE EVENT (ADMIN)
========================= */
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await event.deleteOne();
    res.json({ message: "Event removed" });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
/* =========================
   STUDENT REGISTER (FREE + PAID)
========================= */
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event)
      return res.status(404).json({ message: "Event not found" });

    // ✅ if already registered
    if (event.registrations.includes(req.user._id))
      return res.status(400).json({ message: "Already registered" });

    // ✅ PAID EVENT CHECK
    if (!event.isFree) {
      if (!req.body?.paid) {
        return res.status(400).json({ message: "Paid event, payment required" });
      }

      // ✅ Check for duplicate payment
      const existingPayment = await Payment.findOne({
        event: event._id,
        student: req.user._id,
        status: "SUCCESS",
      });

      if (existingPayment) {
        return res.status(400).json({ message: "Payment already recorded" });
      }

      // ✅ Create Payment Record
      await Payment.create({
        event: event._id,
        student: req.user._id,
        amount: event.price,
        paymentMethod: "CASHFREE",
        orderId: req.body.orderId,
        status: "SUCCESS",
        paidAt: Date.now(),
      });
    }

    // ✅ Register student
    await Event.updateOne(
      { _id: event._id },
      { $addToSet: { registrations: req.user._id } }
    );

    res.json({ message: "Registered successfully" });
  } catch (error) {
    console.error("REGISTER EVENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   STUDENT: REQUEST OFFLINE CASH PAYMENT (PENDING, NO REGISTRATION)
========================= */
const requestOfflinePayment = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Event not found" });
    if (event.isFree)
      return res.status(400).json({ message: "This is a free event; just register." });

    if (event.registrations.some((id) => id.toString() === req.user._id.toString()))
      return res.status(400).json({ message: "Already registered for this event" });

    const existing = await Payment.findOne({
      event: event._id,
      student: req.user._id,
      status: "PENDING",
      paymentMethod: "OFFLINE_CASH",
    });
    if (existing)
      return res.status(400).json({ message: "Offline payment already requested; waiting for approval." });

    const duplicateSuccess = await Payment.findOne({
      event: event._id,
      student: req.user._id,
      status: "SUCCESS",
    });
    if (duplicateSuccess)
      return res.status(400).json({ message: "Payment already recorded for this event." });

    await Payment.create({
      event: event._id,
      student: req.user._id,
      amount: event.price,
      paymentMethod: "OFFLINE_CASH",
      status: "PENDING",
    });

    res.status(201).json({ message: "Offline payment requested. Wait for admin approval." });
  } catch (error) {
    console.error("REQUEST OFFLINE PAYMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   STUDENT RECORD FAILED PAYMENT
========================= */
const recordFailedPayment = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.isFree) {
      return res.status(400).json({ message: "This is a free event" });
    }

    // Avoid creating duplicate failed payments for the same order
    const existingPayment = await Payment.findOne({
      orderId: req.body.orderId,
    });

    if (existingPayment) {
      return res.status(400).json({ message: "Payment attempt already recorded" });
    }

    await Payment.create({
      event: event._id,
      student: req.user._id,
      amount: event.price,
      paymentMethod: "CASHFREE",
      orderId: req.body.orderId,
      status: "FAILED",
    });

    res.json({ message: "Failed payment recorded" });
  } catch (error) {
    console.error("RECORD FAILED PAYMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   OTHER
========================= */
const getEventRegistrations = async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    "registrations",
    "name email department year"
  );

  if (!event)
    return res.status(404).json({ message: "Event not found" });

  // Filter out null registrations (orphaned data)
  const validRegistrations = event.registrations.filter(reg => reg !== null);
  res.json(validRegistrations);
};

const getMyRegisteredEvents = async (req, res) => {
  const events = await Event.find({
    registrations: req.user._id,
  }).populate("createdBy", "name email role");

  res.json(events);
};

const unregisterEvent = async (req, res) => {
  const event = await Event.findById(req.params.id);

  event.registrations = event.registrations.filter(
    (id) => id.toString() !== req.user._id.toString()
  );

  await event.save();
  res.json({ message: "Unregistered successfully" });
};

/* =========================
   RECOMMENDATION ENGINE (no external API)
   Score: +2 category match, +1 per tag match. Top 5; fallback: latest/trending.
========================= */
const recommendEvents = async (req, res) => {
  try {
    const interests = (req.user.interests || []).map((i) => String(i).toLowerCase().trim()).filter(Boolean);
    const limit = 6;

    const events = await Event.find({ date: { $gte: new Date() } })
      .populate("createdBy", "name email")
      .lean();

    const scored = events.map((event) => {
      let score = 0;
      const cat = (event.category || "").toLowerCase();
      const eventTags = (event.tags || []).map((t) => String(t).toLowerCase().trim());

      // Prefer category matches (primary signal per dashboard requirements)
      if (interests.includes(cat)) score += 3;
      eventTags.forEach((tag) => {
        if (interests.includes(tag)) score += 1;
      });

      return { ...event, _score: score };
    });

    scored.sort((a, b) => b._score - a._score);
    const top = scored.slice(0, limit);

    const hasMatch = top.some((e) => e._score > 0);
    let result = top;

    if (!hasMatch) {
      const latestOrTrending = await Event.find({ date: { $gte: new Date() } })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      result = latestOrTrending.map((e) => ({ ...e, _score: 0 }));
    }

    const sanitized = result.map(({ _score, ...e }) => ({ ...e, score: _score }));
    res.json(sanitized);
  } catch (error) {
    console.error("RECOMMEND EVENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   STUDENT: MY PAYMENT STATUS
========================= */
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user._id })
      .populate("event", "title description category date location price isFree")
      .sort({ createdAt: -1 });

    // Filter out payments whose event was deleted (populate returns null)
    const validPayments = payments.filter((p) => p.event != null);

    const myPayments = validPayments.map((p) => ({
      eventId: p.event._id,
      title: p.event.title,
      description: p.event.description,
      category: p.event.category,
      date: p.event.date,
      location: p.event.location,
      price: p.amount,
      isFree: p.event.isFree,
      status: p.status === "SUCCESS" ? "approved" : p.status === "PENDING" ? "pending" : "rejected",
      paymentMethod: p.paymentMethod,
    }));

    res.json(myPayments);
  } catch (error) {
    console.error("MY PAYMENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const downloadTicket = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is in the registrations array. This is the source of truth.
    // A user is only in this array if it's a free event OR a paid event with successful payment.
    const isRegistered = event.registrations.some(regId => regId.equals(req.user._id));

    if (!isRegistered) {
      return res.status(403).json({ message: "Access denied. You are not registered for this event or payment is not complete." });
    }

    // --- QR Code Generation ---
    const qrData = JSON.stringify({
      userId: req.user._id,
      eventId: event._id,
      eventName: event.title,
      studentName: req.user.name,
    });
    const qrCodeDataURL = await QRCode.toDataURL(qrData);

    // --- PDF Generation using pdfkit ---
    const doc = new PDFDocument({ size: "A6", margin: 30 });

    // Set headers for PDF download
    const filename = `ticket-${event.title.replace(/\s+/g, "-")}-${req.user.name.replace(/\s+/g, "-")}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", contentDisposition(filename));

    // Pipe the PDF to the response
    doc.pipe(res);

    // --- PDF Content ---

    // Header
    doc.fontSize(20).font("Helvetica-Bold").text("Event Ticket", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).font("Helvetica").text(event.title, { align: "center" });
    doc.moveDown(2);

    // Dashed line
    doc.moveTo(30, doc.y).lineTo(doc.page.width - 30, doc.y).dash(5, { space: 5 }).stroke();
    doc.moveDown(2);

    // Details
    doc.fontSize(12).font("Helvetica-Bold");
    doc.text("Student:", { continued: true });
    doc.font("Helvetica").text(` ${req.user.name}`);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").text("Date:", { continued: true });
    doc.font("Helvetica").text(` ${new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").text("Location:", { continued: true });
    doc.font("Helvetica").text(` ${event.location}`);
    doc.moveDown(2);

    // --- QR Code ---
    doc.fontSize(10).font("Helvetica-Oblique").text("Scan at entry", { align: "center" });
    doc.moveDown(0.5);

    // Center the QR code
    const qrSize = 80;
    const qrX = (doc.page.width - qrSize) / 2;
    doc.image(qrCodeDataURL, qrX, doc.y, { fit: [qrSize, qrSize] });

    // Move cursor below the QR code
    doc.y += qrSize;
    doc.moveDown(0.5);
    doc.fontSize(8).text(`ID: ${req.user._id}`, { align: "center" });

    // Footer
    doc.y = doc.page.height - 50;
    doc.fontSize(8).font("Helvetica-Oblique").text("Thank you for registering!", { align: "center" });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error("TICKET DOWNLOAD ERROR:", error);
    res.status(500).json({ message: "Server error during ticket download." });
  }
};


module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  requestOfflinePayment,
  recordFailedPayment,
  getEventRegistrations,
  getMyRegisteredEvents,
  unregisterEvent,
  recommendEvents,
  getMyPayments,
  downloadTicket,
};
