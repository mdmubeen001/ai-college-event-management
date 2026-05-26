import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiList, FiMessageSquare, FiClock, FiCreditCard, FiCalendar, FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi';
import API from '../../services/api';
import ThemeToggle from "../../components/ThemeToggle";

const StudentLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [rejectedCount, setRejectedCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const navItems = [
    { path: "/student/dashboard", icon: FiHome, label: "Dashboard" },
    { path: "/student/my/registered", icon: FiList, label: "My Events" },
    { path: "/student/upcoming", icon: FiClock, label: "Upcoming Events" },
    { path: "/student/my/payments", icon: FiCreditCard, label: "Payments" },
    { path: "/student/feedback", icon: FiMessageSquare, label: "Feedback" },
    { path: "/events", icon: FiCalendar, label: "All Events" },
    { path: "/student/profile", icon: FiUser, label: "Profile" }
  ];

  useEffect(() => {
    const fetchRejectedPayments = async () => {
      try {
        const res = await API.get('/events/my/payments');
        const rejected = res.data.filter((p) => p.status === 'rejected').length;
        setRejectedCount(rejected);
      } catch (error) {
        console.error('Failed to fetch payments', error);
      }
    };

    fetchRejectedPayments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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
    return item?.label || 'Dashboard';
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexShrink: 0 }}>
          <button className="neu-button circle small primary" style={{ width: '40px', height: '40px' }} onClick={toggleSidebar}>CE</button>
          <div className="neu-sidebar-title" style={{ fontWeight: 'bold', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>Campus Events</div>
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
                {item.label === 'Payments' && rejectedCount > 0 && (
                  <span className="neu-badge danger" style={{ marginLeft: 'auto' }}>{rejectedCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div style={{ marginTop: 'auto', flexShrink: 0, paddingTop: '1rem' }}>
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
        <header className="neu-header" style={{ padding: '0.75rem 1rem', gap: '1rem', minHeight: '70px', height: 'auto', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 auto', minWidth: 0 }}>
            <button 
              className="neu-button circle small neu-mobile-toggle"
              onClick={toggleSidebar}
            >
              <FiMenu size={24} />
            </button>
            <h1 style={{ 
              margin: 0, 
              fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {getCurrentPageTitle()}
            </h1>
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, marginLeft: 'auto' }}>
              <span style={{ 
                color: 'var(--neu-text-secondary)',
                fontSize: '0.9rem',
                display: 'inline-block',
                maxWidth: '120px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>Welcome, {user.name?.split(' ')[0]}!</span>
              <ThemeToggle />
            </div>
          )}
        </header>

        {/* Content Area */}
        <div style={{ padding: 'clamp(1rem, 4vw, 2rem)', width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;