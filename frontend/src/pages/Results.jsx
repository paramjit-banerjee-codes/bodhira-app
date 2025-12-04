import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { testAPI } from '../services/api';
import './Results.css';

const Results = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    loadResult();
  }, [resultId]);

  const loadResult = async () => {
    try {
      const response = await testAPI.getResult(resultId);
      const resultData = response.data?.data;
      setResult(resultData);
      
      // Load test details
      if (resultData?.testCode) {
        const testRes = await testAPI.getTestByCode(resultData.testCode);
        setTest(testRes.data?.data);
      }
    } catch (error) {
      console.error('Failed to load result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: '#ef4444', marginBottom: 20 }}>Result not found</p>
          <Link to="/dashboard" className="btn btn-primary">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const isPass = result.percentage >= 70;
  const scoreColor = result.percentage >= 80 ? '#10b981' : result.percentage >= 70 ? '#f59e0b' : '#ef4444';

  return (
    <div className="container" style={{ maxWidth: 900, paddingTop: 30 }}>
      {/* Result Card */}
      <div className="card" style={{ marginBottom: 30 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 48, marginBottom: 15 }}>
            {isPass ? '✅ PASS' : '❌ RETAKE'}
          </div>
          <h1 style={{ fontSize: 28, margin: '0 0 10px 0' }}>
            {result.score} out of {result.totalQuestions}
          </h1>
          <div style={{ fontSize: 36, fontWeight: 'bold', color: scoreColor, marginBottom: 5 }}>
            {result.percentage}%
          </div>
          <p style={{ color: '#94a3b8', marginBottom: 0 }}>
            {test?.title || 'Test'} • {test?.topic || 'General'}
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 15, marginBottom: 20 }}>
          <div style={{ background: '#0f172a', padding: 15, borderRadius: 8, textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 3 }}>RANK</p>
            <p style={{ fontSize: 20, fontWeight: 'bold' }}>#{result.rank}</p>
          </div>
          <div style={{ background: '#0f172a', padding: 15, borderRadius: 8, textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 3 }}>TIME TAKEN</p>
            <p style={{ fontSize: 20, fontWeight: 'bold' }}>
              {Math.floor((result.timeTaken || 0) / 60)}m
            </p>
          </div>
          <div style={{ background: '#0f172a', padding: 15, borderRadius: 8, textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 3 }}>DATE</p>
            <p style={{ fontSize: 14, fontWeight: 'bold' }}>
              {new Date(result.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowAnswers(!showAnswers)}
            className="btn btn-primary"
            style={{ flex: 1, minWidth: 150 }}
          >
            {showAnswers ? '✓ Hide' : '📋 Review'} Answers
          </button>
          <Link 
            to={`/leaderboard?code=${result.testCode}`}
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: 150, textDecoration: 'none', textAlign: 'center' }}
          >
            🏆 Leaderboard
          </Link>
          <Link 
            to="/dashboard"
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: 150, textDecoration: 'none', textAlign: 'center' }}
          >
            ← Dashboard
          </Link>
        </div>
      </div>

      {/* Answer Review */}
      {showAnswers && test && (
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>📋 Answer Review</h2>
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
              <div 
                key={idx}
                style={{
                  padding: 15,
                  marginBottom: 15,
                  border: `2px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                  borderRadius: 8,
                  background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 20, marginRight: 10 }}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <h3 style={{ margin: 0, fontSize: 16 }}>
                    Question {idx + 1}
                  </h3>
                </div>

                <p style={{ color: '#cbd5e1', marginBottom: 12, fontWeight: 500 }}>
                  {question.question}
                </p>

                <div style={{ marginBottom: 10 }}>
                  <p style={{ color: '#10b981', fontSize: 13, marginBottom: 3, fontWeight: 600 }}>✓ Correct Answer:</p>
                  <p style={{ marginTop: 0, paddingLeft: 12, background: 'rgba(16, 185, 129, 0.1)', padding: 8, borderRadius: 4 }}>
                    {correctAnswer}
                  </p>
                </div>

                {!isCorrect && (
                  <div>
                    <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 3, fontWeight: 600 }}>✗ Your Answer:</p>
                    <p style={{ marginTop: 0, paddingLeft: 12, background: 'rgba(239, 68, 68, 0.1)', padding: 8, borderRadius: 4 }}>
                      {userAnswer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Results;