import { useNavigate, useSearchParams } from 'react-router-dom';
import './GateExamStart.css';

/**
 * GateExamStart - Exam information and start page
 * Shows exam details with a "Start Exam" button
 * User must click the button to begin the actual exam
 */
const GateExamStart = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const examId = searchParams.get('exam');
  const subject = searchParams.get('subject');

  // Exam metadata
  const examDetails = {
    'gate-cse': {
      name: 'GATE CSE',
      fullName: 'Graduate Aptitude Test in Engineering - Computer Science',
      subject: 'DSA (Data Structures & Algorithms)',
      icon: '💻',
      color: '#3b82f6'
    }
  };

  const exam = examDetails[examId] || examDetails['gate-cse'];

  const handleStartExam = () => {
    // Navigate to actual exam with query params
    navigate(`/mock-exam/start?exam=${examId}&subject=${subject}`);
  };

  const handleBack = () => {
    navigate('/exam-center');
  };

  return (
    <div className="gate-exam-start-container">
      {/* Background */}
      <div className="gate-exam-bg-shape-1"></div>
      <div className="gate-exam-bg-shape-2"></div>

      {/* Main Card */}
      <div className="gate-exam-start-card">
        {/* Header */}
        <div className="gate-exam-header">
          <div className="gate-exam-icon" style={{ background: exam.color }}>
            {exam.icon}
          </div>
          <div className="gate-exam-title-section">
            <h1 className="gate-exam-title">{exam.name}</h1>
            <p className="gate-exam-subtitle">{exam.fullName}</p>
          </div>
        </div>

        {/* Exam Details */}
        <div className="gate-exam-details-grid">
          <div className="gate-exam-detail-card">
            <div className="detail-icon">⏱️</div>
            <div className="detail-content">
              <span className="detail-label">Duration</span>
              <span className="detail-value">180 Minutes</span>
            </div>
          </div>

          <div className="gate-exam-detail-card">
            <div className="detail-icon">❓</div>
            <div className="detail-content">
              <span className="detail-label">Questions</span>
              <span className="detail-value">65 Questions</span>
            </div>
          </div>

          <div className="gate-exam-detail-card">
            <div className="detail-icon">⭐</div>
            <div className="detail-content">
              <span className="detail-label">Total Marks</span>
              <span className="detail-value">100 Marks</span>
            </div>
          </div>

          <div className="gate-exam-detail-card">
            <div className="detail-icon">📚</div>
            <div className="detail-content">
              <span className="detail-label">Subject</span>
              <span className="detail-value">{exam.subject}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="gate-exam-instructions">
          <h2 className="instructions-title">📋 Exam Instructions</h2>
          <div className="instructions-content">
            <div className="instruction-item">
              <span className="instruction-icon">✅</span>
              <p>The exam consists of <strong>65 questions</strong> divided into 2 sections</p>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">⏰</span>
              <p>You have <strong>180 minutes</strong> to complete the exam</p>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">📝</span>
              <p>Questions include MCQ (Multiple Choice), MSQ (Multiple Select), and NAT (Numerical)</p>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">⚠️</span>
              <p>The exam will <strong>auto-submit</strong> when time expires</p>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">💾</span>
              <p>You can navigate between questions and review your answers</p>
            </div>
            <div className="instruction-item">
              <span className="instruction-icon">🎯</span>
              <p>Answer all questions to maximize your score</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="gate-exam-actions">
          <button 
            className="gate-exam-back-btn"
            onClick={handleBack}
          >
            ← Back to Exam Center
          </button>
          <button 
            className="gate-exam-start-btn"
            onClick={handleStartExam}
          >
            🚀 Start Exam
          </button>
        </div>

        {/* Note */}
        <p className="gate-exam-note">
          💡 <strong>Tip:</strong> Make sure you have a stable internet connection and are in a quiet environment before starting.
        </p>
      </div>
    </div>
  );
};

export default GateExamStart;
