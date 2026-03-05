import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GateHistory.css';

const GateHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Get userId from localStorage (set during login)
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      setError('Please login to view exam history');
      setLoading(false);
      return;
    }

    fetchHistory();
  }, [userId, selectedSubject]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = selectedSubject === 'All'
        ? `/api/tests/gate/history?userId=${userId}&limit=20`
        : `/api/tests/gate/history?userId=${userId}&subject=${selectedSubject}&limit=20`;

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch history');
      }

      setHistory(result.data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err.message || 'Failed to load exam history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (resultId) => {
    // Navigate to results page with resultId as query param
    navigate(`/gate-results?resultId=${resultId}`);
  };

  const handleRetakeExam = () => {
    navigate('/exam-center');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const subjects = ['All', 'DSA', 'Database', 'Aptitude', 'General'];

  return (
    <div className="gate-history-container">
      <div className="gate-history-header">
        <h1>📚 GATE Exam History</h1>
        <p>Review your past exam attempts and performance</p>
      </div>

      <div className="gate-history-controls">
        <div className="subject-filter">
          <label>Filter by Subject:</label>
          <div className="subject-buttons">
            {subjects.map(subject => (
              <button
                key={subject}
                className={`subject-btn ${selectedSubject === subject ? 'active' : ''}`}
                onClick={() => setSelectedSubject(subject)}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <button className="retake-btn" onClick={handleRetakeExam}>
          ➕ Take New Exam
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading exam history...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-message">⚠️ {error}</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {history.length === 0 ? (
            <div className="no-history-container">
              <div className="no-history-content">
                <p className="no-history-icon">📝</p>
                <h2>No Exam Attempts Yet</h2>
                <p>Start your first GATE mock exam to build your performance history.</p>
                <button className="start-exam-btn" onClick={handleRetakeExam}>
                  Start Your First Exam
                </button>
              </div>
            </div>
          ) : (
            <div className="history-list">
              <div className="history-stats">
                <p>Total Attempts: <strong>{history.length}</strong></p>
                {history.length > 0 && (
                  <>
                    <p>Average Score: <strong>{(history.reduce((sum, h) => sum + h.percentage, 0) / history.length).toFixed(1)}%</strong></p>
                    <p>Best Score: <strong>{Math.max(...history.map(h => h.percentage)).toFixed(1)}%</strong></p>
                  </>
                )}
              </div>

              {history.map((attempt, index) => (
                <div key={attempt.resultId} className="history-card">
                  <div className="history-card-header">
                    <div className="attempt-number">Attempt #{history.length - index}</div>
                    <div className="subject-badge">{attempt.subject}</div>
                  </div>

                  <div className="history-card-content">
                    <div className="score-section">
                      <div className="score-display">
                        <div className="score-circle" style={{ borderColor: getScoreColor(attempt.percentage) }}>
                          <div className="score-value" style={{ color: getScoreColor(attempt.percentage) }}>
                            {attempt.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="score-details">
                        <div className="detail-row">
                          <span className="detail-label">Score:</span>
                          <span className="detail-value">{attempt.totalScore.toFixed(2)} / {attempt.totalMarks}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Negative:</span>
                          <span className="detail-value">-{attempt.totalNegativeMarks.toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Time Taken:</span>
                          <span className="detail-value">{formatTime(attempt.timeTakenSeconds)}</span>
                        </div>
                      </div>
                    </div>

                    {attempt.weakTopics && attempt.weakTopics.length > 0 && (
                      <div className="weak-topics">
                        <h4>Top Weak Areas:</h4>
                        <ul>
                          {attempt.weakTopics.slice(0, 3).map((topic, idx) => (
                            <li key={idx}>
                              {topic.topic} - {topic.accuracy.toFixed(1)}% accuracy
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="history-card-footer">
                    <span className="submission-date">
                      📅 {formatDate(attempt.submittedAt)}
                    </span>
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(attempt.resultId)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GateHistory;
