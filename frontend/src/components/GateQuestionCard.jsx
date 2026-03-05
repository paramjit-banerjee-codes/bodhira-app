import React from 'react';
import './GateQuestionCard.css';

/**
 * GateQuestionCard - Display question with type-specific input
 * 
 * Supports:
 * - MCQ: Single select radio buttons
 * - MSQ: Multi-select checkboxes
 * - NAT: Numeric input field with decimal support
 * 
 * Props:
 *   - question: { id, qno, type, marks, topic, difficulty, question, options?, answer? }
 *   - questionNumber: Display number (1-65)
 *   - selectedAnswer: Current response value
 *   - onAnswerSelect: Callback with response
 */
const GateQuestionCard = ({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerSelect
}) => {
  const {
    type,
    marks,
    topic,
    difficulty,
    question: questionText,
    options
  } = question;

  return (
    <div className="question-card">
      {/* Header */}
      <div className="question-header">
        <div className="question-number">Q{questionNumber}</div>
        <div className="question-metadata">
          <span className="badge marks-badge">
            {marks} mark{marks > 1 ? 's' : ''}
          </span>
          <span className="badge type-badge">
            {type}
          </span>
          <span className="badge topic-badge">
            {topic}
          </span>
          <span className={`badge difficulty-${difficulty.toLowerCase()}`}>
            {difficulty}
          </span>
        </div>
      </div>

      {/* Question text */}
      <div className="question-text">
        {questionText}
      </div>

      {/* Input based on type */}
      <div className="question-input">
        {type === 'MCQ' && (
          <MCQInput
            options={options}
            selectedAnswer={selectedAnswer}
            onAnswerSelect={onAnswerSelect}
          />
        )}

        {type === 'MSQ' && (
          <MSQInput
            options={options}
            selectedAnswers={selectedAnswer || []}
            onAnswerSelect={onAnswerSelect}
          />
        )}

        {type === 'NAT' && (
          <NATInput
            selectedAnswer={selectedAnswer}
            onAnswerSelect={onAnswerSelect}
          />
        )}
      </div>

      {/* Answer indicator */}
      <div className="answer-indicator">
        {selectedAnswer !== undefined && selectedAnswer !== null && selectedAnswer !== '' ? (
          <span className="answered">✓ Answered</span>
        ) : (
          <span className="not-answered">⚠️ Not answered</span>
        )}
      </div>
    </div>
  );
};

/**
 * MCQ Input - Single select
 */
function MCQInput({ options, selectedAnswer, onAnswerSelect }) {
  return (
    <div className="mcq-input">
      {options.map((option, idx) => (
        <label key={idx} className={`option ${selectedAnswer === idx ? 'selected' : ''}`}>
          <input
            type="radio"
            name="mcq"
            value={idx}
            checked={selectedAnswer === idx}
            onChange={() => onAnswerSelect(idx)}
          />
          <span className="option-label">{String.fromCharCode(65 + idx)}</span>
          <span className="option-text">{option}</span>
        </label>
      ))}
    </div>
  );
}

/**
 * MSQ Input - Multi-select checkboxes
 */
function MSQInput({ options, selectedAnswers, onAnswerSelect }) {
  const handleToggle = (idx) => {
    const updated = selectedAnswers.includes(idx)
      ? selectedAnswers.filter(i => i !== idx)
      : [...selectedAnswers, idx];
    onAnswerSelect(updated);
  };

  return (
    <div className="msq-input">
      <p className="msq-note">Select all that apply:</p>
      {options.map((option, idx) => (
        <label key={idx} className={`option ${selectedAnswers.includes(idx) ? 'selected' : ''}`}>
          <input
            type="checkbox"
            value={idx}
            checked={selectedAnswers.includes(idx)}
            onChange={() => handleToggle(idx)}
          />
          <span className="option-label">{String.fromCharCode(65 + idx)}</span>
          <span className="option-text">{option}</span>
        </label>
      ))}
    </div>
  );
}

/**
 * NAT Input - Numeric answer with decimal support
 */
function NATInput({ selectedAnswer, onAnswerSelect }) {
  return (
    <div className="nat-input">
      <p className="nat-note">Enter your numeric answer (decimals allowed):</p>
      <input
        type="number"
        step="0.01"
        placeholder="e.g., 42.5 or 100"
        value={selectedAnswer || ''}
        onChange={(e) => onAnswerSelect(e.target.value)}
        className="nat-field"
      />
      {selectedAnswer !== undefined && selectedAnswer !== '' && (
        <p className="nat-value">Your answer: <strong>{selectedAnswer}</strong></p>
      )}
    </div>
  );
}

export default GateQuestionCard;
