import { useState, useEffect } from 'react';
import GateQuestionCard from './GateQuestionCard';
import GateQuestionNavigator from './GateQuestionNavigator';
import './GateTestScreen.css';

/**
 * GateTestScreen - Full exam interface
 * 
 * Handles:
 * - 65 questions across 2 sections (A: GA, B: Subject)
 * - Question types: MCQ, MSQ, NAT
 * - 180-minute timer with auto-submit
 * - Question navigation and answer tracking
 * - Submission with confirmation
 */
const GateTestScreen = ({ exam, onTestComplete }) => {
  // Flatten all questions for easy indexing, but track section info
  const allQuestions = [];
  const sectionMap = {}; // qid -> section

  exam.sections.forEach(section => {
    section.questions.forEach(q => {
      allQuestions.push(q);
      sectionMap[q.id] = section.id;
    });
  });

  // State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { qid: response, ... }
  const [timeRemaining, setTimeRemaining] = useState(exam.totalTimeMinutes * 60);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeRemaining]);

  // Current question
  const currentQuestion = allQuestions[currentQuestionIdx];
  const currentResponse = answers[currentQuestion?.id];

  /**
   * Record answer based on question type
   * MCQ: single number (0-3)
   * MSQ: array of numbers
   * NAT: numeric value
   */
  const handleAnswerSelect = (response) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: response
    }));
  };

  // Navigation
  const handlePrevious = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < allQuestions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handleJumpToQuestion = (idx) => {
    setCurrentQuestionIdx(idx);
  };

  // Submit exam
  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);

    // Convert answers object to array format for backend
    const answerArray = Object.entries(answers).map(([qid, response]) => ({
      qid,
      type: allQuestions.find(q => q.id === qid)?.type,
      response
    }));

    const timeSpent = exam.totalTimeMinutes * 60 - timeRemaining;

    try {
      await onTestComplete(answerArray, timeSpent);
    } catch (err) {
      setSubmitting(false);
      console.error('Submit error:', err);
    }
  };

  // Format time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Count answered, unanswered
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = allQuestions.length - answeredCount;

  return (
    <div className="gate-test-screen">
      {/* Header with timer and info */}
      <div className="test-header">
        <div className="header-left">
          <h2>GATE {exam.subject} Exam</h2>
          <span className="exam-info">
            Q{currentQuestionIdx + 1}/{allQuestions.length} • {exam.totalMarks} marks
          </span>
        </div>
        <div className="header-right">
          <div className={`timer ${timeRemaining < 300 ? 'danger' : ''}`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
          <div className="answered-count">
            ✓ {answeredCount}/{allQuestions.length}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="test-content">
        {/* Sidebar navigator */}
        <GateQuestionNavigator
          sections={exam.sections}
          allQuestions={allQuestions}
          currentQuestionIdx={currentQuestionIdx}
          answers={answers}
          onJumpToQuestion={handleJumpToQuestion}
        />

        {/* Question display */}
        <div className="question-display">
          {/* Section header */}
          <div className="section-header">
            <strong>Section {sectionMap[currentQuestion.id]}</strong>
            {sectionMap[currentQuestion.id] === 'A' && (
              <span className="section-name">General Aptitude</span>
            )}
            {sectionMap[currentQuestion.id] === 'B' && (
              <span className="section-name">{exam.subject}</span>
            )}
          </div>

          {/* Question card */}
          <GateQuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIdx + 1}
            selectedAnswer={currentResponse}
            onAnswerSelect={handleAnswerSelect}
          />

          {/* Navigation buttons */}
          <div className="question-nav-buttons">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIdx === 0}
              className="nav-btn prev-btn"
            >
              ← Previous
            </button>

            <div className="spacer"></div>

            <button
              onClick={handleNext}
              disabled={currentQuestionIdx === allQuestions.length - 1}
              className="nav-btn next-btn"
            >
              Next →
            </button>
          </div>

          {/* Submit button */}
          <div className="submit-section">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              className="submit-btn"
            >
              {submitting ? '⏳ Submitting...' : '📤 Submit Exam'}
            </button>
            <p className="answered-info">
              {answeredCount} answered, {unansweredCount} unanswered
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Submit Exam?</h3>
            <p>
              You have answered {answeredCount} out of {allQuestions.length} questions.
            </p>
            <p style={{ color: '#666', fontSize: '0.9em' }}>
              You {unansweredCount > 0 ? `still have ${unansweredCount} unanswered questions. Y` : 'Y'}
              ou cannot change your answers after submission.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn-confirm"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GateTestScreen;
