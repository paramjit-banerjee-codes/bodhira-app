import { useState, useEffect } from 'react';
import { testAPI } from '../services/api';
import toast from '../utils/toast';
import './TestInsightsModal.css';

export default function TestInsightsModal({ isOpen, onClose, testId, testTopic }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (isOpen && testId) {
      fetchAnalytics();
    }
  }, [isOpen, testId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching analytics for test:', testId);
      
      const response = await testAPI.getTestAnalytics(testId);
      console.log('✅ Analytics received:', response.data);
      
      setAnalytics(response.data?.data || response.data);
    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load analytics';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tim-overlay" onClick={onClose}>
      <div className="tim-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tim-header">
          <div className="tim-title-section">
            <h2 className="tim-title">📊 Test Insights</h2>
            <p className="tim-subtitle">{testTopic || 'Question-wise Analytics'}</p>
          </div>
          <button
            className="tim-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="tim-body">
          {loading ? (
            <div className="tim-loading">
              <div className="tim-spinner"></div>
              <p>Loading insights...</p>
            </div>
          ) : error ? (
            <div className="tim-error">
              <p>{error}</p>
              <button onClick={fetchAnalytics} className="tim-retry-btn">
                Try Again
              </button>
            </div>
          ) : !analytics ? (
            <div className="tim-empty">
              <p>No analytics available yet</p>
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="tim-stats">
                <div className="tim-stat-item">
                  <div className="tim-stat-label">Total Students</div>
                  <div className="tim-stat-value">{analytics.totalStudents || 0}</div>
                </div>
                <div className="tim-stat-item">
                  <div className="tim-stat-label">Questions</div>
                  <div className="tim-stat-value">{analytics.totalQuestions}</div>
                </div>
              </div>

              {/* Questions List */}
              <div className="tim-questions">
                {(!analytics.questions || analytics.questions.length === 0) ? (
                  <div className="tim-no-data">No question data available</div>
                ) : (
                  analytics.questions.map((q, idx) => (
                    <div key={q.questionIndex || idx} className="tim-question-card">
                      {/* Question Header */}
                      <div className="tim-q-header">
                        <div className="tim-q-num">Q{q.questionIndex + 1}</div>
                        <div className="tim-q-text">{q.text}</div>
                      </div>

                      {/* Stats Row */}
                      <div className="tim-q-stats">
                        {/* Right Count */}
                        <div className="tim-stat-box tim-right">
                          <div className="tim-stat-icon">✓</div>
                          <div className="tim-stat-content">
                            <div className="tim-stat-label">Correct</div>
                            <div className="tim-stat-num">{q.rightCount}</div>
                          </div>
                        </div>

                        {/* Wrong Count */}
                        <div className="tim-stat-box tim-wrong">
                          <div className="tim-stat-icon">✕</div>
                          <div className="tim-stat-content">
                            <div className="tim-stat-label">Wrong</div>
                            <div className="tim-stat-num">{q.wrongCount}</div>
                          </div>
                        </div>

                        {/* Accuracy */}
                        <div className="tim-stat-box tim-accuracy">
                          <div className="tim-stat-icon">📊</div>
                          <div className="tim-stat-content">
                            <div className="tim-stat-label">Accuracy</div>
                            <div className="tim-stat-num">{q.accuracy}%</div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="tim-progress-bar">
                        <div
                          className="tim-progress-fill"
                          style={{
                            width: `${q.accuracy}%`,
                            backgroundColor: q.accuracy >= 70 ? '#10b981' : q.accuracy >= 40 ? '#f59e0b' : '#ef4444',
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
