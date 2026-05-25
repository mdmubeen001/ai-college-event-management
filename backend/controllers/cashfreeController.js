const axios = require("axios");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Event = require("../models/Event");

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "test"
    ? "https://sandbox.cashfree.com"
    : "https://api.cashfree.com";

exports.createCashfreeOrder = async (req, res) => {
  try {
    const { amount, eventId } = req.body;

    const userId = req.user.id;
    const userEmail = req.user.email || "test@gmail.com";
    const userPhone = req.user.phone || "9999999999";
    const userName = req.user.name || "Student";

    const orderId = `order_${eventId}_${userId}_${Date.now()}`;

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_name: userName,
        customer_email: userEmail,
        customer_phone: userPhone,
      },
      order_meta: {
        return_url: "http://localhost:3000/payment-success?order_id={order_id}",
      },
    };

    console.log("CLIENT ID:", process.env.CASHFREE_CLIENT_ID);
    console.log("ENV:", process.env.CASHFREE_ENV);
    console.log("BASE URL:", CASHFREE_BASE_URL);

    const response = await axios.post(`${CASHFREE_BASE_URL}/pg/orders`, payload, {
      headers: {
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
      },
    });

    return res.json({
      success: true,
      order: response.data, // ✅ payment_session_id comes here
    });
  } catch (err) {
    console.log("CASHFREE ERROR:", err.response?.data || err.message);

     return res.status(500).json({
     success: false,
     message: err.response?.data || err.message,
    });
  }
};

/* =========================
   HANDLE CASHFREE WEBHOOK
========================= */
exports.handleCashfreeWebhook = async (req, res) => {
  try {
    // NOTE: For production security, you should verify the signature.
    // const signature = req.headers["x-webhook-signature"];
    // const timestamp = req.headers["x-webhook-timestamp"];
    // const rawBody = req.rawBody; // Requires specific middleware configuration to get raw body
    // Verify logic here...

    const { type, data } = req.body;

    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = data.order.order_id;
      const paymentStatus = data.payment.payment_status;

      if (paymentStatus === "SUCCESS") {
        const payment = await Payment.findOne({ orderId });

        if (payment) {
          // 1. Update Payment Status
          payment.status = "SUCCESS";
          payment.paidAt = Date.now();
          await payment.save();

          // 2. Register Student for Event
          // Atomically add student to event registrations if not already present
          await Event.updateOne(
            { _id: payment.event },
            { $addToSet: { registrations: payment.student } }
          );
        }
      }
    } else if (type === "PAYMENT_FAILED_WEBHOOK" || type === "PAYMENT_USER_DROPPED_WEBHOOK") {
      const orderId = data.order.order_id;
      const payment = await Payment.findOne({ orderId });

      if (payment) {
        payment.status = "FAILED";
        await payment.save();
      }
    }

    res.status(200).json({ status: "OK" });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    res.status(500).json({ message: "Webhook handling failed" });
  }
};
