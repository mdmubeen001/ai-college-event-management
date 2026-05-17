import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import { CheckCircle, X } from 'lucide-react';

const AdminEventRegistrations = () => {
  const { id } = useParams(); // eventId
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = useCallback(async () => {
    try {
      const res = await API.get(`/events/${id}/registrations`);
      setStudents(res.data);
    } catch (error) {
      alert("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const approvePayment = async (studentId) => {
    try {
      await API.post(`/events/${id}/approve`, { studentId });
      alert("Payment approved");
      fetchRegistrations();
    } catch {
      alert("Approval failed");
    }
  };

  const rejectPayment = async (studentId) => {
    try {
      await API.post(`/events/${id}/reject`, { studentId });
      alert("Payment rejected");
      fetchRegistrations();
    } catch {
      alert("Reject failed");
    }
  };

  if (loading) return (
    <div className="neu-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <div className="neu-card">Loading registrations...</div>
    </div>
  );

  return (
    <div className="neu-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Event Registrations</h1>
        <p style={{ color: 'var(--neu-text-secondary)' }}>View and manage student registrations</p>
      </div>

          {students.length === 0 ? (
            <div className="neu-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--neu-text-secondary)' }}>No registrations found for this event.</p>
            </div>
          ) : (
            <div className="neu-grid">
              {students.map((registration, index) => (
                <div key={registration._id || index} className="neu-card" style={{ marginBottom: 0 }}>
                  <div>
                    <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>
                      👤 {registration.student?.name}
                    </h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ margin: '0.25rem 0', color: 'var(--neu-text-secondary)' }}>
                        <b>Email:</b> {registration.student?.email}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: 'var(--neu-text-secondary)' }}>
                        <b>Department:</b> {registration.student?.department}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: 'var(--neu-text-secondary)' }}>
                        <b>Year:</b> {registration.student?.year}
                      </p>
                      <p style={{ margin: '0.25rem 0', color: 'var(--neu-text-secondary)' }}>
                        <b>Status:</b>{' '}
                        <span
                          className={`neu-badge ${
                              registration.paymentStatus === 'approved'
                                ? 'success'
                                : registration.paymentStatus === 'rejected'
                                ? 'danger'
                                : 'warning'
                          }`}
                        >
                          {registration.paymentStatus?.toUpperCase() || 'PENDING'}
                        </span>
                      </p>
                    </div>

                    {registration.paymentStatus === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          className="neu-button small success"
                          onClick={() => approvePayment(registration.student._id)}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          className="neu-button small danger"
                          onClick={() => rejectPayment(registration.student._id)}
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
    </div>
  );
};

export default AdminEventRegistrations;