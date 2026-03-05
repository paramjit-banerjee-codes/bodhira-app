import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leaderboardAPI } from '../services/api';
import { 
  Trophy, Search, Medal, Crown, Clock, FileText, 
  Target, Users, TrendingUp, Loader2
} from 'lucide-react';
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
      setTestCode(inputCode.trim().toUpperCase());
    }
  };

  const handleViewPaper = (entry) => {
    if (user?.role === 'teacher') {
      setSelectedStudent({
        name: entry.name || entry.userName || entry.userInfo?.name || 'Anonymous',
        userId: entry.userId,
        testCode: testCode
      });
      setShowPaperModal(true);
    }
  };

  // Calculate stats
  const stats = leaderboard.length > 0 ? {
    totalParticipants: leaderboard.length,
    averageScore: Math.round(leaderboard.reduce((sum, e) => sum + (e.bestScore || 0), 0) / leaderboard.length),
    highestScore: Math.max(...leaderboard.map(e => e.bestScore || 0))
  } : null;

  const topThree = leaderboard.slice(0, 3);
  const remainingRankings = leaderboard.slice(3);

  const getRankColor = (rank) => {
    if (rank === 1) return { primary: '#FCD34D', secondary: '#F59E0B', glow: 'rgba(251, 191, 36, 0.4)' };
    if (rank === 2) return { primary: '#D1D5DB', secondary: '#9CA3AF', glow: 'rgba(156, 163, 175, 0.4)' };
    if (rank === 3) return { primary: '#FDBA74', secondary: '#F97316', glow: 'rgba(251, 146, 60, 0.4)' };
    return { primary: '#3F3F46', secondary: '#27272A', glow: 'rgba(63, 63, 70, 0.4)' };
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="leaderboard-premium-page">
      {/* Page Header */}
      <div className="leaderboard-header">
        <div className="header-left">
          <Trophy size={32} className="trophy-icon" />
          <h1 className="page-title">Leaderboard</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Enter test code (e.g., ABC123)"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            maxLength={8}
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? <Loader2 size={20} className="spin" /> : 'SEARCH'}
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && testCode && (
        <div className="loading-container">
          <Loader2 size={48} className="spin loading-icon" />
          <p>Loading leaderboard...</p>
        </div>
      )}

      {/* Stats Banner */}
      {!loading && stats && (
        <div className="stats-banner">
          <div className="stat-item">
            <Users size={24} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{stats.totalParticipants}</div>
              <div className="stat-label">Total Participants</div>
            </div>
          </div>
          <div className="stat-item">
            <Target size={24} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{stats.averageScore}%</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>
          <div className="stat-item">
            <TrendingUp size={24} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{stats.highestScore}%</div>
              <div className="stat-label">Highest Score</div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {!loading && topThree.length > 0 && (
        <div className="podium-section">
          <div className="test-code-display">
            <span className="test-code-label">Test Code:</span>
            <span className="test-code-value">{testCode}</span>
          </div>

          <div className="podium-container">
            {/* Rank 2 (Left) */}
            {topThree[1] && (
              <div className="podium-card rank-2" style={{ animationDelay: '0.1s' }}>
                <div className="rank-badge" style={{ 
                  background: `linear-gradient(135deg, ${getRankColor(2).primary}, ${getRankColor(2).secondary})`
                }}>
                  <Medal size={24} />
                </div>
                <div className="podium-content">
                  <div className="avatar-container">
                    <div className="avatar" style={{ borderColor: getRankColor(2).primary }}>
                      {(topThree[1].name || topThree[1].userName || 'A').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <h3 className="student-name">{topThree[1].name || topThree[1].userName || 'Anonymous'}</h3>
                  <div className="score-display" style={{ 
                    background: `linear-gradient(135deg, ${getRankColor(2).primary}, ${getRankColor(2).secondary})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {topThree[1].bestScore || 0}%
                  </div>
                  <div className="time-taken">
                    <Clock size={14} />
                    <span>{topThree[1].bestTime ? Math.floor(topThree[1].bestTime / 60) : 0} min</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 (Center) */}
            {topThree[0] && (
              <div className="podium-card rank-1" style={{ animationDelay: '0s' }}>
                <div className="rank-badge" style={{ 
                  background: `linear-gradient(135deg, ${getRankColor(1).primary}, ${getRankColor(1).secondary})`
                }}>
                  <Crown size={28} />
                </div>
                <div className="podium-content">
                  <div className="avatar-container">
                    <div className="avatar avatar-large" style={{ borderColor: getRankColor(1).primary }}>
                      {(topThree[0].name || topThree[0].userName || 'A').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <h3 className="student-name student-name-large">{topThree[0].name || topThree[0].userName || 'Anonymous'}</h3>
                  <div className="score-display score-display-large" style={{ 
                    background: `linear-gradient(135deg, ${getRankColor(1).primary}, ${getRankColor(1).secondary})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {topThree[0].bestScore || 0}%
                  </div>
                  <div className="time-taken">
                    <Clock size={14} />
                    <span>{topThree[0].bestTime ? Math.floor(topThree[0].bestTime / 60) : 0} min</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 (Right) */}
            {topThree[2] && (
              <div className="podium-card rank-3" style={{ animationDelay: '0.2s' }}>
                <div className="rank-badge" style={{ 
                  background: `linear-gradient(135deg, ${getRankColor(3).primary}, ${getRankColor(3).secondary})`
                }}>
                  <Medal size={24} />
                </div>
                <div className="podium-content">
                  <div className="avatar-container">
                    <div className="avatar" style={{ borderColor: getRankColor(3).primary }}>
                      {(topThree[2].name || topThree[2].userName || 'A').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <h3 className="student-name">{topThree[2].name || topThree[2].userName || 'Anonymous'}</h3>
                  <div className="score-display" style={{ 
                    background: `linear-gradient(135deg, ${getRankColor(3).primary}, ${getRankColor(3).secondary})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {topThree[2].bestScore || 0}%
                  </div>
                  <div className="time-taken">
                    <Clock size={14} />
                    <span>{topThree[2].bestTime ? Math.floor(topThree[2].bestTime / 60) : 0} min</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remaining Rankings Table */}
      {!loading && remainingRankings.length > 0 && (
        <div className="rankings-table">
          <div className="table-header">
            <div>Rank</div>
            <div>Student</div>
            <div>Score</div>
            <div>Percentage</div>
            <div>Time (min)</div>
            {user?.role === 'teacher' && <div>Action</div>}
          </div>
          <div className="table-body">
            {remainingRankings.map((entry, idx) => {
              const rank = idx + 4;
              const studentName = entry.name || entry.userName || entry.userInfo?.name || 'Anonymous';
              
              return (
                <div key={entry.userId || idx} className="table-row" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="rank-cell">
                    <span className="rank-number">{rank}</span>
                  </div>
                  <div className="student-cell">
                    <div className="student-avatar">
                      {studentName.charAt(0).toUpperCase()}
                    </div>
                    <div className="student-info">
                      <div className="student-name-table">{studentName}</div>
                      <div className="student-date">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="score-cell">
                    {entry.bestScore || 0}%
                  </div>
                  <div className="percentage-cell">
                    <span style={{ color: getScoreColor(entry.bestScore || 0) }}>
                      {entry.bestScore || 0}%
                    </span>
                  </div>
                  <div className="time-cell">
                    {entry.bestTime ? Math.floor(entry.bestTime / 60) : 0} min
                  </div>
                  {user?.role === 'teacher' && (
                    <div className="action-cell">
                      <button onClick={() => handleViewPaper(entry)} className="view-paper-button">
                        <FileText size={16} />
                        <span>View Paper</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State (No search yet) */}
      {!testCode && !loading && (
        <div className="empty-state">
          <Trophy size={80} className="empty-state-icon" />
          <h2 className="empty-state-title">Enter a test code to view the leaderboard</h2>
          <p className="empty-state-subtitle">Search for a test using its unique code</p>
        </div>
      )}

      {/* No Results State */}
      {testCode && !loading && leaderboard.length === 0 && (
        <div className="empty-state">
          <Search size={64} className="empty-state-icon" />
          <h2 className="empty-state-title">No results found</h2>
          <p className="empty-state-subtitle">Please check the test code and try again</p>
          <button onClick={() => { setTestCode(''); setInputCode(''); }} className="try-again-button">
            Try Again
          </button>
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