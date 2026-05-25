import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { User, Calendar, Search, Bell, ChevronRight } from 'lucide-react';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const resolveEventImage = (event) => {
    const src = event?.image;
    if (!src) return null;
    return src.startsWith("http") ? src : `https://ai-college-backend-ja0y.onrender.com${src}`;
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setRecommendedLoading(true);

        const [dashRes, payRes, recRes] = await Promise.allSettled([
          api.get("/student/dashboard"),
          api.get("/events/my/payments"),
          api.get("/events/recommended"),
        ]);

        if (dashRes.status === "fulfilled") {
          setData(dashRes.value.data);
        } else {
          console.error("DASHBOARD ERROR:", dashRes.reason);
          alert("Failed to load dashboard");
        } 

        if (payRes.status === "fulfilled") {
          setPayments(Array.isArray(payRes.value.data) ? payRes.value.data : []);
        } else {
          console.warn("Payments failed to load:", payRes.reason);
          setPayments([]);
        }
 
        if (recRes.status === "fulfilled") {
          const raw = Array.isArray(recRes.value.data) ? recRes.value.data : [];
          setRecommendedEvents(raw.filter((e) => e && e._id).slice(0, 6));
        } else {
          console.warn("Recommendations failed to load:", recRes.reason);
          setRecommendedEvents([]);
        }
      } catch (error) { 
        console.error("DASHBOARD ERROR:", error);
        alert("Failed to load dashboard");
      } finally {
        setRecommendedLoading(false);
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => { 
    const onMouseDown = (e) => {
      const notifEl = notifRef.current;
      const profileEl = profileRef.current;

      if (notifEl && !notifEl.contains(e.target)) setNotifOpen(false);
      if (profileEl && !profileEl.contains(e.target)) setProfileOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const user = data?.user ?? data?.student ?? {}; 
  const stats = data?.stats ?? {};
  const upcomingEvents = useMemo(
    () => (Array.isArray(data?.upcomingEvents) ? data.upcomingEvents : []),
    [data?.upcomingEvents]
  );
  const safePayments = useMemo(
    () => (Array.isArray(payments) ? payments : []),
    [payments]
  );
  const interests = useMemo(() => {
    const u = data?.user ?? data?.student;
    return Array.isArray(u?.interests) ? u.interests : []; 
  }, [data]);

  const filteredRecommendedEvents = useMemo(() => {
    if (!Array.isArray(recommendedEvents) || recommendedEvents.length === 0) return recommendedEvents;
    const interestSet = new Set(
      (Array.isArray(interests) ? interests : [])
        .map((i) => String(i).toLowerCase().trim())
        .filter(Boolean)
    );
    if (interestSet.size === 0) return recommendedEvents;
    const filtered = recommendedEvents.filter((e) => {
      const cat = String(e?.category || "").toLowerCase().trim();
      const tags = (Array.isArray(e?.tags) ? e.tags : []).map((t) => String(t).toLowerCase().trim()).filter(Boolean);
      return interestSet.has(cat) || tags.some((t) => interestSet.has(t)); 
    });
    return filtered.length > 0 ? filtered : recommendedEvents;
  }, [interests, recommendedEvents]); 

  const notifications = useMemo(() => {
    const items = [];
    const latestApproved = safePayments.find((p) => p?.status === "approved");
    const latestPending = safePayments.find((p) => p?.status === "pending");
    const nextUpcoming = upcomingEvents.find((e) => e && e._id);

    if ((stats?.registeredCount || 0) > 0) {
      items.push({ 
        id: "reg-confirm",
        title: "Registration status",
        message: `You're registered for ${stats.registeredCount} event(s).`,
      });
    }

    if (latestApproved?.title) {
      items.push({ 
        id: "payment-approved",
        title: "Payment approved",
        message: `Payment approved for "${latestApproved.title}".`,
      });
    }

    if (latestPending?.title) { 
      items.push({
        id: "payment-pending",
        title: "Payment pending",
        message: `Payment pending for "${latestPending.title}".`,
      });
    }
 
    if (nextUpcoming?.title) {
      items.push({
        id: "upcoming-reminder",
        title: "Upcoming event",
        message: `"${nextUpcoming.title}" is coming up ${nextUpcoming.date ? `on ${new Date(nextUpcoming.date).toLocaleDateString()}` : "soon"}.`,
      }); 
    }

    if (filteredRecommendedEvents.length > 0) {
      items.push({
        id: "new-recs",
        title: "New recommendations",
        message: `You have ${filteredRecommendedEvents.length} event recommendation(s).`, 
      });
    }

    return items.slice(0, 6); 
  }, [filteredRecommendedEvents.length, safePayments, stats?.registeredCount, upcomingEvents]);

  if (loading)
    return (
      <div className="neu-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}> 
        <div className="neu-card" style={{ padding: '2rem' }}>Loading dashboard...</div>
      </div>
    );

  if (!data)
    return null;

  const pendingPaymentsCount = safePayments.filter((p) => p.status === "pending").length; 
  const completedPaymentsCount = safePayments.filter((p) => p.status === "approved").length;

  return (
    <div className="neu-container">
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--neu-spacing-xl)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Student Dashboard</h1>
          <p style={{ color: 'var(--neu-text-secondary)', margin: '5px 0 0' }}>Welcome back, {user?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--neu-spacing-md)', alignItems: 'center' }}> 
          <button className="neu-icon-btn" aria-label="Search"><Search size={20} /></button>

          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              className="neu-icon-btn"
              aria-label="Notifications"
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false); 
              }}
            >
              <Bell size={20} />
            </button>
            {notifOpen && ( 
              <div
                className="neu-card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 10px)',
                  width: 'min(360px, calc(100vw - 40px))',
                  zIndex: 50,
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 'bold' }}>Notifications</div>
                  <button className="neu-button small" onClick={() => setNotifOpen(false)}>Close</button>
                </div> 
                {notifications.length > 0 ? (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {notifications.map((n) => (
                      <div key={n.id} style={{ padding: '0.75rem', borderRadius: 'var(--neu-radius-sm)', background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-inner)' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{n.title}</div> 
                        <div style={{ color: 'var(--neu-text-secondary)', fontSize: '0.9rem' }}>{n.message}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--neu-text-secondary)', textAlign: 'center', padding: '0.75rem' }}>No notifications yet.</div>
                )}
              </div>
            )}
          </div> 

          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              className="neu-button circle"
              aria-label="Profile menu"
              style={{ marginLeft: '10px', width: '40px', height: '40px' }}
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }} 
            >
              <User size={20} />
            </button>
            {profileOpen && (
              <div 
                className="neu-card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 10px)',
                  width: '220px',
                  zIndex: 50,
                  padding: '0.75rem',
                }}
              >
                <button className="neu-nav-item" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => { setProfileOpen(false); navigate('/student/profile'); }}>
                  View Profile
                </button>
                <button className="neu-nav-item" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={() => { setProfileOpen(false); navigate('/student/events'); }}>
                  My Events
                </button>
                <button
                  className="neu-nav-item"
                  style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  onClick={() => {
                    setProfileOpen(false);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/');
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div> 
        </div>
      </header>

      {/* Stats Grid - Optimized for 4 columns */}
      <div className="neu-grid-stats">
        <div className="neu-card neu-stat neu-stat-compact">
          <div className="neu-stat-value">{stats?.registeredCount || 0}</div>
          <div className="neu-stat-label">Events Registered</div>
        </div>
        <div className="neu-card neu-stat neu-stat-compact">
          <div className="neu-stat-value" style={{ color: 'var(--neu-accent-success)' }}>{completedPaymentsCount}</div>
          <div className="neu-stat-label">Payments Done</div>
        </div>
        <div className="neu-card neu-stat neu-stat-compact">
          <div className="neu-stat-value" style={{ color: 'var(--neu-accent-warning)' }}>{upcomingEvents?.length || 0}</div>
          <div className="neu-stat-label">Upcoming</div>
        </div>
        <div className="neu-card neu-stat neu-stat-compact">
          <div className="neu-stat-value" style={{ color: 'var(--neu-accent-danger)' }}>{pendingPaymentsCount}</div>
          <div className="neu-stat-label">Pending Payment</div>
        </div>
      </div>

      {/* AI Recommendations - MOVED UP */}
      <section style={{ marginBottom: 'var(--neu-spacing-2xl)' }}> 
        <h2 style={{ marginBottom: 'var(--neu-spacing-md)', marginTop: 0 }}>Recommended for You</h2>
        <div className="neu-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {recommendedLoading ? (
            <div className="neu-card" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--neu-text-secondary)' }}>
              Loading recommendations...
            </div>
          ) : filteredRecommendedEvents.length > 0 ? (
            filteredRecommendedEvents.slice(0, 6).map((event) => {
              const imgSrc = resolveEventImage(event);
              return (
                <div
                  key={event._id}
                  className="neu-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <div
                    style={{
                      height: '140px',
                      borderRadius: 'var(--neu-radius-sm)',
                      marginBottom: '1rem',
                      overflow: 'hidden',
                      background: 'var(--neu-bg)', 
                      boxShadow: 'var(--neu-shadow-inner)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--neu-text-secondary)',
                    }}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={event.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ fontSize: '0.9rem' }}>No Image</div>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.05rem', marginTop: 0, marginBottom: '0.5rem' }}>{event.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="neu-badge info">{event.category || "Other"}</span>
                  </div>
                  <button
                    className="neu-button small neu-button--accent"
                    style={{ marginTop: '1rem', width: '100%' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${event._id}`);
                    }}
                  > 
                    Register
                  </button>
                </div>
              );
            })
          ) : (
            <div className="neu-card" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--neu-text-secondary)' }}>
              No recommendations yet. Add interests in your profile to see personalized events.
              <div style={{ marginTop: '1rem' }}>
                <button className="neu-button small" onClick={() => navigate('/student/profile')}>Update Interests</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section> 
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--neu-spacing-md)' }}>
          <h2 style={{ margin: 0 }}>Upcoming Events</h2>
          <button className="neu-button small" onClick={() => navigate('/student/upcoming')}>View All</button>
        </div>

        <div className="neu-card">
          {upcomingEvents.filter((e) => e && e._id).length > 0 ? (
            upcomingEvents
              .filter((e) => e && e._id)
              .slice(0, 3)
              .map((event) => (
                <div key={event._id} className="neu-list-item" onClick={() => navigate(`/events/${event._id}`)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="neu-button circle small" style={{ color: 'var(--neu-accent-info)' }}>
                      <Calendar size={16} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem' }}>{event.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--neu-text-secondary)' }}>
                        {event.date ? new Date(event.date).toLocaleDateString() : ''} â€¢ {event.location || ''}
                      </p>
                    </div>
                  </div>
                  <button className="neu-icon-btn" style={{ width: '32px', height: '32px' }}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))
          ) : (
            <p style={{ color: 'var(--neu-text-secondary)', textAlign: 'center', padding: '1rem' }}>No upcoming events.</p> 
          )}
        </div>
      </section>
    </div>
  );
};




export default StudentDashboard;
