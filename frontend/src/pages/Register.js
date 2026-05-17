import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { EVENT_CATEGORIES } from '../constants/categories';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post('/auth/register', {
        name,
        email,
        password,
        interests,
      });
      alert('Registration successful!');
      navigate('/login');
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--neu-bg)" }}>
      <div className="neu-card" style={{ width: "100%", maxWidth: "450px", padding: "3rem 2rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ margin: 0, fontSize: "2rem", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>Create Account</h1>
          <p style={{ color: "var(--neu-text-secondary)", marginTop: "0.5rem" }}>Join our campus event community</p>
        </div>

        {/* Form Card */}
        <div>
          <form onSubmit={submitHandler} style={{ display: "grid", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.8rem", marginLeft: "0.5rem", color: "var(--neu-text-secondary)", fontSize: "0.9rem" }} htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="neu-input"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.8rem", marginLeft: "0.5rem", color: "var(--neu-text-secondary)", fontSize: "0.9rem" }} htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neu-input"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.8rem", marginLeft: "0.5rem", color: "var(--neu-text-secondary)", fontSize: "0.9rem" }} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neu-input"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.8rem", marginLeft: "0.5rem", color: "var(--neu-text-secondary)", fontSize: "0.9rem" }} htmlFor="interests">Interests (Select multiple)</label>
              <select
                id="interests"
                multiple
                value={interests}
                onChange={(e) => setInterests([...e.target.selectedOptions].map(option => option.value))}
                className="neu-input"
                style={{ minHeight: "120px", backgroundColor: "var(--neu-bg)" }}
              >
                {EVENT_CATEGORIES.map((interest) => (
                  <option key={interest} value={interest}>
                    {interest}
                  </option>
                ))}
              </select>
              <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--neu-text-secondary)", marginLeft: "0.5rem" }}>
                Hold Ctrl/Cmd to select multiple interests
              </p>
            </div>

            <button
              type="submit"
              className="neu-button large"
              style={{ width: "100%", marginTop: "1rem", color: "var(--neu-accent-info)" }}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Sign In Link */}
          <p style={{ textAlign: "center", marginTop: "2rem", color: "var(--neu-text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--neu-accent-info)", fontWeight: "bold", textDecoration: "none" }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
