import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, TrendingUp, Brain, CreditCard, Sparkles } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  const features = [
    {
      icon: <Zap size={32} />,
      title: "Smart Recommendations",
      description: "Our AI analyzes your interests to suggest events you'll love, ensuring personalized campus experiences."
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Predictive Analytics",
      description: "Admins get data-driven insights to forecast attendance and optimize event planning."
    },
    {
      icon: <CreditCard size={32} />,
      title: "Flexible Payment Methods",
      description: "Supports both Online Payments (Cashfree/UPI/Card) and Offline Payments at college counters with admin approval."
    },
    {
      icon: <Sparkles size={32} />,
      title: "AI Event Description",
      description: "Automatically generates event descriptions using the event title and category, helping organizers fill missing details quickly and professionally — without using any external API."
    },
    {
      icon: <Brain size={32} />,
      title: "Sentiment Analysis",
      description: "Understand student feedback better with AI-driven sentiment analysis on event reviews."
    }
  ];

  return (
    <div className="neu-app" style={{ flexDirection: 'column' }}>
      {/* Navigation Header */}
      <header className="neu-header">
        <div className="neu-header-logo">
          <h2>CampusEvents</h2>
        </div>
        <div className="neu-header-actions">
          <ThemeToggle />
          <Link to="/login" className="neu-button small">Sign In</Link>
          <Link to="/register" className="neu-button small primary">Sign Up</Link>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section className="neu-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Discover & Create Campus Events That Inspire
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--neu-text-secondary)', marginBottom: '3rem' }}>
              The intelligent platform for colleges to manage events and engage students.
            </p>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
              <Link to="/events" className="neu-button primary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
                Explore Events
              </Link>
              <Link to="/student/dashboard" className="neu-button" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
                Go to Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="neu-container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 style={{ marginBottom: "0.5rem", fontSize: '2rem' }}>Powered by Artificial Intelligence</h2>
              <p style={{ fontSize: "1.1rem", color: "var(--neu-text-secondary)" }}>
                Revolutionizing how colleges connect and engage.
              </p>
            </div>

            <div className="neu-grid">
              {features.map((feature, index) => (
                <div key={index} className="neu-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1.5rem", color: 'var(--neu-blue)' }}>{feature.icon}</div>
                  <h3 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>{feature.title}</h3>
                  <p style={{ fontSize: "0.95rem", margin: 0, color: 'var(--neu-text-secondary)' }}>{feature.description}</p>
                </div>
              ))}
            </div>
        </section>

        {/* CTA Section */}
        <section className="neu-container" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <div className="neu-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ marginBottom: "1rem", fontSize: '2rem' }}>Ready to get started?</h2>
              <p style={{ marginBottom: "2rem", color: 'var(--neu-text-secondary)' }}>
                Join your college community and never miss an event that matters to you.
              </p>
              <Link to="/events" className="neu-button primary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
                Explore Events Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        padding: "2rem",
        textAlign: "center",
        color: "var(--neu-text-secondary)",
        marginTop: "auto",
        borderTop: "1px solid rgba(255,255,255,0.02)"
      }}>
        <div className="neu-container">
          <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>
            &copy; {new Date().getFullYear()} CampusEvents. All rights reserved.
          </p>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Empowering Campus Life with AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
