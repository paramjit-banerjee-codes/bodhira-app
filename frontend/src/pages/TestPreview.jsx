import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testAPI } from '../services/api';
import './TestPreview.css';

export default function TestPreview() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await testAPI.getTestPreview(testId);
        setTest(response.data?.data || response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching test preview:', err);
        setError(err.response?.data?.message || 'Failed to load test preview');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchPreview();
    }
  }, [testId]);

  const handleViewLeaderboard = () => {
    if (test?.testCode) {
      navigate(`/leaderboard?code=${test.testCode}`);
    }
  };

  const handleEditQuestion = (questionIndex) => {
    // TODO: Implement question editing
    alert(`Edit question ${questionIndex + 1} - Feature coming soon`);
  };

  const handleRegenerateQuestion = (questionIndex) => {
    // TODO: Implement question regeneration
    alert(`Regenerate question ${questionIndex + 1} - Feature coming soon`);
  };

  const handleRegenerateTest = () => {
    // TODO: Implement test regeneration
    alert('Regenerate entire test - Feature coming soon');
  };

  if (loading) {
    return (
      <div className="test-preview-container">
        <div className="loading">Loading test preview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="test-preview-container">
        <div className="error">Error: {error}</div>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="test-preview-container">
        <div className="error">Test not found</div>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="test-preview-container">
      <div className="preview-header">
        <h1>Test Preview</h1>
        <div className="test-metadata">
          <div className="meta-item">
            <strong>Test Code:</strong> {test.testCode}
          </div>
          <div className="meta-item">
            <strong>Topic:</strong> {test.topic}
          </div>
          <div className="meta-item">
            <strong>Difficulty:</strong> {test.difficulty}
          </div>
          <div className="meta-item">
            <strong>Duration:</strong> {test.duration} minutes
          </div>
          <div className="meta-item">
            <strong>Status:</strong>
            <span className={test.isPublished ? 'status-published' : 'status-draft'}>
              {test.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
      </div>

      <div className="preview-actions">
        <button
          onClick={() => window.history.back()}
          className="btn-secondary"
        >
          ← Back to Test Generation
        </button>
        <button
          onClick={handleRegenerateTest}
          className="btn-secondary"
        >
          Regenerate Test
        </button>
      </div>

      <div className="questions-section">
        <h2>Questions ({test.questions.length})</h2>
        {test.questions.map((question, index) => (
          <div key={index} className="question-card">
            <div className="question-header">
              <h3>Question {index + 1}</h3>
              <div className="question-actions">
                <button
                  onClick={() => handleEditQuestion(index)}
                  className="btn-small btn-edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRegenerateQuestion(index)}
                  className="btn-small btn-regenerate"
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div className="question-content">
              <p className="question-text">{question.question}</p>

              <div className="options">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`option ${
                      String(optIndex) === String(question.correctAnswer) ? 'correct-answer' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      disabled
                      checked={String(optIndex) === String(question.correctAnswer)}
                    />
                    <label>{option}</label>
                    {String(optIndex) === String(question.correctAnswer) && (
                      <span className="correct-badge">✓ Correct</span>
                    )}
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className="explanation">
                  <strong>Explanation:</strong> {question.explanation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
