import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const NavItem = ({ icon: Icon, label, to, isCollapsed, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
                   (to !== '/dashboard' && location.pathname.startsWith(to));

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const content = (
    <>
      <Icon size={20} strokeWidth={2} className="nav-item-icon" />
      {!isCollapsed && <span className="nav-item-text">{label}</span>}
      {isCollapsed && <div className="nav-tooltip">{label}</div>}
    </>
  );

  const className = `nav-item ${isActive ? 'active' : ''}`;

  if (onClick) {
    return (
      <button
        className={className}
        onClick={handleClick}
        aria-label={label}
        role="button"
        tabIndex={0}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={className}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  );
};

export default NavItem;
