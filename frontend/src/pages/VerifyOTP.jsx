import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './VerifyOTP.css';

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0 || success) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, success]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');

    // Auto-submit if 6 digits
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  const handleVerify = async (otpValue = otp) => {
    if (otpValue.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    if (timeRemaining <= 0) {
      setError('OTP has expired. Please request a new one.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp: otpValue,
      });

      if (response.data.success) {
        setSuccess(true);
        // Store token if provided
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/login', {
            state: {
              verified: true,
              email,
            },
          });
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to verify OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/resend-otp', { email });

      if (response.data.success) {
        setOtp('');
        setTimeRemaining(600);
        setCanResend(false);
        setResendCooldown(30); // 30 second cooldown
        setError('OTP resent to your email');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to resend OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="verify-otp-container">
        <div className="verify-otp-box">
          <h2>No Email Found</h2>
          <p>Please sign up first to verify your email.</p>
          <button onClick={() => navigate('/register')} className="btn-primary">
            Go to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-box">
        {success ? (
          <div className="success-state">
            <div className="success-icon">✓</div>
            <h2>Email Verified!</h2>
            <p>Your account is now active. Redirecting to login...</p>
          </div>
        ) : (
          <>
            <div className="verify-header">
              <h2>Verify Your Email</h2>
              <p>Enter the 6-digit code sent to</p>
              <p className="email-display">{email}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="verify-form"
            >
              <div className="otp-input-group">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength="6"
                  className="otp-input"
                  disabled={loading}
                  autoComplete="off"
                />
                <div className="otp-input-underline"></div>
              </div>

              {error && (
                <div
                  className={`message ${
                    error.includes('resent') ? 'success-message' : 'error-message'
                  }`}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-verify"
                disabled={loading || otp.length !== 6 || timeRemaining <= 0}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="verify-footer">
                <div className="timer">
                  <span className="timer-label">Expires in:</span>
                  <span
                    className={`timer-value ${
                      timeRemaining < 180 ? 'timer-warning' : ''
                    }`}
                  >
                    {formatTime(timeRemaining)}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-resend"
                  onClick={handleResend}
                  disabled={!canResend || loading}
                >
                  {canResend
                    ? 'Resend OTP'
                    : `Resend in ${resendCooldown}s`}
                </button>
              </div>
            </form>

            <p className="verify-hint">
              💡 Check your spam folder if you don't see the email
            </p>
          </>
        )}
      </div>
    </div>
  );
}
