import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import { EVENT_CATEGORIES } from "../../constants/categories";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await API.get(`/events/${id}`);
        setTitle(data.title);
        setCategory(data.category);
        setTags(Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags || ""));
        setDescription(data.description);
        setDate(new Date(data.date).toISOString().split("T")[0]);
        setLocation(data.location);
        setIsFree(data.isFree);
        setPrice(data.price || "");

        if (data.image) {
          const fullImageUrl = data.image.startsWith("http")
            ? data.image
            : `https://ai-college-backend-ja0y.onrender.com${data.image}`;
          setPreview(fullImageUrl);
          setImageUrl(data.image);
        }
      } catch (error) {
        alert("Failed to fetch event details");
        navigate("/admin/manage-events");
      } finally {
        setPageLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl("");
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImageFile(null);
    setPreview(url);
  };

  const handleGenerateAI = async () => {
    if (!title || !category) {
      alert("Please enter Title and Category first ✅");
      return;
    }
    try {
      setAiLoading(true);
      const res = await API.post("/ai/event-description", { title, category });
      setDescription(res.data.description);
      setAiGenerated(true);
    } catch (error) {
      alert(error.response?.data?.message || "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("tags", tags);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("location", location);
      formData.append("isFree", isFree);
      formData.append("price", isFree ? 0 : price);

      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("image", imageUrl);
      }

      await API.put(`/events/${id}`, formData);
      alert("Event updated successfully 🎉");
      navigate("/admin/manage-events");
    } catch (error) {
      alert(error.response?.data?.message || "Event update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await API.delete(`/events/${id}`);
      alert("Event deleted successfully 🗑️");
      navigate("/admin/manage-events");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete event");
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (pageLoading) return <h2>Loading Event...</h2>;

  return (
    <div className="neu-container">
      <div className="neu-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem", textAlign: 'center' }}>Edit Event</h1>
      <form onSubmit={submitHandler} style={{ display: 'grid', gap: '1.5rem' }}>
        <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Event Title *</label>
        <input value={title} onChange={(e) => {
          setTitle(e.target.value);
          setAiGenerated(false);
        }} required className="neu-input" />
        </div>

        <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Category *</label>
        <select value={category} onChange={(e) => {
          setCategory(e.target.value);
          setAiGenerated(false);
        }} className="neu-input" required>
          <option value="">Select Category</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        </div>

        <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Tags (comma-separated)</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. AI, coding, sports" className="neu-input" />
        </div>

        <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Description</label>
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={aiLoading || aiGenerated}
            className="neu-button small"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            {aiLoading ? (
              <>
                <span>Generating...</span>
              </>
            ) : aiGenerated ? (
              "Generated ✅"
            ) : (
              "✨ Generate with AI"
            )}
          </button>
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="neu-input" style={{ resize: "vertical", minHeight: '120px' }} />
        </div>

        <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Date *</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="neu-input" required />
        </div>

        <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Location *</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} className="neu-input" required />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={isFree} onChange={() => setIsFree(!isFree)} style={{ width: '18px', height: '18px' }} />
            Free Event?
          </label>
        </div>

        {!isFree && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Price (₹) *</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="neu-input" required />
          </div>
        )}

        <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Event Banner (Upload or URL)</label>
        <input type="file" accept="image/*" onChange={handleFileChange} className="neu-input" style={{ padding: '10px' }} />
        <p style={{ textAlign: "center", margin: "10px 0", fontWeight: "bold", color: 'var(--neu-text-secondary)' }}>OR</p>
        <input value={imageUrl} onChange={handleImageUrlChange} placeholder="Paste image URL here..." className="neu-input" />
        </div>

        {preview && <img src={preview} alt="preview" style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "var(--neu-radius-sm)", marginTop: "15px" }} />}

        <button type="submit" disabled={loading} className="neu-button primary large" style={{ width: "100%", marginTop: "1rem" }}>
          {loading ? "Saving..." : "Save Changes ✅"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/manage-events")}
          className="neu-button"
          style={{ width: "100%" }}
        >
          Cancel ❌
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="neu-button danger"
          style={{ width: "100%" }}
        >
          Delete Event 🗑️
        </button>
      </form>
      </div>

      {/* 🗑️ DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="neu-card" style={{ width: "90%", maxWidth: "400px" }}>
            <h3 style={{ marginTop: 0 }}>Confirm Deletion</h3>
            <p style={{ color: 'var(--neu-text-secondary)' }}>Are you sure you want to delete this event? This action cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "20px" }}>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="neu-button"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="neu-button danger"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEvent;