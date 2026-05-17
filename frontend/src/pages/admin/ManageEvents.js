import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FiEdit2, FiTrash2, FiCalendar, FiMapPin, FiPlus } from 'react-icons/fi';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { searchTerm } = useOutletContext() || { searchTerm: "" };
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const EVENT_PLACEHOLDER =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D'http%3A//www.w3.org/2000/svg'%20width%3D'800'%20height%3D'450'%3E%3Crect%20width%3D'100%25'%20height%3D'100%25'%20fill%3D'%23f3f4f6'/%3E%3Ctext%20x%3D'50%25'%20y%3D'50%25'%20font-size%3D'28'%20fill%3D'%236b7280'%20font-family%3D'Arial'%20dominant-baseline%3D'middle'%20text-anchor%3D'middle'%3ENo%20Image%3C/text%3E%3C/svg%3E";

  const resolveEventImage = (src) => {
    if (!src) return null;
    return src.startsWith("http") ? src : `http://localhost:5000${src}`;
  };

  const getEventImageSrc = (src) => resolveEventImage(src) || EVENT_PLACEHOLDER;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await API.get("/events");
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedEventId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedEventId) return;
    try {
      await API.delete(`/events/${selectedEventId}`);
      setEvents(events.filter((e) => e._id !== selectedEventId));
      setShowDeleteModal(false);
      setSelectedEventId(null);
    } catch (error) {
      alert("Failed to delete event");
    }
  };

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
      <p style={{ color: 'var(--color-text-secondary)' }}>Loading events...</p>
    </div>
  );

  return (
    <div className="neu-container">
      {/* Header with Create Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>
            Manage Events
          </h1>
          <p style={{ color: 'var(--neu-text-secondary)', margin: 0 }}>
            Create, edit, or delete events
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/create-event")}
          className="neu-button primary"
        >
          <FiPlus size={18} />
          New Event
        </button>
      </div>

      {/* No Events Message */}
      {filteredEvents.length === 0 ? (
        <div className="neu-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--neu-text-secondary)', margin: 0 }}>
            No events found {searchTerm && `matching "${searchTerm}"`}.
          </p>
        </div>
      ) : (
        /* Events Grid */
        <div className="neu-grid">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="neu-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                cursor: 'pointer',
                padding: '1.5rem',
                marginBottom: 0
              }}
            >
              {/* Event Image */}
              <div style={{
                width: '100%',
                height: '180px',
                background: 'var(--neu-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--neu-radius-sm)',
                fontSize: '48px',
                color: 'var(--neu-blue)',
                overflow: 'hidden',
                marginBottom: '1.5rem'
              }}>
                <img
                  src={getEventImageSrc(event.image)}
                  alt={event.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = EVENT_PLACEHOLDER;
                  }}
                />
              </div>

              {/* Card Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Title */}
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>
                  {event.title}
                </h3>

                {/* Date & Location */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--neu-text-secondary)',
                    fontSize: '0.9rem'
                  }}>
                    <FiCalendar size={16} />
                    {new Date(event.date).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--neu-text-secondary)',
                    fontSize: '0.9rem'
                  }}>
                    <FiMapPin size={16} />
                    {event.location}
                  </div>
                </div>

                {/* Price */}
                <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.5rem 0' }}>
                  {event.isFree ? (
                    <span style={{ color: 'var(--neu-green)' }}>Free</span>
                  ) : (
                    <span style={{ color: 'var(--neu-blue)' }}>₹{event.price?.toLocaleString('en-IN')}</span>
                  )}
                </p>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                  <button
                    onClick={() => navigate(`/admin/edit-event/${event._id}`)}
                    className="neu-button small"
                    style={{ flex: 1 }}
                  >
                    <FiEdit2 size={15} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(event._id)}
                    className="neu-button small danger"
                    style={{ flex: 1 }}
                  >
                    <FiTrash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          backdrop: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="neu-card" style={{ width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0 }}>
              Confirm Deletion
            </h3>
            <p style={{ color: 'var(--neu-text-secondary)', marginBottom: '2rem' }}>
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="neu-button"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="neu-button danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;