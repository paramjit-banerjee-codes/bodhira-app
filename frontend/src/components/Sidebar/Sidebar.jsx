import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Sparkles,
  Trophy,
  History,
  Target,
  Settings,
  HelpCircle,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NavItem from './NavItem';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Load collapsed state from localStorage
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem('sidebarCollapsed') === 'true'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark] = useState(true); // Always dark for now

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileMenuOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Mobile Close Button */}
        <button
          className="mobile-close-button"
          onClick={toggleMobileMenu}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>

        {/* Logo/Brand Section */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="logo-placeholder">
              <Sparkles size={24} strokeWidth={2.5} color="#FAFAFA" />
            </div>
          </div>
          {!isCollapsed && <span className="brand-text">Bodhira AI</span>}
        </div>

        {/* User Profile Card */}
        <div className="user-profile-card" onClick={() => navigate('/profile')}>
          <div className="user-avatar">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">{user?.name || 'Guest User'}</div>
              <div className="user-role">
                {user?.role === 'teacher' ? 'Teacher' : 'Student'}
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="nav-tooltip">{user?.name || 'Guest User'}</div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              to="/dashboard"
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={Users}
              label="Classrooms"
              to="/classrooms"
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={ClipboardList}
              label="Take Test"
              to="/join"
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={Sparkles}
              label="Generate Test"
              to="/generate"
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={Trophy}
              label="Leaderboard"
              to="/leaderboard"
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={History}
              label="History"
              to="/history"
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={Target}
              label="Mock Exams"
              to="/mock-tests"
              isCollapsed={isCollapsed}
            />
          </div>

          <div className="nav-divider" />

          <div className="nav-section">
            <NavItem
              icon={Settings}
              label="Settings"
              to="/settings"
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={HelpCircle}
              label="Help & Support"
              to="/help"
              isCollapsed={isCollapsed}
            />
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          {/* Theme Toggle - Currently disabled, always dark */}
          <button className="bottom-action" disabled style={{ opacity: 0.5 }}>
            <Moon size={20} strokeWidth={2} />
            {!isCollapsed && <span>Dark Mode</span>}
          </button>

          {/* Collapse/Expand Button (Desktop only) */}
          <button
            className="bottom-action collapse-button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={20} strokeWidth={2} />
            ) : (
              <>
                <ChevronLeft size={20} strokeWidth={2} />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
