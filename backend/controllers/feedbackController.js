const Feedback = require("../models/Feedback");
const Event = require("../models/Event");
const { analyze } = require("../utils/sentimentAnalysis");

/**
 * POST /api/feedback
 * Student submits feedback for an event (must be registered).
 */
const submitFeedback = async (req, res) => {
  try {
    const { eventId, text } = req.body;
    if (!eventId || !text || !text.trim()) {
      return res.status(400).json({ message: "Event ID and feedback text are required" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const isRegistered = event.registrations.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (!isRegistered) {
      return res.status(403).json({ message: "You must be registered for this event to submit feedback" });
    }

    const existing = await Feedback.findOne({ event: eventId, student: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You have already submitted feedback for this event" });
    }

    const { sentiment, score } = analyze(text.trim());

    const feedback = await Feedback.create({
      event: eventId,
      student: req.user._id,
      text: text.trim(),
      sentiment,
      score,
    });

    const populated = await Feedback.findById(feedback._id)
      .populate("student", "name email")
      .populate("event", "title");

    res.status(201).json(populated);
  } catch (error) {
    console.error("SUBMIT FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/feedback/event/:id
 * List feedback for an event. Admin can get summary via query ?summary=true.
 */
const getFeedbackByEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { summary } = req.query;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const feedbacks = await Feedback.find({ event: eventId })
      .populate("student", "name email department year")
      .sort({ createdAt: -1 })
      .lean();

    if (summary === "true" && req.user.role === "admin") {
      const total = feedbacks.length;
      const positive = feedbacks.filter((f) => f.sentiment === "POSITIVE").length;
      const negative = feedbacks.filter((f) => f.sentiment === "NEGATIVE").length;
      const neutral = feedbacks.filter((f) => f.sentiment === "NEUTRAL").length;
      const sumScores = feedbacks.reduce((acc, f) => acc + f.score, 0);
      const averageScore = total > 0 ? (sumScores / total).toFixed(2) : 0;
      const positiveRatio = total > 0 ? (positive / total).toFixed(2) : 0;
      const negativeRatio = total > 0 ? (negative / total).toFixed(2) : 0;

      return res.status(200).json({
        event: { _id: event._id, title: event.title },
        feedbacks,
        summary: {
          total,
          positive,
          negative,
          neutral,
          positiveRatio: parseFloat(positiveRatio),
          negativeRatio: parseFloat(negativeRatio),
          averageScore: parseFloat(averageScore),
        },
      });
    }

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("GET FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/feedback/summary
 * Admin: list all events that have feedback with sentiment summary (for dashboard).
 */
const getFeedbackSummaryAll = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("event", "title date")
      .populate("student", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const byEvent = {};
    feedbacks.forEach((f) => {
      // Skip feedbacks where the event has been deleted (orphaned reference)
      if (!f.event) {
        return;
      }
      
      const eid = f.event._id.toString();
      if (!byEvent[eid]) {
        byEvent[eid] = {
          event: f.event,
          feedbacks: [],
          total: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
          sumScores: 0,
        };
      }
      byEvent[eid].feedbacks.push(f);
      byEvent[eid].total += 1;
      if (f.sentiment === "POSITIVE") byEvent[eid].positive += 1;
      else if (f.sentiment === "NEGATIVE") byEvent[eid].negative += 1;
      else byEvent[eid].neutral += 1;
      byEvent[eid].sumScores += f.score;
    });

    const summaryList = Object.values(byEvent).map((item) => ({
      event: item.event,
      total: item.total,
      positive: item.positive,
      negative: item.negative,
      neutral: item.neutral,
      positiveRatio: item.total > 0 ? parseFloat((item.positive / item.total).toFixed(2)) : 0,
      negativeRatio: item.total > 0 ? parseFloat((item.negative / item.total).toFixed(2)) : 0,
      averageScore: item.total > 0 ? parseFloat((item.sumScores / item.total).toFixed(2)) : 0,
    }));

    res.status(200).json(summaryList);
  } catch (error) {
    console.error("GET FEEDBACK SUMMARY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  submitFeedback,
  getFeedbackByEvent,
  getFeedbackSummaryAll,
};
