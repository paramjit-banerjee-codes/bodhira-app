import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leaderboardAPI } from '../services/api';
import TestPaperModal from '../components/TestPaperModal';
import './Leaderboard.css';

const Leaderboard = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [testCode, setTestCode] = useState(searchParams.get('code') || '');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPaperModal, setShowPaperModal] = useState(false);

  useEffect(() => {
    if (testCode) {
      loadLeaderboardByCode();
    }
  }, [testCode]);

  const loadLeaderboardByCode = async () => {
    if (!testCode) return;
    setLoading(true);
    setError(null);
    try {
      const response = await leaderboardAPI.getLeaderboardByCode(testCode);
      const data = response.data?.data || response.data;
      const leaderboardData = data?.leaderboard || (Array.isArray(data) ? data : []);
      setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError('Failed to load leaderboard');
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setTestCode(inputCode.trim());
    }
  };

  const handleViewPaper = (entry) => {
    // Only allow teachers to view papers
    if (user?.role === 'teacher') {
      setSelectedStudent({
        name: entry.name || entry.userName || entry.userInfo?.name || 'Anonymous',
        userId: entry.userId,
        testCode: testCode
      });
      setShowPaperModal(true);
    }
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  return (
    <div className="container" style={{ maxWidth: 900, paddingTop: 30 }}>
      <h1 style={{ fontSize: 28, marginBottom: 30 }}>🏆 Leaderboard</h1>

      {/* Search Form */}
      <div className="card" style={{ marginBottom: 30 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder="Enter test code (e.g., ABC12345)"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            maxLength="8"
            style={{
              flex: 1,
              padding: '12px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#e2e8f0',
              fontSize: 14
            }}
          />
          <button 
            type="submit"
            className="btn btn-primary"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', marginBottom: 20 }}>
          <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>
        </div>
      )}

      {testCode && (
        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#94a3b8', fontSize: 16 }}>
                No submissions yet for test code: <strong>{testCode}</strong>
              </p>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: 20, marginBottom: 20 }}>
                Test Code: <span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{testCode}</span>
              </h2>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 500 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #334155' }}>
                      <th style={{ padding: 12, textAlign: 'center', width: 60 }}>Rank</th>
                      <th style={{ padding: 12, textAlign: 'left' }}>Student</th>
                      <th style={{ padding: 12, textAlign: 'center' }}>Score</th>
                      <th style={{ padding: 12, textAlign: 'center' }}>Percentage</th>
                      <th style={{ padding: 12, textAlign: 'center' }}>Time (min)</th>
                      {user?.role === 'teacher' && <th style={{ padding: 12, textAlign: 'center' }}>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, idx) => {
                      const rank = idx + 1;
                      const medal = getMedalEmoji(rank);
                      const isPass = entry.bestScore >= 70;
                      const textColor = entry.bestScore >= 80 ? '#10b981' : entry.bestScore >= 70 ? '#f59e0b' : '#ef4444';
                      
                      // Extract student name from entry or userInfo
                      const studentName = entry.name || entry.userName || entry.userInfo?.name || 'Anonymous';

                      return (
                        <tr key={entry.userId || idx} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: 12, textAlign: 'center', fontSize: 18 }}>
                            {medal}
                          </td>
                          <td style={{ padding: 12 }}>
                            <div style={{ fontWeight: 500 }}>{studentName}</div>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>
                              {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td style={{ padding: 12, textAlign: 'center' }}>
                            {entry.bestScore || 0}%
                          </td>
                          <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold', color: textColor }}>
                            {entry.bestScore || 0}%
                          </td>
                          <td style={{ padding: 12, textAlign: 'center', fontSize: 14 }}>
                            {entry.bestTime ? Math.floor(entry.bestTime / 60) : 0}
                          </td>
                          {user?.role === 'teacher' && (
                            <td style={{ padding: 12, textAlign: 'center' }}>
                              <button
                                onClick={() => handleViewPaper(entry)}
                                style={{
                                  padding: '6px 12px',
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: '#fff',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                📄 View Paper
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!testCode && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 15 }}>🏆</div>
          <p style={{ color: '#94a3b8', marginBottom: 0 }}>
            Enter a test code to view the leaderboard
          </p>
        </div>
      )}

      {/* Test Paper Modal */}
      {selectedStudent && (
        <TestPaperModal
          isOpen={showPaperModal}
          onClose={() => {
            setShowPaperModal(false);
            setSelectedStudent(null);
          }}
          studentName={selectedStudent.name}
          testCode={selectedStudent.testCode}
          userId={selectedStudent.userId}
        />
      )}
    </div>
  );
};

export default Leaderboard;