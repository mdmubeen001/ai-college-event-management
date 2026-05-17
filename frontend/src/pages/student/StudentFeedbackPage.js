import React, { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import FeedbackForm from "./FeedbackForm";
import { Calendar, MapPin } from 'lucide-react';

const StudentFeedbackPage = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // To store current user info

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchRegisteredEventsWithFeedbackStatus = useCallback(async () => {
    if (!user) return; // Wait for user to be loaded

    try {
      setLoading(true);
      const { data: events } = await API.get("/events/my/registered");

      const eventsWithFeedbackStatus = await Promise.all(
        events.map(async (event) => {
          try {
            // Fetch all feedback for this event
            const { data: eventFeedbacks } = await API.get(`/feedback/event/${event._id}`);
            // Check if the current user has submitted feedback for this event
            const userFeedback = eventFeedbacks.find(
              (fb) => fb.student._id === user._id
            );
            return { ...event, userFeedback };
          } catch (feedbackError) {
            console.warn(`Could not fetch feedback for event ${event._id}:`, feedbackError);
            return { ...event, userFeedback: null }; // Assume no feedback or error fetching
          }
        })
      );
      setRegisteredEvents(eventsWithFeedbackStatus);
    } catch (err) {
      console.error("Failed to fetch registered events:", err);
      setError("Failed to load your registered events. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [user]); // Depend on user to re-fetch when user is set

  useEffect(() => {
    if (user) { // Only fetch if user data is available
      fetchRegisteredEventsWithFeedbackStatus();
    }
  }, [user, fetchRegisteredEventsWithFeedbackStatus]);

  const handleFeedbackSubmitted = () => {
    // Re-fetch events to update the UI after feedback submission
    fetchRegisteredEventsWithFeedbackStatus();
  };

  const isEventCompleted = (eventDate) => {
    return new Date(eventDate) < new Date();
  };

  // Filter to show only completed events
  const completedEvents = registeredEvents.filter((event) => isEventCompleted(event.date));

  if (loading || !user) {
    return <div className="neu-container" style={{ textAlign: "center" }}><div className="neu-card"><h2>Loading your events...</h2></div></div>;
  }

  if (error) {
    return <div className="neu-container" style={{ textAlign: "center" }}><div className="neu-card"><h2 style={{ color: 'var(--neu-red)' }}>{error}</h2></div></div>;
  }

  return (
    <div className="neu-container">
      <h1 style={{ marginBottom: "2rem" }}>Your Attended Events & Feedback</h1>

      {completedEvents.length === 0 ? (
        <div className="neu-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: "1.1rem", color: "var(--neu-text-secondary)" }}>
            You haven't attended any completed events yet. Feedback will be available after events conclude.
          </p>
        </div>
      ) : (
        <div className="neu-grid">
          {completedEvents.map((event) => (
            <div key={event._id} className="neu-card" style={{ marginBottom: 0 }}>
              <h3 style={{ margin: "0 0 10px 0" }}>{event.title}</h3>
              <p style={{ fontSize: "0.9rem", display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--neu-text-secondary)' }}><Calendar size={14} /> {new Date(event.date).toDateString()}</p>
              <p style={{ fontSize: "0.9rem", display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--neu-text-secondary)' }}><MapPin size={14} /> {event.location}</p>
              <p style={{ fontWeight: "bold", color: event.isFree ? "var(--neu-green)" : "var(--neu-orange)", marginTop: '0.5rem' }}>
                {event.isFree ? "FREE" : `₹${event.price}`}
              </p>

              {event.userFeedback ? (
                <div style={{ marginTop: '20px', padding: '15px', background: 'var(--neu-bg)', borderRadius: 'var(--neu-radius-sm)', boxShadow: 'var(--neu-shadow-inner)' }}>
                  <h4 style={{ margin: "0 0 10px 0", color: 'var(--neu-blue)' }}>Your Feedback:</h4>
                  <p style={{ fontStyle: "italic", color: 'var(--neu-text-primary)' }}>&quot;{event.userFeedback.text}&quot;</p>
                  <p style={{ fontSize: "0.9rem", color: 'var(--neu-text-secondary)' }}>
                    Sentiment: <span style={{ fontWeight: "bold", color: event.userFeedback.sentiment === "POSITIVE" ? "var(--neu-green)" : event.userFeedback.sentiment === "NEGATIVE" ? "var(--neu-red)" : "var(--neu-text-secondary)" }}>{event.userFeedback.sentiment}</span> (Score: {event.userFeedback.score})
                  </p>
                </div>
              ) : (
                <FeedbackForm eventId={event._id} onFeedbackSubmitted={handleFeedbackSubmitted} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentFeedbackPage;