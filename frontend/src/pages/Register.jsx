import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password || !confirmPassword || !role) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password, confirmPassword, role);
      // Navigate to OTP verification page
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        {/* Left Side - Branding & Features */}
        <div className="register-branding">
          <div className="branding-content">
            <div className="branding-logo">
              <img src="/logo3.png" alt="Bodhira" className="branding-logo-img" />
              <h1 className="branding-title">Bodhira</h1>
            </div>
            
            <p className="branding-tagline">AI-Powered Mock Test Platform</p>
            
            <div className="branding-features">
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">Instant AI-Generated Tests</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span className="feature-text">Real-time Performance Analytics</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🏫</span>
                <span className="feature-text">Classroom Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🏆</span>
                <span className="feature-text">Leaderboards & Competition</span>
              </div>
            </div>

            <div className="branding-stats">
              <div className="stat">
                <div className="stat-value">10K+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat">
                <div className="stat-value">50K+</div>
                <div className="stat-label">Tests Created</div>
              </div>
              <div className="stat">
                <div className="stat-value">95%</div>
                <div className="stat-label">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="register-form-section">
          <div className="register-form-container">
            <div className="form-header">
              <h2 className="form-title">Create Account</h2>
              <p className="form-subtitle">Join thousands of students & teachers</p>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              {/* Name Field */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Full Name</span>
                  <span className="label-required">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="form-input"
                  required
                  minLength={2}
                  disabled={loading}
                />
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Email Address</span>
                  <span className="label-required">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Password</span>
                  <span className="label-required">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <div className="password-hint">Minimum 6 characters</div>
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Confirm Password</span>
                  <span className="label-required">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              {/* Role Selection */}
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Account Type</span>
                  <span className="label-required">*</span>
                </label>
                <div className="role-selection">
                  <label className={`role-option ${role === 'student' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === 'student'}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={loading}
                    />
                    <span className="role-icon">👨‍🎓</span>
                    <span className="role-text">
                      <span className="role-name">Student</span>
                      <span className="role-desc">Take tests & learn</span>
                    </span>
                  </label>
                  
                  <label className={`role-option ${role === 'teacher' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={role === 'teacher'}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={loading}
                    />
                    <span className="role-icon">👨‍🏫</span>
                    <span className="role-text">
                      <span className="role-name">Teacher</span>
                      <span className="role-desc">Create & manage tests</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className={`submit-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Creating your account...
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>

              {/* Terms & Conditions */}
              <p className="terms-text">
                By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </p>
            </form>

            {/* Login Link */}
            <div className="login-link-section">
              <p className="login-text">
                Already have an account? <Link to="/login" className="login-link">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;