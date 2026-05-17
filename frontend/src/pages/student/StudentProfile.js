import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { EVENT_CATEGORIES } from "../../constants/categories";

const StudentProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    year: "",
    interests: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/auth/profile");
        setUser(data);
        setFormData({
          name: data.name || "",
          department: data.department || "",
          year: data.year || "",
          interests: Array.isArray(data.interests)
            ? data.interests.filter((i) => EVENT_CATEGORIES.includes(i))
            : [],
        });
      } catch (error) {
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInterestChange = (e) => {
    const options = [...e.target.selectedOptions].map((o) => o.value);
    setFormData({ ...formData, interests: options });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put("/student/profile", formData);
      setUser(data);
      
      // Update local storage to reflect changes immediately across app
      const currentUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...data }));

      alert("Profile updated successfully");
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  if (loading) return (
    <div className="neu-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <div className="neu-card">
        <h2>Loading profile...</h2>
      </div>
    </div>
  );

  return (
    <div className="neu-container">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>My Profile</h1>
        
        <div className="neu-card">
          {/* Avatar Section */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              className="neu-button circle"
              style={{
                width: "100px",
                height: "100px",
                fontSize: "2.5rem",
                margin: "0 auto",
                cursor: "default",
                color: "var(--neu-blue)"
              }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ margin: "1rem 0 0.5rem" }}>{user?.name}</h2>
            <p style={{ margin: 0, marginBottom: '0.5rem', color: 'var(--neu-text-secondary)' }}>{user?.email}</p>
            <span className="neu-badge info">
              {user?.role.toUpperCase()}
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Full Name</label>
              <input
                className="neu-input"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Department</label>
              <input
                className="neu-input"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Year</label>
              <input
                className="neu-input"
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="e.g. 3rd Year"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', marginLeft: '0.5rem', color: 'var(--neu-text-secondary)' }}>Interests (Select multiple)</label>
              <select 
                className="neu-input" 
                value={formData.interests} 
                onChange={handleInterestChange} 
                multiple 
                style={{ height: '120px', backgroundColor: 'var(--neu-bg)' }}
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p style={{ fontSize: '0.8rem', color: 'var(--neu-text-secondary)', marginTop: '0.5rem', marginLeft: '0.5rem' }}>Hold Ctrl (Windows) or Cmd (Mac) to select multiple</p>
            </div>

            <button type="submit" className="neu-button primary" style={{ width: '100%' }}>Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;