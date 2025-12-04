import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testAPI } from '../services/api';
import './TakeTest.css';

const TakeTest = () => {
  const { testId, testCode } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchTest();
  }, [testId, testCode]);

  useEffect(() => {
    if (!timeRemaining) return;
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeRemaining]);

  const fetchTest = async () => {
    try {
      let response;
      if (testCode) {
        console.log('🔍 Fetching test by code:', testCode);
        response = await testAPI.getTestByCode(testCode);
      } else {
        console.log('🔍 Fetching test by ID:', testId);
        response = await testAPI.getTest(testId);
      }

      console.log('📋 Test response:', response.data);
      const testData = response.data?.data || response.data;
      
      if (!testData) {
        console.error('❌ No test data received');
        alert('No test data received from server');
        return;
      }

      setTest(testData);

      // Initialize time: 1.5 minutes per question
      const timeInMinutes = (testData.questions?.length || 0) * 1.5;
      setTimeRemaining(Math.round(timeInMinutes * 60));

      // Initialize answers
      const initAnswers = {};
      (testData.questions || []).forEach((_, idx) => {
        initAnswers[idx] = '';
      });
      setAnswers(initAnswers);
    } catch (error) {
      console.error('❌ Error fetching test:', error);
      const status = error.response?.status;
      let errorMessage = error.response?.data?.error || error.message || 'Failed to load test';
      
      // Handle expired test (410 status)
      if (status === 410) {
        errorMessage = '⏰ This test has expired and is no longer available for taking.';
      }
      
      alert(`Failed to load test: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (answer) => {
    setAnswers({ ...answers, [currentQuestionIdx]: answer });
  };

  const handleNext = () => {
    if (currentQuestionIdx < (test?.questions?.length || 0) - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleSubmit = async () => {
    if (!test) return;

    setSubmitting(true);
    try {
      // Format answers with question index and selected answer
      const formattedAnswers = Object.entries(answers).map(([idx, answer]) => {
        const optionIndex = (test.questions[idx].options || []).indexOf(answer);
        return {
          questionIndex: parseInt(idx),
          selectedAnswer: optionIndex >= 0 ? optionIndex : -1
        };
      });

      const submissionData = {
        testId: test._id || test.testId,
        answers: formattedAnswers,
        timeTaken: Math.round((Date.now() - startTime) / 1000) // Time in seconds
      };

      const response = await testAPI.submitTest(submissionData.testId, submissionData);
      const result = response.data?.data || response.data;

      if (result && result.resultId) {
        // Navigate to results page
        navigate(`/results/${result.resultId}`);
      } else {
        alert('Test submitted but result ID not received');
      }
    } catch (error) {
      console.error('Error submitting test:', error.response?.data || error.message);
      alert('Failed to submit test: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isTimeWarning = timeRemaining && timeRemaining < 300; // < 5 minutes
  const isTimeCritical = timeRemaining && timeRemaining < 60; // < 1 minute

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <p>Test not found or has no questions</p>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIdx];
  const answeredCount = Object.values(answers).filter(a => a !== '').length;
  const totalQuestions = test.questions.length;

  return (
    <div className="test-container">
      {/* Header */}
      <div className="test-header">
        <div>
          <h1>{test.title}</h1>
          <p style={{ color: '#cbd5e1', marginBottom: 0, fontSize: 15 }}>📚 {test.topic}</p>
        </div>
        <div className="test-stats">
          <div>
            <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ANSWERED</p>
            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>
              {answeredCount}/{totalQuestions}
            </p>
          </div>
          <div>
            <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>TIME</p>
            <p style={{ 
              fontSize: 24, 
              fontWeight: 'bold',
              color: isTimeCritical ? '#ef4444' : isTimeWarning ? '#f59e0b' : '#10b981',
              animation: isTimeCritical ? 'pulse 1s ease-in-out infinite' : 'none'
            }}>
              {formatTime(timeRemaining || 0)}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      <div className="test-body">
        {/* Question Panel */}
        <div className="question-panel">
          {/* Question Display */}
          <div className="question-card">
            <div style={{ marginBottom: 25 }}>
              <span style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}>
                Question {currentQuestionIdx + 1} of {totalQuestions}
              </span>
            </div>
            
            <h2 style={{ fontSize: 20, marginBottom: 28, lineHeight: 1.8, color: '#f1f5f9' }}>
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {(currentQuestion.options || []).map((option, idx) => (
                <label 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 18px',
                    border: answers[currentQuestionIdx] === option ? '2px solid #10b981' : '2px solid #334155',
                    borderRadius: 10,
                    cursor: 'pointer',
                    backgroundColor: answers[currentQuestionIdx] === option ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    color: answers[currentQuestionIdx] === option ? '#d1fae5' : '#cbd5e1',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIdx}`}
                    value={option}
                    checked={answers[currentQuestionIdx] === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    style={{ marginRight: 14, cursor: 'pointer', width: 20, height: 20, accentColor: '#10b981' }}
                  />
                  <span style={{ fontSize: 15, fontWeight: '500' }}>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button 
              onClick={handlePrev}
              disabled={currentQuestionIdx === 0}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              ← Previous
            </button>
            {currentQuestionIdx === totalQuestions - 1 ? (
              <button 
                onClick={() => setShowConfirm(true)}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                ✓ Submit Test
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="question-nav">
          <h3>📋 Questions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {test.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIdx(idx)}
                title={`Question ${idx + 1}${answers[idx] ? ' (answered)' : ''}`}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: idx === currentQuestionIdx ? '2px solid #10b981' : '2px solid #334155',
                  backgroundColor: 
                    idx === currentQuestionIdx ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                    answers[idx] ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
                    'linear-gradient(135deg, #1a1f2e 0%, #0f172a 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  transform: idx === currentQuestionIdx ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: idx === currentQuestionIdx ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Submit Test?</h2>
            <p style={{ color: '#94a3b8', marginBottom: 20 }}>
              You have answered {answeredCount} out of {totalQuestions} questions.
              <br />This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setShowConfirm(false)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {submitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeTest;