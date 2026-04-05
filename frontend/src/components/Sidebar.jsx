import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { MessageSquarePlus, Trophy, Search, X, PanelLeftClose } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    // Hide sidebar on nav icon click
    toggleSidebar();
  };

  return (
    <div className={`sidebar ${isOpen ? '' : 'hidden'}`}>
      <div className="sidebar-header">
        <h1>
          <span style={{ fontFamily: 'var(--font-regular)', letterSpacing: '2px' }}>🏛️ Arena</span>
        </h1>
        <button className="sidebar-toggle" onClick={toggleSidebar} title="Close Sidebar">
          <PanelLeftClose size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <MessageSquarePlus size={18} />
          New Chat
        </NavLink>
        <NavLink 
          to="/leaderboard" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={handleNavClick}
        >
          <Trophy size={18} />
          Leaderboard
        </NavLink>
        <button className="nav-item" onClick={handleNavClick} style={{background:'none', border:'none', width:'100%', cursor:'pointer', textAlign:'left'}}>
          <Search size={18} />
          Search
        </button>
      </nav>

      <div className="sidebar-footer">
        {/* User Profile */}
        <div className="user-profile" onClick={() => setShowLogout(!showLogout)}>
          <img 
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'User'}`} 
            alt="User Avatar" 
            className="avatar" 
          />
          <span className="email">{user?.email || 'user@example.com'}</span>
        </div>

        {/* Logout Popover */}
        {showLogout && (
          <div className="logout-popover">
            <div className="popover-header">
              <button className="close-btn" onClick={() => setShowLogout(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="popover-user-info">
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'User'}`} 
                alt="User Avatar" 
              />
              <span style={{ fontFamily: 'var(--font-medium)' }}>{user?.email || 'user@example.com'}</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>
              <input type="checkbox" /> Send me product updates and announcements
            </label>

            <button className="logout-btn" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
