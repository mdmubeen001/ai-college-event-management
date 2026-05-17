import jsPDF from "jspdf";
import QRCode from "qrcode";

/**
 * Generates a ticket PDF and triggers download.
 * Shared by EventDetails and MyRegisteredEvents for identical ticket format.
 *
 * @param {Object} event - Event data: { _id, title, date, location, createdBy?: { name } }
 * @param {Object} user - User data: { _id, name, email }
 * @param {Object} options - Optional: { eventPageUrl } for QR code (default: origin + /events/:id)
 */
export async function generateTicket(event, user, options = {}) {
  const doc = new jsPDF();

  // Header Background
  doc.setFillColor(108, 99, 255); // #6c63ff
  doc.rect(0, 0, 210, 40, "F");

  // College Logo (Top Left)
  try {
    const logoUrl = "https://placehold.co/100x100.png?text=Logo";
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const base64Logo = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    doc.addImage(base64Logo, "PNG", 10, 5, 30, 30);
  } catch (err) {
    console.error("Failed to load logo", err);
  }

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Event Ticket", 105, 25, null, null, "center");

  // Event Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(event.title, 20, 60);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Date: ${new Date(event.date).toDateString()}`, 20, 75);
  doc.text(`Location: ${event.location}`, 20, 85);
  doc.text(`Organizer: ${event.createdBy?.name || "College Admin"}`, 20, 95);

  // Separator Line
  doc.setDrawColor(200);
  doc.line(20, 110, 190, 110);

  // Student Details
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Attendee Details:", 20, 125);
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(`Name: ${user.name}`, 20, 135);
  doc.text(`Email: ${user.email}`, 20, 145);
  const ticketId = `${(event._id || "").slice(-6).toUpperCase()}-${(user._id || "").slice(-6).toUpperCase()}`;
  doc.text(`Ticket ID: ${ticketId}`, 20, 155);

  // QR Code (event page URL)
  const eventPageUrl = options.eventPageUrl ?? `${window.location.origin}/events/${event._id}`;
  try {
    const qrCodeData = await QRCode.toDataURL(eventPageUrl, {
      color: { dark: "#6c63ff", light: "#ffffff" },
    });
    doc.addImage(qrCodeData, "PNG", 150, 60, 40, 40);
  } catch (error) {
    console.error("Error generating QR code", error);
  }

  const filename = `${(event.title || "Ticket").replace(/\s+/g, "_")}_Ticket.pdf`;
  doc.save(filename);
}
