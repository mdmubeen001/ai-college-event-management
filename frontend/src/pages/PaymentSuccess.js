import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import { CheckCircle, X } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState(
    "Payment successful - Now confirming your registration..."
  );
  const [eventId, setEventId] = useState(null);

  useEffect(() => {
    const confirmAfterPayment = async () => {
      const orderId = searchParams.get("order_id");
      const parts = orderId?.split("_");
      const extractedEventId = parts?.[1];

      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
          navigate("/login");
          return;
        }

        if (!orderId) {
          setStatus("failed");
          setMessage("Order ID missing");
          return;
        }

        if (!extractedEventId) {
          setStatus("failed");
          setMessage("Invalid order id format");
          return;
        }

        setEventId(extractedEventId);

        await API.post(`/events/${extractedEventId}/register`, {
          paid: true,
          paymentMethod: "CASHFREE",
          orderId: orderId,
        });

        setStatus("success");
        setMessage("Registration Confirmed 🎉 Redirecting...");

        // ✅ replace:true added
        setTimeout(() => {
          navigate(`/events/${extractedEventId}`, { replace: true });
        }, 1500);
      } catch (err) {
        console.log("PaymentSuccess Error:", err);

        const msg =
          err.response?.data?.message || "Registration failed ❌";

        if (msg.toLowerCase().includes("already")) {
          setStatus("success");
          setMessage("Already Registered ✅ Redirecting...");

          // ✅ replace:true added
          setTimeout(() => {
            navigate(`/events/${extractedEventId}`, { replace: true });
          }, 1200);
          return;
        }

        setStatus("failed");
        setMessage(msg);
      }
    };

    confirmAfterPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="neu-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div
        className="neu-card"
        style={{
          maxWidth: "520px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "8px" }}>Payment Status</h2>

        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--neu-text-secondary)",
            marginBottom: "18px",
          }}
        >
          {message}
        </p>

        {status === "processing" && (
          <div
            className="neu-badge warning"
            style={{
              marginBottom: "18px",
              fontSize: "1rem",
              padding: "10px 20px",
            }}
          >
            Processing...
          </div>
        )}

        {status === "success" && (
          <div
            className="neu-badge success"
            style={{
              marginBottom: "18px",
              fontSize: "1rem",
              padding: "10px 20px",
              gap: "0.5rem",
            }}
          >
            <CheckCircle size={16} /> Paid & Registered
          </div>
        )}

        {status === "failed" && (
          <div
            className="neu-badge danger"
            style={{
              marginBottom: "18px",
              fontSize: "1rem",
              padding: "10px 20px",
              gap: "0.5rem",
            }}
          >
            <X size={16} /> Failed
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={() => navigate("/events")}
            className="neu-button primary"
          >
            Go to Events
          </button>

          {eventId && (
            <button
              onClick={() => navigate(`/events/${eventId}`)}
              className="neu-button"
            >
              Open Event
            </button>
          )}
        </div>

        <p
          style={{
            marginTop: "18px",
            fontSize: "0.9rem",
            color: "var(--neu-text-secondary)",
          }}
        >
          After registration, you can download your ticket from the Event page
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;