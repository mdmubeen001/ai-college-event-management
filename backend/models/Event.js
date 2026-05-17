const mongoose = require("mongoose");

/* =========================
   PAYMENT SUB-SCHEMA
========================= */
// REMOVED: Using separate Payment model now

/* =========================
   EVENT SCHEMA
========================= */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "AI",
        "Technical",
        "Cultural",
        "Sports",
        "Workshop",
        "Seminar",
        "Competition",
        "Other",
      ],
    },

    tags: {
      type: [String],
      default: [],
    },

    date: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    image: {
      type: String, // URL or uploaded file path
    },

    isFree: {
      type: Boolean,
      default: true,
    },

    price: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    registrations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
