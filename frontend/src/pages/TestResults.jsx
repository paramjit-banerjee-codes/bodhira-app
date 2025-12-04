import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { testAPI } from '../services/api';
import './Results.css';

const TestResults = () => {
  const { testCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!testCode) return;
    fetchResults();
    // eslint-disable-next-line
  }, [testCode]);

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await testAPI.getTestResults(testCode);
      const payload = response?.data?.data || response?.data || response;
      setResults(payload.results || payload.results || []);
      setMeta({ testCode: payload.testCode, testId: payload.testId });
    } catch (err) {
      console.error('Failed to fetch test results', err);
      setError(err.response?.data?.error || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="card">
        <h2>Submissions for Test {testCode}</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div className="loading-spinner" style={{ width: 40, height: 40, borderWidth: 4 }}></div>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                  <th>User</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time (s)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id} style={{ borderBottom: '1px solid #0f172a' }}>
                    <td>{r.userId?.name || r.userId?.email || 'Unknown'}</td>
                    <td>{r.score}/{r.totalQuestions}</td>
                    <td>{r.percentage}%</td>
                    <td>{r.timeTaken}</td>
                    <td>{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResults;
