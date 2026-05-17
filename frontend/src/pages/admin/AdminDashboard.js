import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FiUsers, FiCalendar, FiDollarSign, FiAlertCircle, FiMessageSquare } from 'react-icons/fi';
import StatCard from "../../components/StatCard";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, analyticsRes, feedbackRes] = await Promise.all([
          API.get("/admin/stats"),
          API.get("/admin/analytics"),
          API.get("/feedback/summary")
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
        setFeedbackStats(feedbackRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="neu-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="neu-card"><h2>Loading dashboard...</h2></div>
      </div>
    );
  if (!stats || !analytics)
    return (
      <div className="neu-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="neu-card"><h2>Failed to load data</h2></div>
      </div>
    );

  const COLORS = ["#5b4cc9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const SENTIMENT_COLORS = ["#10b981", "#ef4444", "#a3a3a3"];

  const globalFeedback = feedbackStats
    ? feedbackStats.reduce(
        (acc, curr) => ({
          positive: acc.positive + curr.positive,
          negative: acc.negative + curr.negative,
          neutral: acc.neutral + curr.neutral,
        }),
        { positive: 0, negative: 0, neutral: 0 }
      )
    : { positive: 0, negative: 0, neutral: 0 };

  const sentimentData = [
    { name: "Positive", value: globalFeedback.positive },
    { name: "Negative", value: globalFeedback.negative },
    { name: "Neutral", value: globalFeedback.neutral },
  ].filter((d) => d.value > 0);

  return (
    <div className="neu-container">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Dashboard</h1>
        <p style={{ color: 'var(--neu-text-secondary)', marginTop: '0.5rem' }}>
          Overview of events, students, and revenue
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="neu-grid-stats">
        <StatCard 
          icon={FiUsers}
          label="Total Students"
          value={stats.totalStudents}
          color="var(--neu-blue)"
        />
        <StatCard 
          icon={FiCalendar}
          label="Total Events"
          value={stats.totalEvents}
          color="var(--neu-green)"
        />
        <StatCard 
          icon={FiDollarSign}
          label="Total Revenue"
          value={`₹${stats.totalRevenue?.toLocaleString('en-IN')}`}
          color="var(--neu-orange)"
        />
        <StatCard 
          icon={FiAlertCircle}
          label="Pending Payments"
          value={stats.pendingPaymentsCount}
          color="var(--neu-red)"
          onClick={() => navigate("/admin/pending-payments")}
        />
      </div>

      {/* Charts Grid */}
      <div className="neu-grid" style={{ marginBottom: '2rem' }}>
        {/* Students by Department */}
        <div className="neu-card">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
            Students by Department
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.studentsByDepartment} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--neu-text-secondary)"
                strokeOpacity={0.2}
                vertical={false}
              />
              <XAxis 
                dataKey="_id" 
                stroke="var(--neu-text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                allowDecimals={false}
                stroke="var(--neu-text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'var(--neu-surface)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '12px',
                  boxShadow: 'var(--neu-shadow-outer)',
                  color: 'var(--neu-text-primary)'
                }}
              />
              <Bar dataKey="count" fill="var(--neu-blue)" name="Students" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Category */}
        <div className="neu-card">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
            Revenue by Category
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={analytics.revenueByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="var(--neu-blue)"
                dataKey="totalRevenue"
                nameKey="_id"
              >
                {analytics.revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `₹${value}`}
                contentStyle={{
                  background: 'var(--neu-surface)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '12px',
                  boxShadow: 'var(--neu-shadow-outer)',
                  color: 'var(--neu-text-primary)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Charts Row */}
      <div className="neu-grid" style={{ marginBottom: '2rem' }}>
        {/* Feedback Sentiment */}
        <div className="neu-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <FiMessageSquare size={20} color="var(--neu-blue)" />
            <h3 style={{ margin: 0 }}>
              Feedback Sentiment
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  background: 'var(--neu-surface)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '12px',
                  boxShadow: 'var(--neu-shadow-outer)',
                  color: 'var(--neu-text-primary)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <p style={{
            color: 'var(--neu-text-secondary)',
            textAlign: 'center',
            marginTop: '1rem',
            fontSize: '0.85rem'
          }}>
            AI-based NLP analysis of student feedback
          </p>
        </div>

        {/* Students by Year */}
        <div className="neu-card">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
            Students by Year
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats.studentsByYear} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--neu-text-secondary)"
                strokeOpacity={0.2}
                vertical={false}
              />
              <XAxis 
                dataKey="_id" 
                stroke="var(--neu-text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                allowDecimals={false}
                stroke="var(--neu-text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'var(--neu-surface)',
                  border: '1px solid var(--border-soft)',
                  borderRadius: '12px',
                  boxShadow: 'var(--neu-shadow-outer)',
                  color: 'var(--neu-text-primary)'
                }}
              />
              <Bar dataKey="count" fill="var(--neu-green)" name="Students" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Events Card */}
      <div className="neu-card">
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
          Top Popular Events
        </h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {analytics.topEvents && analytics.topEvents.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {analytics.topEvents.map((event, index) => (
                <div
                  key={index}
                  className="neu-card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', marginBottom: 0, boxShadow: 'var(--neu-shadow-inner)' }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>
                      {index + 1}. {event.title}
                    </span>
                  </div>
                  <span className="neu-badge info">
                    {event.registrationCount} Regs
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--neu-text-secondary)', fontStyle: 'italic' }}>
              No data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;