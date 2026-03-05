import React from 'react';
import { CheckCircle, XCircle, Calendar, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';

const TestsAttemptedTable = ({ tests, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="table-container">
        <LoadingSkeleton rows={5} columns={7} />
      </div>
    );
  }

  if (!tests || tests.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle}
        heading="No tests attempted yet"
        description="Take a test to see your results here"
        ctaText="Browse Tests"
        onCtaClick={() => navigate('/mock-tests')}
      />
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const calculatePercentage = (score, total) => {
    if (!total || total === 0) return 0;
    return Math.round((score / total) * 100);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#10B981'; // Green
    if (percentage >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const CircularProgress = ({ percentage }) => {
    const color = getScoreColor(percentage);
    const circumference = 2 * Math.PI * 16; // radius = 16
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="circular-progress">
        <svg width="40" height="40" viewBox="0 0 40 40">
          {/* Background circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="#27272A"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <span className="circular-progress-text" style={{ color }}>
          {percentage}%
        </span>
      </div>
    );
  };

  const handleViewDetails = (idOrCode) => {
    // Navigate to result details page - use _id if available
    if (idOrCode) {
      navigate(`/results/${idOrCode}`);
    }
  };

  return (
    <div className="table-container">
      <div className="table-header attempted-header">
        <div>Test Code</div>
        <div>Topic</div>
        <div>Score</div>
        <div>Percentage</div>
        <div>Result</div>
        <div>Date</div>
        <div>Review</div>
      </div>

      <div className="table-body">
        {tests.map((test) => {
          const score = test.score || test.marksObtained || 0;
          const total = test.totalQuestions || test.totalMarks || 100;
          const percentage = test.percentage || calculatePercentage(score, total);
          const isPassed = percentage >= 60;

          return (
            <div key={test._id} className="table-row">
              <div className="table-cell-code">
                <code>{test.testCode}</code>
              </div>

              <div className="table-cell-topic">
                {test.topic || test.subject || 'General'}
              </div>

              <div className="table-cell-score">
                {score}/{total}
              </div>

              <div className="table-cell-percentage">
                <CircularProgress percentage={percentage} />
              </div>

              <div className="table-cell-result">
                <span className={`result-badge ${isPassed ? 'result-badge-pass' : 'result-badge-fail'}`}>
                  {isPassed ? (
                    <CheckCircle size={16} strokeWidth={2} />
                  ) : (
                    <XCircle size={16} strokeWidth={2} />
                  )}
                  <span>{isPassed ? 'Pass' : 'Fail'}</span>
                </span>
              </div>

              <div className="table-cell-date">
                <Calendar size={14} strokeWidth={2} className="text-gray-400" />
                <span>{formatDate(test.attemptedAt || test.createdAt)}</span>
              </div>

              <div className="table-cell-review">
                <button 
                  className="action-button-secondary"
                  onClick={() => handleViewDetails(test._id || test.testCode)}
                >
                  <Eye size={16} strokeWidth={2} />
                  <span>Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestsAttemptedTable;
