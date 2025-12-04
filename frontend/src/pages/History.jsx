import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import './Dashboard.css';

export default function History() {
  const { user } = useAuth();
  const [attemptedTests, setAttemptedTests] = useState([]);
  const [createdTests, setCreatedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await profileAPI.getProfile();
      const data = response.data?.data;
      setAttemptedTests(data?.attemptedTests || []);
      setCreatedTests(data?.createdTests || []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await profileAPI.deleteAllHistory();
      // Refetch history from server to confirm deletion
      await fetchHistory();
      setShowDeleteConfirm(false);
      console.log('All history deleted successfully');
    } catch (error) {
      console.error('Failed to delete history:', error);
      setShowDeleteConfirm(false);
      // Still try to refetch to get fresh data
      await fetchHistory();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="skeleton-history-container">
        {/* Header Skeleton */}
        <div className="skeleton-history-header"></div>

        {/* Created Tests Section Skeleton */}
        <div className="skeleton-history-section">
          <div className="skeleton-history-title"></div>
          <div className="skeleton-history-table">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-history-row"></div>
            ))}
          </div>
        </div>

        {/* Attempted Tests Section Skeleton */}
        <div className="skeleton-history-section">
          <div className="skeleton-history-title"></div>
          <div className="skeleton-history-table">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-history-row"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 1200, paddingTop: 30, paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>📚 History</h1>
        {(attemptedTests.length > 0 || createdTests.length > 0) && (
          <button
            onClick={handleDeleteClick}
            disabled={deleting}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontSize: '13px',
              fontWeight: '600',
              cursor: deleting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: deleting ? 0.6 : 1,
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => {
              if (!deleting) {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
          >
            {deleting ? '🔄 Deleting...' : '🗑️ Delete All History'}
          </button>
        )}
      </div>

      {/* Created Tests Section */}
      <div className="card" style={{ marginBottom: 50 }}>
        <h2 style={{ marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          📝 Tests Created
        </h2>
        {createdTests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            <p>No tests created yet. Start creating tests to share with others!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155' }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>Test Title</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Code</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Topic</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Questions</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Difficulty</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Created</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {createdTests.map((test) => (
                  <tr key={test._id} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: 12 }}>
                      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{test.title || 'Untitled Test'}</span>
                    </td>
                    <td style={{ padding: 12, textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold', color: '#3b82f6' }}>
                      {test.testCode}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center', color: '#cbd5e1' }}>
                      {test.topic || '—'}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      {test.totalQuestions}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: test.difficulty === 'easy' ? 'rgba(16, 185, 129, 0.1)' : 
                                     test.difficulty === 'medium' ? 'rgba(245, 158, 11, 0.1)' :
                                     'rgba(239, 68, 68, 0.1)',
                        color: test.difficulty === 'easy' ? '#10b981' :
                               test.difficulty === 'medium' ? '#f59e0b' :
                               '#ef4444'
                      }}>
                        {test.difficulty || 'medium'}
                      </span>
                    </td>
                    <td style={{ padding: 12, fontSize: 13, color: '#94a3b8' }}>
                      {new Date(test.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <Link
                        to={`/leaderboard?code=${test.testCode}`}
                        style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}
                      >
                        🏆 Leaderboard
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attempted Tests Section */}
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✅ Tests Attempted
        </h2>
        {attemptedTests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            <p>No tests attempted yet. Take some tests to see your performance history!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155' }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>Test Code</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Topic</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Score</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Percentage</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Result</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Date</th>
                  <th style={{ padding: 12, textAlign: 'center' }}>Review</th>
                </tr>
              </thead>
              <tbody>
                {attemptedTests.map((test) => {
                  const isPass = test.percentage >= 60;
                  return (
                    <tr key={test._id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: 12, fontFamily: 'monospace', fontWeight: 'bold', color: '#3b82f6' }}>
                        {test.testCode}
                      </td>
                      <td style={{ padding: 12, color: '#cbd5e1' }}>
                        {test.topic}
                      </td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        {test.score}/{test.totalQuestions}
                      </td>
                      <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold', color: test.percentage >= 80 ? '#10b981' : test.percentage >= 60 ? '#f59e0b' : '#ef4444' }}>
                        {test.percentage}%
                      </td>
                      <td style={{ padding: 12, textAlign: 'center', fontWeight: 'bold' }}>
                        <span style={{ color: isPass ? '#10b981' : '#ef4444' }}>
                          {isPass ? '✅ Pass' : '❌ Retake'}
                        </span>
                      </td>
                      <td style={{ padding: 12, fontSize: 13, color: '#94a3b8' }}>
                        {new Date(test.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: 12, textAlign: 'center' }}>
                        {test._id ? (
                          <Link
                            to={`/results/${test._id}`}
                            style={{ color: '#3b82f6', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}
                          >
                            📋 Details
                          </Link>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: 12 }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete All History Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete All History?"
        message="This will permanently delete all your test history including created and attempted tests. This action cannot be undone."
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={deleting}
        isDangerous={true}
      />
    </div>
  );
}
