import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { generateTicket } from "../utils/generateTicket";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [students, setStudents] = useState([]);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [copySuccess, setCopySuccess] = useState("");

  const [payLoading, setPayLoading] = useState(false);
  const [offlineLoading, setOfflineLoading] = useState(false);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const isStudent = user?.role === "student";
  const isAdmin = user?.role === "admin";
  const userId = user?._id;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await API.get(`/events/${id}`);
        setEvent(data);

        if (isStudent && data.registrations?.includes(userId)) {
          setIsRegistered(true);
        }

        const { data: allEvents } = await API.get("/events");
        const related = allEvents
          .filter((e) => e.category === data.category && e._id !== data._id)
          .slice(0, 3);
        setRelatedEvents(related);
      } catch (error) {
        console.error("Failed to fetch event details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, isStudent, userId]);

  useEffect(() => {
    if (!isStudent || !user) return;
    const checkPending = async () => {
      try {
        const { data } = await API.get("/events/my/payments");
        const pending = data.some((p) => p.eventId === id && p.status === "pending");
        setHasPendingPayment(pending);
      } catch (err) {
        console.error("Failed to check payment status", err);
      }
    };
    checkPending();
  }, [id, isStudent, user]);

  // ✅ Fetch registered students if Admin
  useEffect(() => {
    if (isAdmin) {
      const fetchStudents = async () => {
        try {
          const { data } = await API.get(`/events/${id}/registrations`);
          setStudents(data);
        } catch (error) {
          console.error("Failed to fetch registered students", error);
        }
      };
      fetchStudents();
    }
  }, [id, isAdmin]);

  const registerHandler = async () => {
    if (!user) return navigate("/login");
    try {
      await API.post(`/events/${id}/register`);
      alert("Registered successfully! 🎉");
      setIsRegistered(true);
      setEvent((prev) => ({
        ...prev,
        registrations: [...(prev.registrations || []), userId],
      }));
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const unregisterHandler = async () => {
    if (!user) return;
    try {
      await API.post(`/events/${id}/unregister`);
      alert("Unregistered successfully. ❌");
      setIsRegistered(false);
      setEvent((prev) => ({
        ...prev,
        registrations: (prev.registrations || []).filter((rId) => rId !== userId),
      }));
    } catch (error) {
      alert(error.response?.data?.message || "Unregistration failed");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess("Copied! ✅");
      setTimeout(() => setCopySuccess(""), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const requestOfflinePaymentHandler = async () => {
    if (!user) return navigate("/login");
    if (!event) return;
    if (event.isFree) return registerHandler();
    try {
      setOfflineLoading(true);
      await API.post(`/events/${id}/request-offline-payment`);
      alert("Offline payment requested. Wait for admin approval.");
      setHasPendingPayment(true);
    } catch (err) {
      alert(err.response?.data?.message || "Request failed");
    } finally {
      setOfflineLoading(false);
    }
  };

  const payWithCashfree = async () => {
    if (!user) return navigate("/login");

    if (!event) return;

    // ✅ FREE event should not go to payment
    if (event.isFree) {
      return registerHandler();
    }

    try {
      setPayLoading(true);

      // ✅ Check Cashfree SDK loaded
      if (!window.Cashfree) {
        alert("Cashfree SDK not loaded! Step 5 check karo (index.html).");
        setPayLoading(false);
        return;
      }

      // ✅ Create Order from backend
      const { data } = await API.post("/cashfree/create-order", {
        eventId: event._id,
        amount: event.price, // ✅ tumhare event me price field hai
      });

      const paymentSessionId = data?.order?.payment_session_id;

      if (!paymentSessionId) {
        alert("payment_session_id missing. Backend response check karo.");
        setPayLoading(false);
        return;
      }

      // ✅ Open Cashfree Checkout
      const cashfree = window.Cashfree({ mode: "sandbox" });

      cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });

      /**
       * ✅ IMPORTANT NOTE:
       * Cashfree checkout mostly redirect-based hota hai.
       * So code yaha aage execute nahi hoga.
       *
       * BEST FLOW:
       * payment success ke baad tum payment-success page pe redirect ho jaoge,
       * waha se register confirm kara sakte ho.
       *
       * BUT tum chahte ho direct yahi se register ho:
       * To redirect ke baad next step me PaymentSuccess page me register call karenge ✅
       */
    } catch (error) {
      alert(error.response?.data?.message || "Payment Failed");
      console.error(error);
    } finally {
      setPayLoading(false);
    }
  };

  const handleDownloadTicket = async () => {
    await generateTicket(event, user, { eventPageUrl: window.location.href });
  };

  if (loading)
    return (
      <div className="neu-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="neu-card">
          <h2>Loading event details...</h2>
        </div>
      </div>
    );
  if (!event)
    return (
      <div className="neu-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="neu-card">
          <h2>Event not found</h2>
        </div>
      </div>
    );

  return (
    <div className="neu-app">
      <header className="neu-header">
        <div className="neu-header-logo">CampusEvents</div>
      </header>
      
      <div className="neu-container">
          {/* Header with back and share */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: "1.5rem" }}>
            <button
              onClick={() => navigate("/events",{ replace: true })}
              className="neu-button small"
            >
              ← Back
            </button>
            <button
              onClick={handleShare}
              className="neu-button small"
            >
              {copySuccess || "Share 🔗"}
            </button>
          </div>

          {/* Main content card */}
          <div className="neu-card" style={{ marginBottom: "3rem" }}>
            {/* Hero Image */}
            {event.image && (
              <div style={{ marginBottom: "2rem" }}>
                <img
                  src={
                    event.image.startsWith("http")
                      ? event.image
                      : `https://ai-college-backend-ja0y.onrender.com${event.image}`
                  }
                  alt={event.title}
                  style={{ borderRadius: "var(--neu-radius-sm)", width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Title */}
            <h1 style={{ marginBottom: "1rem", marginTop: 0 }}>{event.title}</h1>

            {/* Badges */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <span className="neu-badge info">{event.category}</span>
              <span
                className={`neu-badge ${event.isFree ? "success" : "warning"}`}
              >
                {event.isFree ? "Free Event" : `₹${event.price}`}
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: "1.1rem", marginBottom: "2rem", lineHeight: "1.8", color: 'var(--neu-text-secondary)' }}>
              {event.description}
            </p>

            {/* Info Grid */}
            <div
              className="neu-grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: "2rem",
                padding: '1.5rem',
                borderRadius: 'var(--neu-radius-sm)',
                boxShadow: 'var(--neu-shadow-inner)'
              }}
            >
              <div>
                <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: 'var(--neu-text-secondary)' }}>
                  📅 Date
                </p>
                <p style={{ fontWeight: 600 }}>
                  {new Date(event.date).toDateString()}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: 'var(--neu-text-secondary)' }}>
                  📍 Location
                </p>
                <p style={{ fontWeight: 600 }}>{event.location}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: 'var(--neu-text-secondary)' }}>
                  👤 Organizer
                </p>
                <p style={{ fontWeight: 600 }}>
                  {event.createdBy?.name || "College Admin"}
                </p>
              </div>
              <div>
                <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: 'var(--neu-text-secondary)' }}>
                  👥 Registrations
                </p>
                <p style={{ fontWeight: 600 }}>
                  {event.registrations?.length || 0} students
                </p>
              </div>
            </div>

            {/* Registration Actions - Student View */}
            {isStudent && (
              <div style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}>
                {event.isFree ? (
                  <button
                    onClick={isRegistered ? unregisterHandler : registerHandler}
                    className={`neu-button large ${
                      isRegistered ? "danger" : "success"
                    }`}
                    style={{ width: '100%' }}
                  >
                    {isRegistered ? "Unregister" : "Register for Free"}
                  </button>
                ) : isRegistered ? (
                  <div className="neu-button large success" style={{ width: '100%', cursor: 'default' }}>
                    ✓ Registered & Paid
                  </div>
                ) : hasPendingPayment ? (
                  <div className="neu-button large warning" style={{ width: '100%', cursor: 'default' }}>
                    ⏳ Payment Pending Approval
                  </div>
                ) : (
                  <>
                    <button
                      onClick={payWithCashfree}
                      className="neu-button large primary"
                      style={{ width: '100%' }}
                      disabled={payLoading}
                    >
                      {payLoading ? "Opening Payment..." : `💳 Pay Online (₹${event.price})`}
                    </button>
                    <button
                      onClick={requestOfflinePaymentHandler}
                      disabled={offlineLoading}
                      className="neu-button large"
                      style={{ width: '100%' }}
                    >
                      {offlineLoading ? "Requesting..." : "💵 Pay Offline (Cash)"}
                    </button>
                  </>
                )}

                {/* Download Ticket */}
                {isRegistered && (
                  <button
                    onClick={handleDownloadTicket}
                    className="neu-button large"
                    style={{ width: '100%' }}
                  >
                    📄 Download Ticket
                  </button>
                )}
              </div>
            )}

            {/* Admin View - Registered Students */}
            {isAdmin && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "2rem" }}>
                <h3 style={{ marginBottom: "1.5rem" }}>
                  🎓 Registered Students ({students.length})
                </h3>

                {students.length === 0 ? (
                  <p style={{ fontStyle: "italic", color: 'var(--neu-text-secondary)' }}>
                    No students registered yet.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    {students.map((student) => (
                      <div
                        key={student._id}
                        className="neu-card"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1rem",
                          marginBottom: 0
                        }}
                      >
                        <div>
                          <strong style={{ display: "block", marginBottom: "0.25rem" }}>
                            {student.name}
                          </strong>
                          <span style={{ fontSize: "0.9rem", color: 'var(--neu-text-secondary)' }}>
                            {student.email}
                          </span>
                        </div>
                        <span className="neu-badge info">
                          {student.department || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

      {/* Related Events Section */}
      {relatedEvents.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
            <h2 style={{ marginBottom: "2rem" }}>You Might Also Like</h2>
            <div className="neu-grid">
              {relatedEvents.map((relEvent) => (
                <div
                  key={relEvent._id}
                  className="neu-card"
                  onClick={() => {
                    navigate(`/events/${relEvent._id}`);
                    window.scrollTo(0, 0);
                  }}
                  style={{ cursor: "pointer", marginBottom: 0, padding: '1.5rem' }}
                >
                  {relEvent.image && (
                    <div style={{ marginBottom: "1rem" }}>
                      <img
                        src={
                          relEvent.image.startsWith("http")
                            ? relEvent.image
                            : `https://ai-college-backend-ja0y.onrender.com${relEvent.image}`
                        }
                        alt={relEvent.title}
                        style={{ borderRadius: "var(--neu-radius-sm)", width: '100%', height: '150px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <h4 style={{ marginBottom: "0.5rem", marginTop: 0 }}>{relEvent.title}</h4>
                  <p style={{ margin: 0, color: 'var(--neu-text-secondary)' }}>
                    📅 {new Date(relEvent.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default EventDetails;
