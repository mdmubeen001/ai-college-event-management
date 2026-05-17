import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { Calendar, MapPin } from 'lucide-react';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events");
        const upcoming = res.data.filter(e => new Date(e.date) > new Date());
        setEvents(upcoming);
      } catch (error) {
        alert("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return (
    <div className="neu-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <div className="neu-card">Loading events...</div>
    </div>
  );

  return (
    <div className="neu-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Upcoming Events</h1>
        <p style={{ color: 'var(--neu-text-secondary)' }}>Discover events happening near you</p>
      </div>

          {events.length === 0 ? (
            <div className="neu-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--neu-text-secondary)' }}>No upcoming events found.</p>
            </div>
          ) : (
            <div className="neu-grid">
              {events.map((event) => (
                <div key={event._id} className="neu-card" style={{ marginBottom: 0 }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{event.title}</h3>
                    <p style={{ marginBottom: '1rem', color: 'var(--neu-text-secondary)' }}>
                      {event.description?.substring(0, 80)}...
                    </p>
                    <div style={{ fontSize: '0.9rem', color: 'var(--neu-text-secondary)' }}>
                      <p style={{ margin: '0.25rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Calendar size={14} /> {new Date(event.date).toDateString()}</p>
                      <p style={{ margin: '0.25rem 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><MapPin size={14} /> {event.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
};

export default UpcomingEvents;