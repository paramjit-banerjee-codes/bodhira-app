import React from 'react';
import { FileText, Calendar, Trophy, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';

const TestsCreatedTable = ({ tests, loading, onDelete }) => {
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
        icon={FileText}
        heading="No tests created yet"
        description="Create your first test to get started"
        ctaText="Create Test"
        onCtaClick={() => navigate('/generate')}
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

  const getDifficultyClass = (difficulty) => {
    const lower = difficulty?.toLowerCase() || 'medium';
    if (lower === 'easy') return 'difficulty-badge-easy';
    if (lower === 'hard') return 'difficulty-badge-hard';
    return 'difficulty-badge-medium';
  };

  const handleLeaderboard = (testCode) => {
    navigate(`/leaderboard?code=${testCode}`);
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <div>Test Title</div>
        <div>Code</div>
        <div>Topic</div>
        <div>Questions</div>
        <div>Difficulty</div>
        <div>Created</div>
        <div>Actions</div>
      </div>

      <div className="table-body">
        {tests.map((test) => (
          <div key={test._id} className="table-row">
            <div className="table-cell-title">
              <FileText size={18} strokeWidth={2} className="text-gray-400" />
              <span>{test.title || test.name || 'Untitled Test'}</span>
            </div>

            <div className="table-cell-code">
              <code>{test.testCode}</code>
            </div>

            <div className="table-cell-topic">
              {test.topic || test.subject || 'General'}
            </div>

            <div className="table-cell-questions">
              {test.totalQuestions || test.questions?.length || 0}
            </div>

            <div className="table-cell-difficulty">
              <span className={`difficulty-badge ${getDifficultyClass(test.difficulty)}`}>
                {test.difficulty || 'Medium'}
              </span>
            </div>

            <div className="table-cell-date">
              <Calendar size={14} strokeWidth={2} className="text-gray-400" />
              <span>{formatDate(test.createdAt)}</span>
            </div>

            <div className="table-cell-actions">
              <button 
                className="action-button-primary"
                onClick={() => handleLeaderboard(test.testCode)}
              >
                <Trophy size={16} strokeWidth={2} />
                <span>Leaderboard</span>
              </button>

              <button 
                className="action-button-delete"
                onClick={() => onDelete(test._id)}
                aria-label="Delete test"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestsCreatedTable;
