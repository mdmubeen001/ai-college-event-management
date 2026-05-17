import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await API.get("/events/my/payments");
        setPayments(res.data);
      } catch (error) {
        alert("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) return (
    <div className="neu-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <div className="neu-card">Loading payments...</div>
    </div>
  );

  const getStatusColor = (status) => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'danger';
    return 'warning';
  };

  return (
    <div className="neu-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>My Payments</h1>
        <p style={{ color: 'var(--neu-text-secondary)' }}>Track your event payment history</p>
      </div>

          {payments.length === 0 ? (
            <div className="neu-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--neu-text-secondary)' }}>No payment history found.</p>
            </div>
          ) : (
            <div className="neu-grid">
              {payments.map((p, index) => (
                <div key={index} className="neu-card" style={{ marginBottom: 0 }}>
                  <div>
                    <h3 style={{ marginBottom: '0.5rem' }}>{p.title}</h3>
                    <p style={{ color: 'var(--neu-text-secondary)', marginBottom: '0.5rem' }}>
                      Amount: <strong style={{ color: 'var(--neu-text-primary)' }}>₹{p.price}</strong>
                    </p>
                    <div style={{ marginBottom: '1rem' }}>
                      <span className={`neu-badge ${getStatusColor(p.status)}`}>
                        {p.status === 'pending' ? 'Pending Approval' : p.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--neu-text-secondary)' }}>
                      Date: {new Date(p.date).toDateString()}
                    </p>
                    {p.status === "pending" && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--neu-text-secondary)' }}>
                        Ticket download available after admin approval.
                      </p>
                    )}

                    {p.status === "rejected" && (
                      <button
                        onClick={() => navigate(`/student/pay/${p.eventId}`)}
                        className="neu-button danger small"
                        style={{ marginTop: "1rem", width: '100%' }}
                      >
                        Retry Payment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
};

export default MyPayments;