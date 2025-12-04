import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ComingSoonModal from './ComingSoonModal';
import './Navbar.css';

const Navbar = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme, showComingSoonModal, closeComingSoonModal } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const canGoBack = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/verify-otp';

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Back Button */}
        {canGoBack && (
          <button onClick={handleBack} className="navbar-back-btn" title="Go back">
            <span className="navbar-back-icon">←</span>
          </button>
        )}

        <Link to="/" className="navbar-logo">
          <img src="/logo3.png" alt="Bodhira" className="navbar-logo-img" />
          <span className="navbar-logo-text">Bodhira AI</span>
        </Link>
        
        <div className="navbar-menu">
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={`navbar-link ${isActive('/dashboard') ? 'navbar-link-active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/classrooms" 
                className={`navbar-link ${isActive('/classrooms') ? 'navbar-link-active' : ''}`}
              >
                Classrooms
              </Link>
              <Link 
                to="/join" 
                className={`navbar-link ${isActive('/join') ? 'navbar-link-active' : ''}`}
              >
                Take Test
              </Link>
              <Link 
                to="/generate" 
                className={`navbar-link ${isActive('/generate') ? 'navbar-link-active' : ''}`}
              >
                Generate Test
              </Link>
              <Link 
                to="/leaderboard" 
                className={`navbar-link ${isActive('/leaderboard') ? 'navbar-link-active' : ''}`}
              >
                Leaderboard
              </Link>
              <Link 
                to="/history" 
                className={`navbar-link ${isActive('/history') ? 'navbar-link-active' : ''}`}
              >
                History
              </Link>
              <Link 
                to="/profile" 
                className={`navbar-link ${isActive('/profile') ? 'navbar-link-active' : ''}`}
              >
                Profile
              </Link>
              <span className="navbar-user">👤 {user.name || user.username}</span>
              <button 
                onClick={toggleTheme}
                className="navbar-theme-toggle"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={toggleTheme}
                className="navbar-theme-toggle"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <Link 
                to="/login" 
                className={`navbar-link ${isActive('/login') ? 'navbar-link-active' : ''}`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`btn btn-primary ${isActive('/register') ? 'navbar-link-active' : ''}`}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      <ComingSoonModal isOpen={showComingSoonModal} onClose={closeComingSoonModal} />
    </nav>
  );
};

export default Navbar;