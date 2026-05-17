import React, { useState } from "react";
import API from "../../services/api";

const FeedbackForm = ({ eventId, onFeedbackSubmitted }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await API.post("/feedback", { eventId, text });
      setMessage({ type: "success", text: "Feedback submitted! Thank you." });
      setText("");
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to submit feedback."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3 style={{ marginBottom: "0.5rem" }}>📝 Share Your Feedback</h3>
      <p style={{ marginBottom: "1.5rem", color: 'var(--neu-text-secondary)', fontSize: '0.9rem' }}>
        Tell us about your experience. Our AI analyzes feedback to improve future events.
      </p>

      {message && (
        <div
          className={`neu-badge ${message.type === "success" ? "success" : "danger"}`}
          style={{ marginBottom: "1rem", width: '100%', padding: '10px', justifyContent: 'center' }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you think about the event?"
            rows={4}
            className="neu-input"
            style={{ resize: 'vertical', minHeight: '100px' }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="neu-button primary small"
        >
          {loading ? "Analyzing..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
