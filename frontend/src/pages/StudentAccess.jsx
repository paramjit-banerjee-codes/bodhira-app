import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { testAPI } from '../services/api';
import './JoinTest.css';

const StudentAccess = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStart = async (e) => {
    e.preventDefault();
    setError('');
    if (!code || code.trim().length < 8) {
      setError('Please enter the complete 8-character test code');
      return;
    }

    setLoading(true);
    try {
      const response = await testAPI.getTestByCode(code.trim().toUpperCase());
      const payload = response?.data?.data || response?.data || response;
      if (!payload || !payload.testId) {
        setError('Test not found for this code');
        setLoading(false);
        return;
      }

      // Redirect student to take test by code route
      navigate(`/test/code/${payload.testCode}`);
    } catch (err) {
      console.error('Error fetching test by code', err);
      setError(err.response?.data?.error || 'Failed to find test. Please check code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600, paddingTop: 40 }}>
      <div className="card">
        <h2>Enter Test Code</h2>
        <p>Ask your teacher for the 8-character test code (e.g. ABC123XY)</p>

        <form onSubmit={handleStart}>
          <div className="input-group">
            <label>Test Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter test code"
              maxLength={8}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Checking...' : 'Start Test'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentAccess;
