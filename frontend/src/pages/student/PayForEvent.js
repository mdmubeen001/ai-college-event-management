import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { CheckCircle } from 'lucide-react';

const PayForEvent = () => {
  const { id } = useParams(); // event id
  const navigate = useNavigate();

  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitPayment = async (e) => {
    e.preventDefault();

    if (!screenshot) {
      alert("Please upload payment screenshot");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("screenshot", screenshot);

      await API.post(`/events/${id}/payment`, formData);

      alert("Payment screenshot uploaded ✅ Waiting for admin approval");
      navigate("/student/my/registered");
    } catch (error) {
      alert(error.response?.data?.message || "Payment upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="neu-card" style={{ maxWidth: '500px', width: '100%' }}>
          <h1 style={{ marginTop: 0, marginBottom: '1rem', textAlign: 'center' }}>Pay for Event</h1>

          <p style={{ lineHeight: "1.6", marginBottom: "2rem", textAlign: 'center', color: 'var(--neu-text-secondary)' }}>
            <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--neu-green)' }} /> Scan QR and Pay <br />
            <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--neu-green)' }} /> Upload screenshot <br />
            <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--neu-green)' }} /> Admin will approve
          </p>

          {/* ✅ UPI QR (Static Image) */}
          <div style={{ padding: '1rem', background: 'white', borderRadius: 'var(--neu-radius-sm)', width: 'fit-content', margin: '0 auto 2rem' }}>
            <img
                src="https://i.ibb.co/0y0Q3mJ/upi-qr-demo.png"
                alt="UPI QR"
                style={{
                width: "100%",
                maxWidth: "250px",
                display: 'block',
                }}
            />
          </div>

          <form onSubmit={submitPayment} style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Upload Payment Screenshot</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files[0])}
                    className="neu-input"
                    style={{ padding: '10px' }}
                />
            </div>

            <button
              className="neu-button primary"
              style={{ width: '100%' }}
              type="submit"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Screenshot ✅"}
            </button>
          </form>
      </div>
    </div>
  );
};

export default PayForEvent;