import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events");
        setEvents(res.data);
      } catch (error) {
        alert("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all"
        ? true
        : filterType === "free"
        ? event.isFree
        : !event.isFree;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="neu-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="neu-card">
          <h2>Loading events...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="neu-app">
      
      <div className="neu-container">
          <button
            onClick={() => navigate(-1)}
            className="neu-button small"
            style={{ marginBottom: "2rem" }}
          >
            ← Back
          </button>

          <div className="neu-card" style={{ marginBottom: '3rem' }}>
            <h1 style={{ marginBottom: "0.5rem", marginTop: 0 }}>Discover Events</h1>
            <p style={{ color: "var(--neu-text-secondary)", marginBottom: "0" }}>
              Find and register for campus events that match your interests
            </p>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: "2rem" }}>
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neu-input"
            />
          </div>

          {/* Filter Buttons */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            {["all", "free", "paid"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`neu-button small ${
                  filterType === type
                    ? "primary"
                    : ""
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <p style={{ fontSize: "1.1rem", color: 'var(--neu-text-secondary)' }}>
                No events found. Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="neu-grid">
              {filteredEvents.map((event) => {
                const isRegistered = event.registrations?.includes(userId);

                return (
                  <div
                    key={event._id}
                    className="neu-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      cursor: "pointer",
                      position: "relative",
                      padding: '1.5rem',
                      marginBottom: 0
                    }}
                  >
                    {/* Image */}
                    {event.image && (
                      <div
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          marginBottom: "1rem",
                          borderRadius: "var(--neu-radius-sm)",
                          height: '180px'
                        }}
                      >
                        <img
                          src={
                            event.image?.startsWith("http")
                              ? event.image
                              : `https://ai-college-backend-ja0y.onrender.com${event.image}`
                          }
                          alt={event.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onClick={() => navigate(`/events/${event._id}`)}
                        />
                        {isRegistered && (
                          <div
                            className="neu-badge success"
                            style={{
                              position: "absolute",
                              top: "1rem",
                              right: "1rem",
                            }}
                          >
                            ✓ Registered
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <h3
                      style={{
                        marginBottom: "0.5rem",
                        cursor: "pointer",
                        marginTop: 0
                      }}
                      onClick={() => navigate(`/events/${event._id}`)}
                    >
                      {event.title}
                    </h3>

                    <p
                      style={{
                        fontSize: "0.95rem",
                        marginBottom: "1rem",
                        flex: 1,
                        color: 'var(--neu-text-secondary)'
                      }}
                    >
                      {event.description.length > 80
                        ? event.description.substring(0, 80) + "..."
                        : event.description}
                    </p>

                    {/* Meta Information */}
                    <div
                      style={{
                        display: "grid",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                        fontSize: "0.9rem",
                        color: "var(--neu-text-secondary)",
                      }}
                    >
                      <div>📍 {event.location}</div>
                      <div>📅 {new Date(event.date).toDateString()}</div>
                      <div>
                        <span
                          style={{
                            fontWeight: 600,
                            color: event.isFree ? "var(--neu-green)" : "var(--neu-blue)",
                          }}
                        >
                          {event.isFree ? "Free Event" : `₹${event.price}`}
                        </span>
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => navigate(`/events/${event._id}`)}
                      className="neu-button primary"
                      style={{ marginTop: "auto", width: '100%' }}
                    >
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
};

export default Events;
