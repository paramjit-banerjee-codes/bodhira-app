import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { testAPI } from '../services/api';
import './JoinTest.css';

const JoinTest = () => {
  const navigate = useNavigate();
  const [testCode, setTestCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔍 Checking test code:', testCode);
      // Validate test code exists and is published
      const response = await testAPI.getTestByCode(testCode.toUpperCase());
      
      console.log('✅ Test found:', response.data);

      if (!response.data?.data) {
        console.error('❌ Invalid response format:', response.data);
        setError('Invalid response from server. Please try again.');
        return;
      }

      // Navigate directly using test code - this route doesn't require auth
      navigate(`/test/code/${testCode.toUpperCase()}`);
    } catch (err) {
      console.error('❌ Error fetching test:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Invalid test code. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container join-container">
      <div className="join-card card">
        <div className="join-header">
          <h1>🔗 Join Test</h1>
          <p>Enter the test code shared by your teacher</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Test Code</label>
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123XY"
              required
              maxLength={8}
              style={{ 
                fontSize: '24px', 
                letterSpacing: '3px', 
                textAlign: 'center',
                textTransform: 'uppercase'
              }}
            />
            <small>Enter the 8-character code provided by your teacher</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="loading-spinner"></span> : 'Join Test →'}
          </button>
        </form>

        <div className="join-info">
          <h3>📋 Instructions</h3>
          <ul>
            <li>Ask your teacher for the test code</li>
            <li>Enter the code exactly as provided</li>
            <li>Click "Join Test" to start</li>
            <li>Complete the test within the time limit</li>
            <li>Submit to see your results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinTest;