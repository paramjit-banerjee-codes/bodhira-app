import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Link, Key, Info, ArrowRight, ClipboardList, 
  Loader2, Check, AlertCircle, Lightbulb 
} from 'lucide-react';
import { testAPI } from '../services/api';
import './JoinTest.css';

const JoinTest = () => {
  const navigate = useNavigate();
  const [testCode, setTestCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setTestCode(value);
    setError('');
    setIsValid(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setIsValidating(true);

    try {
      console.log('🔍 Checking test code:', testCode);
      const response = await testAPI.getTestByCode(testCode);
      
      console.log('✅ Test found:', response.data);

      if (!response.data?.data) {
        console.error('❌ Invalid response format:', response.data);
        setError('Invalid response from server. Please try again.');
        setIsValidating(false);
        return;
      }

      // Show success state briefly
      setIsValid(true);
      setIsValidating(false);

      // Navigate after short delay
      setTimeout(() => {
        navigate(`/test/code/${testCode}`);
      }, 500);
    } catch (err) {
      console.error('❌ Error fetching test:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Invalid test code. Please try again.';
      setError(errorMessage);
      setIsValidating(false);
      
      // Shake animation on error
      const input = document.querySelector('.test-code-input');
      if (input) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-test-page">
      {/* Hero Section */}
      <div className="join-hero">
        <div className="hero-icon-container">
          <div className="hero-icon-glow"></div>
          <Link className="hero-icon" size={40} />
        </div>
        <h1 className="hero-title">Join Test</h1>
        <p className="hero-subtitle">Enter the test code shared by your teacher</p>
      </div>

      {/* Main Content Card */}
      <div className="join-content-card">
        <form onSubmit={handleSubmit}>
          {/* Test Code Input Section */}
          <div className="input-section">
            <label className="input-label">
              <Key size={20} />
              <span>Test Code</span>
            </label>
            
            <div className="input-wrapper">
              <input
                type="text"
                value={testCode}
                onChange={handleInputChange}
                placeholder="E.G., ABC123XY"
                required
                maxLength={8}
                className={`test-code-input ${error ? 'error' : ''} ${isValid ? 'valid' : ''}`}
                disabled={loading}
              />
              {isValidating && (
                <div className="input-icon validating">
                  <Loader2 size={20} className="spin" />
                </div>
              )}
              {isValid && !isValidating && (
                <div className="input-icon valid">
                  <Check size={20} />
                </div>
              )}
              {error && !isValidating && (
                <div className="input-icon error">
                  <AlertCircle size={20} />
                </div>
              )}
            </div>

            <div className="input-helper">
              <Info size={16} />
              <span>Enter the 8-character code provided by your teacher</span>
            </div>

            {error && (
              <div className="error-message-premium">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Join Button */}
          <button 
            type="submit" 
            className="join-button"
            disabled={loading || !testCode.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spin" />
                <span>JOINING...</span>
              </>
            ) : (
              <>
                <span>JOIN TEST</span>
                <ArrowRight size={20} className="arrow-icon" />
              </>
            )}
          </button>
        </form>

        {/* Instructions Section */}
        <div className="instructions-section">
          <div className="instructions-header">
            <ClipboardList size={20} />
            <h3>Instructions</h3>
          </div>
          
          <div className="instructions-list">
            <div className="instruction-item">
              <ArrowRight size={16} className="instruction-arrow" />
              <span>Ask your teacher for the test code</span>
            </div>
            <div className="instruction-item">
              <ArrowRight size={16} className="instruction-arrow" />
              <span>Enter the code exactly as provided</span>
            </div>
            <div className="instruction-item">
              <ArrowRight size={16} className="instruction-arrow" />
              <span>Click 'Join Test' to start</span>
            </div>
            <div className="instruction-item">
              <ArrowRight size={16} className="instruction-arrow" />
              <span>Complete the test within the time limit</span>
            </div>
            <div className="instruction-item">
              <ArrowRight size={16} className="instruction-arrow" />
              <span>Submit to see your results</span>
            </div>
          </div>
        </div>

        {/* Quick Tips Card */}
        <div className="quick-tips-card">
          <div className="tips-header">
            <Lightbulb size={18} />
            <span>Quick Tip</span>
          </div>
          <p>Test codes are case-insensitive and can include hyphens</p>
        </div>
      </div>
    </div>
  );
};

export default JoinTest;