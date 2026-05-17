import React, { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import { EVENT_CATEGORIES } from "../../constants/categories";

const CreateEvent = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");

  // 💰 PRICE
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");

  // 🖼 IMAGE
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  // ✅ IMAGE FILE HANDLE
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);
      setImageUrl(""); // ✅ clear URL if file chosen

      // ✅ Preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  // ✅ IMAGE URL HANDLE
  const handleImageUrlChange = (e) => {
    const url = e.target.value;

    setImageUrl(url);
    setImageFile(null); // ✅ clear file if URL entered
    setPreview(url);
  };

  // ✅ AI GENERATE DESCRIPTION
  const handleGenerateAI = async () => {
    if (!title || !category) {
      alert("Please enter Title and Category first ✅");
      return;
    }

    try {
      setAiLoading(true);

      const res = await API.post("/ai/event-description", {
        title,
        category,
      });

      setDescription(res.data.description);
      setAiGenerated(true);
    } catch (error) {
      alert(error.response?.data?.message || "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  // ✅ SUBMIT
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!title || !category || !date || !location) {
      alert("Please fill all required fields ✅");
      return;
    }

    if (!isFree && (!price || Number(price) <= 0)) {
      alert("Please enter valid price for Paid event ✅");
      return;
    }

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

      // ✅ Image priority: FILE > URL
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (imageUrl) {
        formData.append("image", imageUrl);
      }

      await API.post("/events", formData);

      alert("Event created successfully 🎉");
      navigate("/admin");
    } catch (error) {
      alert(error.response?.data?.message || "Event creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu-container">
      <div className="neu-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>
            Create Event
          </h1>
          <p style={{ color: 'var(--neu-text-secondary)', margin: 0 }}>
            Add a new event to your catalog
          </p>
        </div>

        <form onSubmit={submitHandler} style={{ display: 'grid', gap: '1.5rem' }}>
          {/* TITLE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neu-text-secondary)' }}>Event Title *</span>
            </div>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setAiGenerated(false);
              }}
              placeholder="Enter event title"
              className="neu-input"
              required
            />
          </div>

          {/* CATEGORY */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neu-text-secondary)' }}>Category *</span>
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setAiGenerated(false);
              }}
              className="neu-input"
              required
            >
              <option value="">Select Category</option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* TAGS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neu-text-secondary)' }}>Tags</span>
            </div>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. AI, coding, sports, music"
              className="neu-input"
            />
          </div>

          {/* DESCRIPTION + AI */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neu-text-secondary)' }}>Description</span>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={aiLoading || aiGenerated}
                className="neu-button small"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                {aiLoading ? (
                  <>
                    Generating...
                  </>
                ) : aiGenerated ? (
                  '✅ Generated'
                ) : (
                  '✨ Generate'
                )}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event details..."
              className="neu-input"
              style={{ minHeight: '120px', resize: 'vertical' }}
            />
          </div>

          {/* DATE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neu-text-secondary)' }}>Date *</span>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="neu-input"
              required
            />
          </div>

          {/* LOCATION */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neu-text-secondary)' }}>Location *</span>
            </div>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Main Auditorium"
              className="neu-input"
              required
            />
          </div>

          {/* FREE EVENT CHECKBOX */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={() => setIsFree(!isFree)}
                style={{ width: '18px', height: '18px' }}
              />
              Free Event
            </label>
          </div>

          {/* PRICE - Show only if not free */}
          {!isFree && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neu-text-secondary)' }}>Price (₹) *</span>
              </div>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price"
                className="neu-input"
                required
              />
            </div>
          )}

          {/* IMAGE UPLOAD */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neu-text-secondary)' }}>Event Banner</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="neu-input"
              style={{ padding: '10px' }}
            />
          </div>

          {/* OR Separator */}
          {!imageFile && (
            <>
              <div style={{ textAlign: 'center', color: 'var(--neu-text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                — OR —
              </div>

              {/* IMAGE URL */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--neu-text-secondary)' }}>Image URL</span>
                </div>
                <input
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="Paste image URL here..."
                  className="neu-input"
                />
              </div>
            </>
          )}

          {/* IMAGE PREVIEW */}
          {preview && (
            <div>
              <p style={{ color: 'var(--neu-text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Preview
              </p>
              <img
                src={preview}
                alt="preview"
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--neu-radius-sm)' }}
              />
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div style={{ marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              className="neu-button primary large"
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  Creating...
                </>
              ) : (
                '✅ Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
