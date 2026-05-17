import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { generateTicket } from "../../utils/generateTicket";
import { Ticket, CheckCircle, Clock, X, MapPin, Calendar, Download } from 'lucide-react';

// Centralized status configuration for clarity and easy maintenance
const statusConfig = {
  SUCCESS: {
    text: "Approved",
    icon: <CheckCircle size={14} />,
    color: "#2ecc71",
    bgColor: "#2ecc711a",
    subtext: "Your registration is confirmed.",
  },
  FREE: {
    text: "Approved (Free)",
    icon: <Ticket size={14} />,
    color: "#3498db",
    bgColor: "#3498db1a",
    subtext: "This is a free event.",
  },
  PENDING: {
    text: "Payment Pending",
    icon: <Clock size={14} />,
    color: "#f39c12",
    bgColor: "#f39c121a",
    subtext: "We are verifying your payment. Please check back in a while.",
  },
  REJECTED: {
    text: "Payment Failed",
    icon: <X size={14} />,
    color: "#e74c3c",
    bgColor: "#e74c3c1a",
    subtext: "Your payment was not successful. Please try again.",
  },
};

const MyRegisteredEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        // Get successfully registered events (free or paid with SUCCESS status)
        const registeredRes = await API.get("/events/my/registered");
        // Get all payment attempts to find pending/rejected ones
        const paymentsRes = await API.get("/events/my/payments");

        const eventsMap = new Map();

        // Process successfully registered events
        registeredRes.data.forEach(event => {
          eventsMap.set(event._id, {
            ...event,
            paymentStatus: event.isFree ? "FREE" : "SUCCESS",
          });
        });

        // Process events with pending or rejected payments
        paymentsRes.data.forEach(payment => {
          if (payment.status === "pending" || payment.status === "rejected") {
            // Avoid overwriting a successfully registered event if a failed/pending payment record still exists for some reason
            if (!eventsMap.has(payment.eventId)) {
              eventsMap.set(payment.eventId, {
                _id: payment.eventId,
                title: payment.title,
                description: payment.description,
                location: payment.location,
                date: payment.date,
                isFree: payment.isFree,
                price: payment.price,
                paymentStatus: payment.status === "pending" ? "PENDING" : "REJECTED",
              });
            }
          }
        });

        // Sort events by date
        const sortedEvents = Array.from(eventsMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
        setEvents(sortedEvents);
      } catch (error) {
        console.error("Failed to load registered events", error);
        alert("Failed to load registered events");
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  const handleTicketDownload = async (event) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    try {
      await generateTicket(event, user);
    } catch (err) {
      alert(err?.message || "Ticket download failed.");
      console.error("Ticket download failed", err);
    }
  };

  if (loading) return (
    <div className="neu-container" style={{ textAlign: "center" }}>
      <div className="neu-card">
        <h2>Loading Your Events...</h2>
      </div>
    </div>
  );

  return (
    <div className="neu-container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0 }}>My Events</h1>
          <p style={{ color: 'var(--neu-text-secondary)' }}>Manage your registered events and tickets</p>
        </div>

        {/* Content */}
        {events.length === 0 ? (
          <div className="neu-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3>No registered events yet</h3>
            <p style={{ color: 'var(--neu-text-secondary)', marginBottom: '2rem' }}>Start exploring and register for exciting upcoming events</p>
            <button className="neu-button primary" onClick={() => navigate('/events')}>
              Browse Events
            </button>
          </div>
        ) : (
          <div className="neu-grid">
            {events.map((event) => {
              const status = statusConfig[event.paymentStatus] || statusConfig.REJECTED;
              const badgeClass = 
                event.paymentStatus === 'SUCCESS' ? 'success' :
                event.paymentStatus === 'FREE' ? 'info' :
                event.paymentStatus === 'PENDING' ? 'warning' :
                'danger';

              return (
                <div key={event._id} className="neu-card" style={{ display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
                  {/* Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <div className={`neu-badge ${badgeClass}`}>
                    {status.icon}
                    <span style={{ marginLeft: '6px' }}>{status.text}</span>
                    </div>
                  </div>

                  {/* Header */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{event.title}</h3>
                    <p style={{ color: 'var(--neu-text-secondary)', fontSize: '0.9rem' }}>
                      {event.description?.substring(0, 80)}...
                    </p>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--neu-text-secondary)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} />
                      <span>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ marginTop: 'auto' }}>
                    <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--neu-text-secondary)', marginBottom: '1rem' }}>{status.subtext}</p>

                    {(event.paymentStatus === 'SUCCESS' || event.paymentStatus === 'FREE') && (
                      <button
                        className="neu-button primary"
                        style={{ width: '100%' }}
                        onClick={() => handleTicketDownload(event)}
                      >
                        <Download size={16} />
                        Download Ticket
                      </button>
                    )}

                    {event.paymentStatus === 'PENDING' && (
                      <div className="neu-button warning" style={{ width: '100%', cursor: 'default' }}>
                        ⏳ Verification in Progress
                      </div>
                    )}

                    {event.paymentStatus === 'REJECTED' && (
                      <button
                        className="neu-button danger"
                        style={{ width: '100%' }}
                        onClick={() => navigate(`/student/pay/${event._id}`)}
                      >
                        <X size={16} />
                        Retry Payment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
};

export default MyRegisteredEvents;
