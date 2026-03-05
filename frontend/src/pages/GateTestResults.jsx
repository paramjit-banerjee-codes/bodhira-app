import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './GateTestResults.css';

/**
 * GateTestResults - Display detailed exam grading
 * 
 * Can be used in two ways:
 * 1. From GateTestScreen: Gets result from location.state?.result
 * 2. From GateHistory: Gets resultId from URL query and fetches from server
 * 
 * Shows:
 * - Total score and percentage
 * - Section-wise breakdown
 * - Negative marks incurred
 * - Per-question status (correct/incorrect/unattempted)
 * - Weak topics for improvement
 * - Performance analysis
 */
const GateTestResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resultIdParam = searchParams.get('resultId');

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch result from server if resultId is provided
  useEffect(() => {
    if (resultIdParam && !result) {
      fetchResultFromServer();
    }
  }, [resultIdParam]);

  const fetchResultFromServer = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tests/gate/history/${resultIdParam}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch result');
      }

      setResult(data.data);
    } catch (err) {
      console.error('Error fetching result:', err);
      setError(err.message || 'Failed to load exam result');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="results-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading exam results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-container">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/gate-history')}>
            Back to History
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-container">
        <div className="error-message">
          <h2>No Results Found</h2>
          <p>Please take a test first.</p>
          <button onClick={() => navigate('/exam-center')}>
            Back to Exam Center
          </button>
        </div>
      </div>
    );
  }

  const {
    totalScore,
    totalMarks,
    percentage,
    totalNegativeMarks,
    sections,
    perQuestion,
    weakTopics
  } = result;

  // Color coding for score
  const getScoreColor = (pct) => {
    if (pct >= 80) return '#27ae60'; // green
    if (pct >= 60) return '#f39c12'; // orange
    return '#e74c3c'; // red
  };

  // Count question statuses
  const statuses = {
    correct: perQuestion.filter(q => q.status === 'correct').length,
    incorrect: perQuestion.filter(q => q.status === 'incorrect').length,
    unattempted: perQuestion.filter(q => q.status === 'unattempted').length
  };

  return (
    <div className="results-container">
      {/* Header */}
      <div className="results-header">
        <h1>📊 Exam Results</h1>
        <p className="results-subtitle">Detailed performance analysis</p>
      </div>

      {/* Main score card */}
      <div className="score-card">
        <div className="score-main">
          <div className="score-circle" style={{ borderColor: getScoreColor(percentage) }}>
            <div className="score-number">{totalScore.toFixed(2)}</div>
            <div className="score-total">/ {totalMarks}</div>
          </div>
        </div>

        <div className="score-details">
          <div className="percentage">
            <span className="label">Percentage:</span>
            <span
              className="value"
              style={{ color: getScoreColor(percentage) }}
            >
              {percentage.toFixed(2)}%
            </span>
          </div>

          {totalNegativeMarks > 0 && (
            <div className="negative-marks">
              <span className="label">Negative Marks:</span>
              <span className="value" style={{ color: '#e74c3c' }}>
                −{totalNegativeMarks.toFixed(2)}
              </span>
            </div>
          )}

          <div className="performance-badge">
            {percentage >= 80 && '🏆 Excellent'}
            {percentage >= 60 && percentage < 80 && '👍 Good'}
            {percentage >= 40 && percentage < 60 && '📚 Average'}
            {percentage < 40 && '💪 Need Improvement'}
          </div>
        </div>
      </div>

      {/* Section breakdown */}
      <div className="sections-breakdown">
        <h2>Section-wise Performance</h2>
        <div className="sections-grid">
          {Object.entries(sections).map(([sectionId, data]) => (
            <div key={sectionId} className="section-card">
              <div className="section-label">
                Section {sectionId}
              </div>
              <div className="section-score">
                {data.score.toFixed(2)} / {data.maxMarks}
              </div>
              <div className="section-meta">
                {data.totalQuestions} questions
              </div>
              <div className="section-pct">
                {((data.score / data.maxMarks) * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question statistics */}
      <div className="statistics">
        <h2>Question Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item correct">
            <div className="stat-number">{statuses.correct}</div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="stat-item incorrect">
            <div className="stat-number">{statuses.incorrect}</div>
            <div className="stat-label">Incorrect</div>
          </div>
          <div className="stat-item unattempted">
            <div className="stat-number">{statuses.unattempted}</div>
            <div className="stat-label">Unattempted</div>
          </div>
        </div>
      </div>

      {/* Weak topics */}
      {weakTopics && weakTopics.length > 0 && (
        <div className="weak-topics">
          <h2>Areas for Improvement</h2>
          <div className="topics-list">
            {weakTopics.map((topic, idx) => (
              <div key={idx} className="topic-item">
                <div className="topic-name">{topic.topic}</div>
                <div className="topic-stats">
                  <span className="missed">
                    Missed: {topic.missedMarks.toFixed(2)} / {topic.totalMarks} marks
                  </span>
                  <span className="accuracy">
                    Accuracy: {topic.accuracy}%
                  </span>
                </div>
                <div className="topic-bar">
                  <div
                    className="topic-bar-fill"
                    style={{
                      width: `${topic.accuracy}%`,
                      backgroundColor:
                        topic.accuracy >= 80
                          ? '#27ae60'
                          : topic.accuracy >= 60
                          ? '#f39c12'
                          : '#e74c3c'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-question review */}
      <div className="per-question-review">
        <h2>Question-wise Review</h2>
        <div className="questions-table">
          <div className="table-header">
            <span className="col-qno">Q#</span>
            <span className="col-section">Sec</span>
            <span className="col-type">Type</span>
            <span className="col-marks">Marks</span>
            <span className="col-status">Status</span>
            <span className="col-awarded">Awarded</span>
            <span className="col-topic">Topic</span>
          </div>
          <div className="table-body">
            {perQuestion.map((q, idx) => (
              <div key={idx} className={`table-row ${q.status}`}>
                <span className="col-qno">{q.qno}</span>
                <span className="col-section">{q.sectionId}</span>
                <span className="col-type">{q.type}</span>
                <span className="col-marks">{q.marks}</span>
                <span className="col-status">
                  {q.status === 'correct' && '✓ Correct'}
                  {q.status === 'incorrect' && '✗ Incorrect'}
                  {q.status === 'unattempted' && '– Unattempted'}
                </span>
                <span className="col-awarded">
                  {q.awardedMarks >= 0 ? '+' : ''}
                  {q.awardedMarks.toFixed(2)}
                </span>
                <span className="col-topic">{q.topic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button onClick={() => navigate('/exam-center')} className="btn-retake">
          🔄 Take Another Exam
        </button>
        {resultIdParam ? (
          <button onClick={() => navigate('/gate-history')} className="btn-home">
            📚 Back to History
          </button>
        ) : (
          <button onClick={() => navigate('/')} className="btn-home">
            🏠 Home
          </button>
        )}
      </div>
    </div>
  );
};

export default GateTestResults;
