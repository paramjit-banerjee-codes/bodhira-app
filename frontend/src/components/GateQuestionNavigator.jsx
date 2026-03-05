/**
 * GateQuestionNavigator Component
 * 
 * Displays a grid of question numbers allowing users to:
 * 1. Jump to any question directly
 * 2. See status of each question (answered, unanswered, current)
 * 3. Quick visual reference of progress
 * 
 * Props:
 *   - totalQuestions: Total number of questions
 *   - currentQuestionIdx: Index of current question being displayed
 *   - getQuestionStatus: Function to get status of a question
 *   - onJumpToQuestion: Callback when user clicks a question number
 * 
 * Status colors:
 *   - Grey: Unanswered
 *   - Blue: Answered
 *   - Yellow: Current question
 */
const GateQuestionNavigator = ({
  totalQuestions,
  currentQuestionIdx,
  getQuestionStatus,
  onJumpToQuestion
}) => {
  return (
    <div className="question-navigator">
      {/* Create grid of question numbers */}
      <div className="question-grid">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const status = getQuestionStatus(index);
          const isCurrentQuestion = index === currentQuestionIdx;

          return (
            <button
              key={index}
              className={`question-btn ${status} ${
                isCurrentQuestion ? 'active' : ''
              }`}
              onClick={() => onJumpToQuestion(index)}
              title={`Question ${index + 1} - ${status}`}
            >
              {/* Show question number */}
              <span className="btn-number">{index + 1}</span>

              {/* Show status indicator dot */}
              {status === 'answered' && <span className="status-indicator">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GateQuestionNavigator;
