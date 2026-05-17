const Event = require("../models/Event");
const User = require("../models/User");
const { EVENT_CATEGORIES } = require("../constants/categories");

// ================================
// STUDENT DASHBOARD
// ================================
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    // All events
    const totalEvents = await Event.countDocuments();

    // My registered events (only existing events; deleted ones are not returned)
    const myRegisteredEvents = await Event.find({
      registrations: studentId,
    });

    // Upcoming events
    const upcomingEvents = await Event.find({
      date: { $gte: new Date() },
    })
      .limit(5)
      .lean();

    res.json({
      user: req.user,
      student: req.user,
      stats: {
        totalEvents: totalEvents ?? 0,
        registeredCount: myRegisteredEvents.length,
      },
      myRegisteredEvents: Array.isArray(myRegisteredEvents) ? myRegisteredEvents : [],
      upcomingEvents: Array.isArray(upcomingEvents) ? upcomingEvents : [],
    });
  } catch (error) {
    console.error("STUDENT DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// ✅ STEP 5.1 – REGISTER EVENT
// ================================
const registerEvent = async (req, res) => {
  try {
    const studentId = req.user._id;
    const eventId = req.params.eventId;

    // Check event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Prevent duplicate registration
    if (event.registrations.includes(studentId)) {
      return res.status(400).json({ message: "Already registered" });
    }

    // Add student to event
    event.registrations.push(studentId);
    await event.save();

    res.json({ message: "Event registered successfully" });
  } catch (error) {
    console.error("EVENT REGISTER ERROR:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

const unregisterEvent = async (req, res) => {
  try {
    const studentId = req.user._id;
    const eventId = req.params.eventId;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Already not registered
    if (!event.registrations.includes(studentId)) {
      return res.status(400).json({ message: "Not registered for this event" });
    }

    // Remove student
    event.registrations = event.registrations.filter(
      (id) => id.toString() !== studentId.toString()
    );

    await event.save();

    res.json({ message: "Unregistered successfully" });
  } catch (error) {
    console.error("UNREGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
// ✅ UPDATE PROFILE
// ================================
const updateStudentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const rawInterests = req.body.interests;
      const interests =
        Array.isArray(rawInterests)
          ? rawInterests.filter((i) => EVENT_CATEGORIES.includes(String(i).trim()))
          : user.interests;

      const updateData = {
        name: req.body.name || user.name,
        department: req.body.department || user.department,
        year: req.body.year || user.year,
        interests,
      };

      if (req.file) {
        updateData.profilePicture = `/uploads/${req.file.filename}`;
      }

      // Use findByIdAndUpdate to bypass pre-save hooks (avoids "next is not a function" error in User model)
      const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================
module.exports = {
  getStudentDashboard,
  registerEvent, // ✅ EXPORT ADDED
  unregisterEvent, // ✅ EXPORT ADDED
  updateStudentProfile, // ✅ EXPORT ADDED
};
