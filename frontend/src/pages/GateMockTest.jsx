import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './TakeTest.css'; // Use the same CSS as TakeTest
import api from '../services/api';

/**
 * GateMockTest - Full Mock Exam Mode
 * 
 * This page ONLY starts when user clicks "Start Exam" from GateExamStart
 * Query params: ?exam=GATE-CSE&subject=DSA
 * 
 * Uses the SAME UI as TakeTest for consistency
 */
const GateMockTest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subject, setSubject] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [startTime] = useState(Date.now());

  // On mount, check if exam is selected via query params
  useEffect(() => {
    const selectedSubject = searchParams.get('subject');

    if (!selectedSubject) {
      setError('No exam selected. Please go back and select an exam from Exam Center.');
      setLoading(false);
      return;
    }

    setSubject(selectedSubject);
    
    // Now fetch the exam
    fetchFullExam(selectedSubject);
  }, [searchParams]);

  // Timer effect
  useEffect(() => {
    if (!timeRemaining) return;
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeRemaining]);

  /**
   * Fetch full exam (65 questions, 2 sections, 100 marks, 180 min)
   * ONLY called when exam is selected via query params
   */
  const fetchFullExam = async (selectedSubject) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📚 Fetching full mock exam for ${selectedSubject}...`);

      const response = await api.get(`/tests/gate/full-exam?subject=${selectedSubject}`);

      if (response.data.success && response.data.data) {
        const examData = response.data.data;
        console.log(
          `✅ Exam loaded: ${examData.totalQuestions} questions, ${examData.totalMarks} marks`
        );
        
        // Flatten questions for easier handling (like TakeTest)
        const allQuestions = [];
        examData.sections.forEach(section => {
          section.questions.forEach(q => {
            allQuestions.push(q);
          });
        });
        
        const examWithQuestions = {
          ...examData,
          questions: allQuestions
        };
        
        setExam(examWithQuestions);
        
        // Set timer (180 minutes)
        setTimeRemaining(examData.totalTimeMinutes * 60);
        
        // Initialize answers
        const initAnswers = {};
        allQuestions.forEach((_, idx) => {
          initAnswers[idx] = '';
        });
        setAnswers(initAnswers);
      } else {
        throw new Error(response.data.message || 'No exam data received');
      }
    } catch (err) {
      console.error('❌ Error fetching exam:', err.message);
      let msg = err.message;
      if (err.message.includes('Failed to fetch')) {
        msg = 'Server not responding. Is backend running on port 5000?';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle test submission - send answers to backend for grading
   */
  const handleSubmit = async () => {
    if (!exam) return;

    setShowConfirm(false);
    setSubmitting(true);

    try {
      console.log(`🎯 Submitting answers...`);

      const now = new Date();
      const userId = localStorage.getItem('userId');
      const timeSpent = Math.round((Date.now() - startTime) / 1000);

      // Format answers for GATE backend
      const answerArray = Object.entries(answers).map(([idx, answer]) => {
        const question = exam.questions[parseInt(idx)];
        let response;
        
        // Handle different answer formats
        if (question.type === 'MCQ') {
          response = question.options.indexOf(answer);
        } else if (question.type === 'MSQ') {
          response = Array.isArray(answer) ? answer : [];
        } else if (question.type === 'NAT') {
          response = answer;
        } else {
          response = answer;
        }

        return {
          qid: question.id,
          type: question.type,
          response
        };
      });

      const submissionPayload = {
        examId: exam.examId,
        subject: exam.subject,
        answers: answerArray,
        startedAt: new Date(now.getTime() - timeSpent * 1000).toISOString(),
        submittedAt: now.toISOString(),
        userId: userId
      };

      const response = await api.post('/tests/gate/submit', submissionPayload);
      const result = response.data;

      console.log('✅ Graded:', result.data);
      if (result.resultId) {
        console.log(`💾 Result saved with ID: ${result.resultId}`);
      }

      // Navigate to results
      navigate('/gate-results', { 
        state: { 
          result: result.data,
          resultId: result.resultId
        } 
      });
    } catch (err) {
      console.error('❌ Submit error:', err.message);
      alert(`Submit failed: ${err.message}`);
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (answer) => {
    setAnswers({ ...answers, [currentQuestionIdx]: answer });
  };

  const handleNext = () => {
    if (currentQuestionIdx < (exam?.questions?.length || 0) - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleJumpToQuestion = (idx) => {
    setCurrentQuestionIdx(idx);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isTimeWarning = timeRemaining && timeRemaining < 300; // < 5 minutes
  const isTimeCritical = timeRemaining && timeRemaining < 60; // < 1 minute

  // Loading state
  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <div className="loading-spinner"></div>
        <p style={{ color: '#ffffff', marginTop: '20px' }}>Generating full GATE exam...</p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          65 questions • 100 marks • 180 minutes
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    const isNoExamError = error.includes('No exam selected');
    
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>
            ❌ {isNoExamError ? 'No Exam Selected' : 'Error Loading Exam'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '24px' }}>{error}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {!isNoExamError && (
              <button 
                onClick={() => fetchFullExam(subject)} 
                className="btn-primary"
              >
                🔄 Retry
              </button>
            )}
            <button 
              onClick={() => navigate('/exam-center')} 
              className="btn-secondary"
            >
              ← Back to Exam Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render test using TakeTest UI structure
  if (exam && exam.questions) {
    const currentQuestion = exam.questions[currentQuestionIdx];
    const currentAnswer = answers[currentQuestionIdx];

    return (
      <div className="take-test-container">
        {/* Header with Timer */}
        <div className="test-header">
          <div className="test-info">
            <h1 className="test-title">{exam.name || 'GATE CSE Mock Exam'}</h1>
            <p className="test-meta">
              Question {currentQuestionIdx + 1} of {exam.questions.length} • {exam.totalMarks} Marks
            </p>
          </div>
          <div className={`timer ${isTimeCritical ? 'timer-critical' : isTimeWarning ? 'timer-warning' : ''}`}>
            <span className="timer-icon">⏱️</span>
            <span className="timer-text">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${((currentQuestionIdx + 1) / exam.questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Main Content */}
        <div className="test-content">
          {/* Question Card */}
          <div className="question-card">
            <div className="question-header">
              <span className="question-number">Question {currentQuestionIdx + 1}</span>
              <span className="question-marks">{currentQuestion.marks || 1} Mark{(currentQuestion.marks || 1) > 1 ? 's' : ''}</span>
            </div>
            
            <div className="question-text">
              {currentQuestion.question || currentQuestion.text}
            </div>

            {/* Options */}
            <div className="options-container">
              {(currentQuestion.options || []).map((option, idx) => (
                <div
                  key={idx}
                  className={`option ${currentAnswer === option ? 'option-selected' : ''}`}
                  onClick={() => handleAnswerChange(option)}
                >
                  <div className="option-radio">
                    {currentAnswer === option && <div className="option-radio-dot"></div>}
                  </div>
                  <span className="option-label">{String.fromCharCode(65 + idx)}.</span>
                  <span className="option-text">{option}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="question-navigator">
            <h3 className="navigator-title">Questions</h3>
            <div className="navigator-grid">
              {exam.questions.map((_, idx) => (
                <button
                  key={idx}
                  className={`navigator-btn ${idx === currentQuestionIdx ? 'navigator-btn-current' : ''} ${
                    answers[idx] ? 'navigator-btn-answered' : ''
                  }`}
                  onClick={() => handleJumpToQuestion(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="navigator-legend">
              <div className="legend-item">
                <div className="legend-box legend-box-current"></div>
                <span>Current</span>
              </div>
              <div className="legend-item">
                <div className="legend-box legend-box-answered"></div>
                <span>Answered</span>
              </div>
              <div className="legend-item">
                <div className="legend-box legend-box-unanswered"></div>
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="test-footer">
          <button
            className="btn-nav btn-prev"
            onClick={handlePrev}
            disabled={currentQuestionIdx === 0}
          >
            ← Previous
          </button>

          <div className="footer-center">
            <span className="answered-count">
              {Object.values(answers).filter(a => a).length} / {exam.questions.length} Answered
            </span>
          </div>

          {currentQuestionIdx < exam.questions.length - 1 ? (
            <button
              className="btn-nav btn-next"
              onClick={handleNext}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn-submit"
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : '✓ Submit Exam'}
            </button>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Submit Exam?</h2>
              <p>
                You have answered {Object.values(answers).filter(a => a).length} out of{' '}
                {exam.questions.length} questions.
              </p>
              <p style={{ color: '#f59e0b', marginTop: '16px' }}>
                ⚠️ You cannot change your answers after submission.
              </p>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Confirm Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default GateMockTest;
