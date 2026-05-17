const Event = require("../models/Event");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Feedback = require("../models/Feedback");

// ================= ADMIN STATS =================
const getAdminStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });

    const registrations = await Event.aggregate([
      {
        $project: {
          count: { $size: { $ifNull: ["$registrations", []] } },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
        },
      },
    ]);

    const upcomingEvents = await Event.countDocuments({
      date: { $gte: new Date() },
    });

    // ✅ ADDED: Free/Paid/Revenue stats
    const freeEvents = await Event.countDocuments({ isFree: true });
    const paidEvents = await Event.countDocuments({ isFree: false });

    const revenue = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Fixed: Use aggregation to exclude orphaned payments (where event or student was deleted)
    const pendingPaymentsAgg = await Payment.aggregate([
      { $match: { status: "PENDING", paymentMethod: "OFFLINE_CASH" } },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "eventData",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "student",
          foreignField: "_id",
          as: "studentData",
        },
      },
      { $match: { "eventData.0": { $exists: true }, "studentData.0": { $exists: true } } },
      { $count: "count" },
    ]);

    const pendingPaymentsCount = pendingPaymentsAgg.length > 0 ? pendingPaymentsAgg[0].count : 0;

    // ✅ NEW: Student Demographics
    const studentsByDepartment = await User.aggregate([
      { $match: { role: "student" } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const studentsByYear = await User.aggregate([
      { $match: { role: "student" } },
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      totalEvents,
      totalStudents,
      totalRegistrations:
        registrations.length > 0 ? registrations[0].total : 0,
      upcomingEvents,
      freeEvents,
      paidEvents,
      totalRevenue: revenue.length > 0 ? revenue[0].total : 0,
      pendingPaymentsCount,
      studentsByDepartment,
      studentsByYear,
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= EVENT REGISTRATIONS =================
const getEventRegistrations = async (req, res) => {
  try {
    const { filter } = req.query; // 'all', 'paid', 'free'

    let responseData = [];

    // Handle PAID registrations
    if (filter === 'paid' || !filter || filter === 'all') {
        const paidPayments = await Payment.find({ status: 'SUCCESS' })
            .populate('student', 'name email department year')
            .populate('event', 'title')
            .sort({ paidAt: -1 })
            .lean();

        const paidData = paidPayments
            .filter(p => p.student && p.event)  // Skip orphaned records
            .map(p => ({
                student: p.student,
                event: p.event,
                registrationType: 'Paid',
                paymentDetails: {
                    paymentMethod: p.paymentMethod,
                    orderId: p.orderId,
                    paidAt: p.paidAt,
                }
            }));
        responseData.push(...paidData);
    }

    // Handle FREE registrations
    if (filter === 'free' || !filter || filter === 'all') {
        const freeEvents = await Event.find({ isFree: true, 'registrations.0': { $exists: true } })
            .populate('registrations', 'name email department year')
            .select('title registrations createdAt')
            .lean();

        freeEvents.forEach(event => {
            event.registrations.forEach(student => {
                // Skip null student references (orphaned data)
                if (student) {
                    responseData.push({
                        student: student,
                        event: { _id: event._id, title: event.title },
                        registrationType: 'Free',
                        // Use a placeholder date for sorting consistency
                        paymentDetails: { paidAt: student.createdAt || event.createdAt }
                    });
                }
            });
        });
    }

    // Sort combined list by date
    responseData.sort((a, b) => new Date(b.paymentDetails.paidAt) - new Date(a.paymentDetails.paidAt));

    res.status(200).json(responseData);
  } catch (error) {
    console.error("EVENT REG ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ANALYTICS =================
const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = {};

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    // 1. Events by Category
    const eventsByCategory = await Event.aggregate([
      { $match: matchStage },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // 2. Registrations per Event (Top 5)
    const topEvents = await Event.aggregate([
      { $match: matchStage },
      {
        $project: {
          title: 1,
          registrationCount: { $size: { $ifNull: ["$registrations", []] } },
        },
      },
      { $sort: { registrationCount: -1 } },
      { $limit: 5 },
    ]);

    // 3. Payment Status Distribution
    // Note: Filtering by Event date for payments requires a lookup, or we can just filter by payment date.
    // Here we filter by payment creation date if dates are provided.
    const paymentMatch = {};
    if (startDate || endDate) {
      paymentMatch.createdAt = {};
      if (startDate) paymentMatch.createdAt.$gte = new Date(startDate);
      if (endDate) paymentMatch.createdAt.$lte = new Date(endDate);
    }

    const paymentStats = await Payment.aggregate([
      { $match: paymentMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // 4. Revenue by Category
    const revenueByCategory = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      {
        $lookup: {
          from: "events",
          localField: "event",
          foreignField: "_id",
          as: "eventData"
        }
      },
      { $unwind: "$eventData" },
      // Filter by Event Date (matchStage)
      ...(Object.keys(matchStage).length > 0 ? [{ $match: { "eventData.date": matchStage.date } }] : []),
      { $group: { _id: "$eventData.category", totalRevenue: { $sum: "$amount" } } },
      { $sort: { totalRevenue: -1 } }
    ]);

    // 5. Calculate Attendance Rate (events with registrations / total events)
    const totalEventsCount = await Event.countDocuments(matchStage);
    const eventsWithRegistrations = await Event.countDocuments({
      ...matchStage,
      registrations: { $exists: true, $ne: [] }
    });
    const attendanceRate = totalEventsCount > 0 ? (eventsWithRegistrations / totalEventsCount) * 100 : 0;

    // 6. Calculate Average Feedback Score
    const feedbackMatch = {};
    if (startDate || endDate) {
      feedbackMatch.createdAt = {};
      if (startDate) feedbackMatch.createdAt.$gte = new Date(startDate);
      if (endDate) feedbackMatch.createdAt.$lte = new Date(endDate);
    }

    const feedbackStats = await Feedback.aggregate([
      { $match: feedbackMatch },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          averageScore: { $avg: "$score" }
        }
      }
    ]);

    const avgFeedbackScore = feedbackStats.length > 0 ? feedbackStats[0].averageScore : 0;

    // 7. Total Registrations and Revenue (for date range)
    const totalRegistrations = await Event.aggregate([
      { $match: matchStage },
      {
        $project: {
          count: { $size: { $ifNull: ["$registrations", []] } },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
        },
      },
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: "SUCCESS", ...paymentMatch } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      eventsByCategory,
      topEvents,
      paymentStats,
      revenueByCategory,
      attendanceRate: Math.round(attendanceRate),
      avgFeedbackScore: parseFloat(avgFeedbackScore.toFixed(1)),
      totalRegistrations: totalRegistrations.length > 0 ? totalRegistrations[0].total : 0,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= PENDING OFFLINE PAYMENTS =================
const getPendingOfflinePayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      status: "PENDING",
      paymentMethod: "OFFLINE_CASH",
    })
      .populate("event", "title date location price")
      .populate("student", "name email department year")
      .sort({ createdAt: -1 })
      .lean();

    const list = payments
      .filter((p) => p.event && p.student)
      .map((p) => ({
        _id: p._id,
        eventId: p.event._id,
        eventTitle: p.event.title,
        eventDate: p.event.date,
        eventLocation: p.event.location,
        eventPrice: p.event.price,
        student: p.student,
        studentName: p.student.name,
        studentEmail: p.student.email,
        amount: p.amount,
        status: p.status,
        paymentMethod: p.paymentMethod,
        createdAt: p.createdAt,
      }));

    res.status(200).json(list);
  } catch (error) {
    console.error("PENDING OFFLINE PAYMENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const approveOfflinePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment)
      return res.status(404).json({ message: "Payment not found" });
    if (payment.status !== "PENDING" || payment.paymentMethod !== "OFFLINE_CASH")
      return res.status(400).json({ message: "Payment is not pending offline" });

    payment.status = "SUCCESS";
    payment.paidAt = new Date();
    await payment.save();

    // Atomically add student to event registrations if not already present
    await Event.updateOne(
      { _id: payment.event },
      { $addToSet: { registrations: payment.student } }
    );

    res.status(200).json({ message: "Payment approved; student registered." });
  } catch (error) {
    console.error("APPROVE OFFLINE PAYMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const rejectOfflinePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment)
      return res.status(404).json({ message: "Payment not found" });
    if (payment.status !== "PENDING" || payment.paymentMethod !== "OFFLINE_CASH")
      return res.status(400).json({ message: "Payment is not pending offline" });

    payment.status = "FAILED";
    await payment.save();

    res.status(200).json({ message: "Payment rejected." });
  } catch (error) {
    console.error("REJECT OFFLINE PAYMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAdminStats,
  getEventRegistrations,
  getAnalytics,
  getPendingOfflinePayments,
  approveOfflinePayment,
  rejectOfflinePayment,
};
