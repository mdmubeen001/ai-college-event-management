import React, { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FiTrendingUp, FiUsers, FiDollarSign, FiMessageSquare } from 'react-icons/fi';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [feedbackData, setFeedbackData] = useState([]);

  const fetchAnalytics = useCallback(() => {
    setLoading(true);
    Promise.all([
      API.get("/admin/analytics", { params: { startDate, endDate } }),
      API.get("/feedback/summary")
    ])
      .then(([analyticsRes, feedbackRes]) => {
        setData(analyticsRes.data);
        setFeedbackData(feedbackRes.data);
      })
      .catch((err) => alert("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="neu-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="neu-card"><h2>Loading analytics...</h2></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="neu-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="neu-card"><h2>Failed to load analytics data</h2></div>
      </div>
    );
  }

  const globalFeedback = feedbackData
    ? feedbackData.reduce(
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

  const SENTIMENT_COLORS = ["#10b981", "#ef4444", "#a3a3a3"];

  return (
    <div className="neu-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Analytics</h1>
        <p style={{ color: 'var(--neu-text-secondary)', marginTop: '0.5rem' }}>Performance and engagement metrics</p>
      </div>

      {/* Date Filter */}
      <div className="neu-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: 'var(--neu-text-secondary)' }}>Date Range:</span>
          <input
            type="date"
            className="neu-input"
            style={{ width: 'auto' }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span style={{ color: 'var(--neu-text-secondary)' }}>to</span>
          <input
            type="date"
            className="neu-input"
            style={{ width: 'auto' }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button className="neu-button primary" onClick={fetchAnalytics}>
            Apply Filter
          </button>
      </div>

      {/* Stats Cards */}
      <div className="neu-grid-stats" style={{ marginBottom: '2rem' }}>
        <div className="neu-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="neu-button circle" style={{ width: '50px', height: '50px', marginBottom: '1rem', color: 'var(--neu-blue)', cursor: 'default' }}>
            <FiUsers size={24} />
          </div>
          <p style={{ color: 'var(--neu-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Total Registrations</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0 0' }}>{data.totalRegistrations || 0}</p>
        </div>

        <div className="neu-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="neu-button circle" style={{ width: '50px', height: '50px', marginBottom: '1rem', color: 'var(--neu-green)', cursor: 'default' }}>
            <FiDollarSign size={24} />
          </div>
          <p style={{ color: 'var(--neu-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Total Revenue</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0 0' }}>₹{data.totalRevenue || 0}</p>
        </div>

        <div className="neu-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="neu-button circle" style={{ width: '50px', height: '50px', marginBottom: '1rem', color: 'var(--neu-orange)', cursor: 'default' }}>
            <FiTrendingUp size={24} />
          </div>
          <p style={{ color: 'var(--neu-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Attendance Rate</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0 0' }}>{Math.round(data.attendanceRate || 0)}%</p>
        </div>

        <div className="neu-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="neu-button circle" style={{ width: '50px', height: '50px', marginBottom: '1rem', color: 'var(--neu-blue)', cursor: 'default' }}>
            <FiMessageSquare size={24} />
          </div>
          <p style={{ color: 'var(--neu-text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Avg Feedback Score</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0.5rem 0 0' }}>{(data.avgFeedbackScore || 0).toFixed(1)}/5</p>
        </div>
      </div>

      {/* Charts */}
      <div className="neu-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {/* Events by Category Chart */}
        {data.eventsByCategory && data.eventsByCategory.length > 0 && (
          <div className="neu-card">
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiTrendingUp size={16} />
              Events by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.eventsByCategory.map(item => ({ category: item._id || 'Uncategorized', count: item.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="category" stroke="var(--neu-text-secondary)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--neu-text-secondary)" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--neu-surface)', border: 'none', borderRadius: '12px', boxShadow: 'var(--neu-shadow-outer)', color: 'var(--neu-text-primary)' }} />
                <Bar dataKey="count" fill="var(--neu-green)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Events Chart */}
        <div className="neu-card">
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiTrendingUp size={16} />
            Top Events by Registrations
          </h3>
          {data.topEvents && data.topEvents.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topEvents}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="title" stroke="var(--neu-text-secondary)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--neu-text-secondary)" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'var(--neu-surface)', border: 'none', borderRadius: '12px', boxShadow: 'var(--neu-shadow-outer)', color: 'var(--neu-text-primary)' }} />
                <Bar dataKey="registrationCount" fill="var(--neu-blue)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--neu-text-secondary)', textAlign: 'center' }}>No data available</p>
          )}
        </div>

        {/* Payment Status Chart */}
        {data.paymentStats && data.paymentStats.length > 0 && (
          <div className="neu-card">
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiDollarSign size={16} />
              Payment Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.paymentStats.map(item => ({ name: item._id, value: item.count }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.paymentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#10b981", "#ef4444", "#f59e0b", "#6b7280"][index % 4]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--neu-surface)', border: 'none', borderRadius: '12px', boxShadow: 'var(--neu-shadow-outer)', color: 'var(--neu-text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue by Category Chart */}
        {data.revenueByCategory && data.revenueByCategory.length > 0 && (
          <div className="neu-card">
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiDollarSign size={16} />
              Revenue by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.revenueByCategory.map(item => ({ category: item._id || 'Uncategorized', revenue: item.totalRevenue }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="category" stroke="var(--neu-text-secondary)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--neu-text-secondary)" tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip contentStyle={{ background: 'var(--neu-surface)', border: 'none', borderRadius: '12px', boxShadow: 'var(--neu-shadow-outer)', color: 'var(--neu-text-primary)' }} formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="var(--neu-orange)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sentiment Chart */}
        {sentimentData.length > 0 && (
          <div className="neu-card">
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiMessageSquare size={16} />
              Feedback Sentiment
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--neu-surface)', border: 'none', borderRadius: '12px', boxShadow: 'var(--neu-shadow-outer)', color: 'var(--neu-text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;