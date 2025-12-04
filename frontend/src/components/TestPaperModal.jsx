import { useState, useEffect } from 'react';
import { testAPI } from '../services/api';
import './TestPaperModal.css';

export default function TestPaperModal({ isOpen, onClose, studentName, testCode, userId }) {
  const [result, setResult] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && testCode) {
      loadTestPaper();
    }
  }, [isOpen, testCode, userId]);

  const loadTestPaper = async () => {
    setLoading(true);
    setError(null);
    try {
      const resultsRes = await testAPI.getTestResults(testCode);
      const allResults = resultsRes.data?.data?.results || resultsRes.data?.data || [];

      const studentResult = allResults.find(r => {
        const rUserId = r.userId?._id || r.userId;
        return rUserId?.toString() === userId?.toString();
      });
      
      if (!studentResult) {
        setError('Student result not found');
        setLoading(false);
        return;
      }

      const testRes = await testAPI.getTestWithAnswers(studentResult.testCode || testCode);
      setTest(testRes.data?.data);
      setResult(studentResult);
      
    } catch (err) {
      console.error('Failed to load test paper:', err);
      setError('Failed to load test paper');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tpm-overlay" onClick={onClose}>
      <div className="tpm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="tpm-header">
          <div className="tpm-title-section">
            <h2 className="tpm-title">{test?.title || 'Test Paper'}</h2>
            <p className="tpm-student">{studentName}</p>
          </div>
          <button className="tpm-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="tpm-body">
          {loading ? (
            <div className="tpm-loading">
              <div className="tpm-spinner"></div>
              <p>Loading test paper...</p>
            </div>
          ) : error ? (
            <div className="tpm-error">
              <p>{error}</p>
            </div>
          ) : result && test ? (
            <>
              {/* Score Summary */}
              <div className="tpm-score-bar">
                <div className="tpm-score-item">
                  <span className="tpm-score-label">Score</span>
                  <span className="tpm-score-value">{result.score}/{result.totalQuestions}</span>
                </div>
                <div className="tpm-score-item">
                  <span className="tpm-score-label">Percentage</span>
                  <span className="tpm-score-value" style={{
                    color: result.percentage >= 80 ? '#10b981' : result.percentage >= 70 ? '#f59e0b' : '#ef4444'
                  }}>{result.percentage}%</span>
                </div>
                <div className="tpm-score-item">
                  <span className="tpm-score-label">Time</span>
                  <span className="tpm-score-value">{Math.floor((result.timeTaken || 0) / 60)}m</span>
                </div>
              </div>

              {/* Questions List */}
              <div className="tpm-questions">
                {(test.questions || []).map((question, idx) => {
                  const answerDetail = result.answers?.find(a => a.questionIndex === idx);
                  const userAnswerIndex = answerDetail?.selectedAnswer;
                  const correctAnswerIndex = answerDetail?.correctAnswer;
                  const isCorrect = userAnswerIndex === correctAnswerIndex;
                  
                  const userAnswer = userAnswerIndex >= 0 && userAnswerIndex < question.options.length 
                    ? question.options[userAnswerIndex]
                    : 'Not answered';
                  const correctAnswer = correctAnswerIndex >= 0 && correctAnswerIndex < question.options.length 
                    ? question.options[correctAnswerIndex]
                    : 'Unknown';

                  return (
                    <div key={idx} className={`tpm-question ${isCorrect ? 'tpm-correct' : 'tpm-wrong'}`}>
                      <div className="tpm-q-header">
                        <span className="tpm-q-num">{idx + 1}</span>
                        <p className="tpm-q-text">{question.question}</p>
                        <span className="tpm-q-status">{isCorrect ? '✓' : '✗'}</span>
                      </div>
                      
                      <div className="tpm-answers">
                        <div className="tpm-answer-row">
                          <span className="tpm-answer-label-correct">✓ Correct</span>
                          <span className="tpm-answer-value">{correctAnswer}</span>
                        </div>
                        <div className="tpm-answer-row">
                          <span className={`tpm-answer-label-student ${isCorrect ? 'correct' : 'wrong'}`}>
                            {isCorrect ? '✓' : '✗'} Student
                          </span>
                          <span className="tpm-answer-value">{userAnswer}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="tpm-empty">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
