import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExamCenter.css';

/**
 * ExamCenter - Main page for selecting exams
 * Shows grid of available exams with descriptions
 * User can choose an exam and start a mock test
 */
const ExamCenter = () => {
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState(null);

  // Available exams with metadata
  const exams = [
    {
      id: 'gate-cse',
      name: 'GATE CSE',
      category: 'GATE',
      description: 'Graduate Aptitude Test in Engineering - Computer Science',
      duration: '180 mins',
      questions: '65 questions',
      totalMarks: '100 marks',
      icon: '💻',
      color: '#3b82f6',
      available: true,
      subject: 'DSA'
    },
    {
      id: 'gate-ece',
      name: 'GATE ECE',
      category: 'GATE',
      description: 'Graduate Aptitude Test in Engineering - Electronics',
      duration: '180 mins',
      questions: '65 questions',
      totalMarks: '100 marks',
      icon: '⚡',
      color: '#8b5cf6',
      available: false,
      subject: 'Electronics'
    },
    {
      id: 'gate-me',
      name: 'GATE Mechanical',
      category: 'GATE',
      description: 'Graduate Aptitude Test in Engineering - Mechanical',
      duration: '180 mins',
      questions: '65 questions',
      totalMarks: '100 marks',
      icon: '⚙️',
      color: '#ec4899',
      available: false,
      subject: 'Mechanical'
    },
    {
      id: 'jee-main',
      name: 'JEE Main',
      category: 'Engineering',
      description: 'Joint Entrance Examination for Engineering Aspirants',
      duration: '180 mins',
      questions: '90 questions',
      totalMarks: '300 marks',
      icon: '🔬',
      color: '#f59e0b',
      available: false,
      subject: 'JEE'
    },
    {
      id: 'neet',
      name: 'NEET',
      category: 'Medical',
      description: 'National Eligibility cum Entrance Test for Medical',
      duration: '180 mins',
      questions: '180 questions',
      totalMarks: '720 marks',
      icon: '🏥',
      color: '#10b981',
      available: false,
      subject: 'NEET'
    },
    {
      id: 'future-1',
      name: 'Coming Soon',
      category: 'Future',
      description: 'More exams will be added soon',
      duration: 'TBD',
      questions: 'TBD',
      totalMarks: 'TBD',
      icon: '🚀',
      color: '#64748b',
      available: false,
      subject: 'TBD'
    }
  ];

  /**
   * Handle exam card click - navigate to exam start page (not directly to exam)
   */
  const handleStartTest = (exam) => {
    if (!exam.available) {
      alert(`${exam.name} will be available soon!`);
      return;
    }

    // Navigate to exam start page (not directly to the exam)
    navigate(`/mock-exam?exam=${exam.id}&subject=${exam.subject}`);
  };

  return (
    <div className="exam-center-container">
      {/* Background Decorations */}
      <div className="exam-center-bg-shape-1"></div>
      <div className="exam-center-bg-shape-2"></div>
      <div className="exam-center-bg-shape-3"></div>

      {/* Hero Section */}
      <div className="exam-center-hero">
        <div className="exam-center-hero-content">
          <h1 className="exam-center-title">Select an Exam to Begin</h1>
          <p className="exam-center-subtitle">
            Choose from a variety of mock exams and practice tests to ace your entrance exams
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="exam-center-filters">
        <button className="filter-btn filter-btn-active">All Exams</button>
        <button className="filter-btn">GATE</button>
        <button className="filter-btn">Engineering</button>
        <button className="filter-btn">Medical</button>
      </div>

      {/* Exams Grid */}
      <div className="exam-center-grid">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className={`exam-card ${!exam.available ? 'exam-card-disabled' : ''} ${
              selectedExam?.id === exam.id ? 'exam-card-selected' : ''
            }`}
            onClick={() => exam.available && setSelectedExam(exam)}
            style={{
              '--exam-color': exam.color
            }}
          >
            {/* Card Background */}
            <div className="exam-card-bg"></div>

            {/* Card Content */}
            <div className="exam-card-content">
              {/* Icon */}
              <div className="exam-card-icon">{exam.icon}</div>

              {/* Title */}
              <h3 className="exam-card-title">{exam.name}</h3>

              {/* Category Badge */}
              <span className="exam-card-category">{exam.category}</span>

              {/* Description */}
              <p className="exam-card-description">{exam.description}</p>

              {/* Details */}
              <div className="exam-card-details">
                <div className="detail-item">
                  <span className="detail-icon">⏱️</span>
                  <span className="detail-text">{exam.duration}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">❓</span>
                  <span className="detail-text">{exam.questions}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">⭐</span>
                  <span className="detail-text">{exam.totalMarks}</span>
                </div>
              </div>

              {/* Button */}
              <button
                className={`exam-card-btn ${!exam.available ? 'exam-card-btn-disabled' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartTest(exam);
                }}
                disabled={!exam.available}
              >
                {exam.available ? '🚀 Start Mock Test' : '🔒 Coming Soon'}
              </button>

              {/* Lock Icon for Unavailable */}
              {!exam.available && <div className="exam-card-lock">🔒</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="exam-center-info">
        <div className="info-card">
          <h3>📊 Why Practice with Us?</h3>
          <ul>
            <li>AI-powered difficulty progression</li>
            <li>Detailed performance analytics</li>
            <li>Topic-wise weak area identification</li>
            <li>Compare with all test takers</li>
          </ul>
        </div>
        <div className="info-card">
          <h3>✨ Features Included</h3>
          <ul>
            <li>Full-length mock tests</li>
            <li>Section-wise analysis</li>
            <li>Answer explanations</li>
            <li>Time management tools</li>
          </ul>
        </div>
        <div className="info-card">
          <h3>🎯 Get Started</h3>
          <ul>
            <li>Select an exam above</li>
            <li>Complete the mock test</li>
            <li>Review your performance</li>
            <li>Improve and practice more</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExamCenter;
