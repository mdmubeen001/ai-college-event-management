import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { FiHome, FiTool, FiUsers, FiBarChart2, FiDollarSign, FiCalendar, FiLogOut, FiBell, FiMenu, FiX } from 'react-icons/fi';
import API from "../../services/api";
import ThemeToggle from "../../components/ThemeToggle";

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/admin/", label: "Dashboard", icon: FiHome },
    { path: "/admin/manage-events", label: "Event Management", icon: FiTool },
    { path: "/admin/registrations", label: "Registrations", icon: FiUsers },
    { path: "/admin/analytics", label: "Analytics", icon: FiBarChart2 },
    { path: "/admin/pending-payments", label: "Pending Payments", icon: FiDollarSign },
    { path: "/admin/create-event", label: "Create Event", icon: FiCalendar }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/stats");
        setPendingCount(res.data.pendingPaymentsCount || 0);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const closeMobileSidebar = () => setMobileOpen(false);

  const toggleSidebar = () => {
    if (window.innerWidth <= 900) {
      setMobileOpen(!mobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const getCurrentPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item?.label || 'Admin Panel';
  };

  return (
    <div className="neu-app" style={{ flexDirection: 'row' }}>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="neu-mobile-overlay"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`neu-sidebar ${mobileOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button className="neu-button circle small primary" style={{ width: '40px', height: '40px' }} onClick={toggleSidebar}>AD</button>
          <div className="neu-sidebar-title" style={{ fontWeight: 'bold', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>Admin Panel</div>
        </div>

        {/* Close Button (Mobile Only) */}
        <button 
          className="neu-button circle small neu-mobile-toggle" 
          style={{ position: 'absolute', top: '1rem', right: '1rem' }}
          onClick={closeMobileSidebar}
        >
          <FiX size={24} />
        </button>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`neu-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
                data-tooltip={item.label}
              >
                <div>
                  <item.icon size={20} />
                </div>
                <span>{item.label}</span>
                {item.label === 'Pending Payments' && pendingCount > 0 && (
                  <span className="neu-badge danger" style={{ marginLeft: 'auto' }}>{pendingCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={{ marginTop: 'auto' }}>
          <button 
            onClick={handleLogout}
            className="neu-nav-item"
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
            data-tooltip="Logout"
          >
            <div>
              <FiLogOut size={20} />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header className="neu-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="neu-button circle small neu-mobile-toggle"
              onClick={toggleSidebar}
            >
              <FiMenu size={24} />
            </button>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
              {getCurrentPageTitle()}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {location.pathname === "/admin/manage-events" && (
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neu-input"
                style={{ padding: '8px 16px', width: '250px' }}
              />
            )}
            <ThemeToggle />
            <button
              onClick={() => navigate("/admin/pending-payments")}
              className="neu-button circle small"
              title="Pending Payments"
            >
              <FiBell size={20} />
              {pendingCount > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', background: 'var(--neu-red)', borderRadius: '50%' }}>
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: '2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Outlet context={{ searchTerm }} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
