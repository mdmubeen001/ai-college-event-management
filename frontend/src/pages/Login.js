import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      onLogin && onLogin();

      if (data.role === "student") {
        navigate("/student/dashboard");
      } else if (data.role === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neu-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "var(--neu-bg)" }}>
      <div className="neu-card" style={{ width: "100%", maxWidth: "420px", padding: "3rem 2rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ margin: 0, fontSize: "2rem", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>Welcome Back</h1>
          <p style={{ color: "var(--neu-text-secondary)", marginTop: "0.5rem" }}>Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div>
          <form onSubmit={submitHandler} style={{ display: "grid", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.8rem", marginLeft: "0.5rem", color: "var(--neu-text-secondary)", fontSize: "0.9rem" }} htmlFor="email">
                Email Address
              </label>
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
              <label style={{ display: "block", marginBottom: "0.8rem", marginLeft: "0.5rem", color: "var(--neu-text-secondary)", fontSize: "0.9rem" }} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neu-input"
                required
              />
            </div>

            <button
              type="submit"
              className="neu-button large"
              style={{ width: "100%", marginTop: "1rem", color: "var(--neu-accent-info)" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p style={{ textAlign: "center", marginTop: "2rem", color: "var(--neu-text-secondary)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--neu-accent-info)", fontWeight: "bold", textDecoration: "none" }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
