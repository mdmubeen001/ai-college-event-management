import React, { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import { FiCheck, FiX } from 'react-icons/fi';

const PendingPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPendingPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/payments/pending-offline");      
      setPayments(res.data);
    } catch (error) {
      console.error("Failed to fetch pending payments:", error);
      showToast("Failed to load pending payments", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  const approveHandler = async (paymentId) => {
    try {
      console.log(`Approving payment with ID: ${paymentId}`);
      await API.post(`/admin/payments/${paymentId}/approve`);
      showToast("Payment Approved - Student registered", "success");
      setPayments((prev) => prev.filter((p) => p._id !== paymentId));
      console.log(`Payment with ID ${paymentId} approved successfully.`);
    } catch (error) {
      console.error(`Failed to approve payment with ID ${paymentId}:`, error);
      showToast(error.response?.data?.message || "Approve failed", "error");
    }
    
  };

  const rejectHandler = async (paymentId) => {
    try {
      await API.post(`/admin/payments/${paymentId}/reject`);
      showToast("Payment Rejected", "success");
      setPayments((prev) => prev.filter((p) => p._id !== paymentId));
      console.log(`Payment with ID ${paymentId} rejected successfully.`);
    } catch (error) {
      showToast(error.response?.data?.message || "Reject failed", "error");
    }
    
  };

  return (
    <div className="neu-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Pending Payments</h1>
        <p style={{ color: 'var(--neu-text-secondary)' }}>Review and approve offline payment requests</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`neu-badge ${toast.type === "success" ? "success" : "danger"}`} style={{ marginBottom: '1.5rem', width: '100%', padding: '1rem', justifyContent: 'center' }}>
          {toast.message}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="neu-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--neu-text-secondary)' }}>Loading pending payments...</p>
        </div>
      ) : payments?.length === 0 ? (
        <div className="neu-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--neu-text-secondary)' }}>No pending payments to review</p>
        </div>
      ) : (
        <div>
          {payments.map((payment) => (
            <div key={payment._id} className="neu-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{payment.eventTitle}</h3>
                  <p style={{ marginTop: '4px', color: 'var(--neu-text-primary)' }}>{payment.studentName}</p>
                </div>
                <p style={{ color: 'var(--neu-orange)', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>₹{payment.amount}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--neu-text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Email</span>
                  <span>{payment.studentEmail}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--neu-text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Payment Method</span>
                  <span>Offline</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--neu-text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Submitted</span>
                  <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {payment.screenshotUrl && (
                <img src={payment.screenshotUrl} alt="Payment receipt" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--neu-radius-sm)', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }} />
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  className="neu-button small success"
                  onClick={() => approveHandler(payment._id)}
                >
                  <FiCheck size={14} />
                  Approve
                </button>
                <button
                  className="neu-button small danger"
                  onClick={() => rejectHandler(payment._id)}
                >
                  <FiX size={14} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingPayments;