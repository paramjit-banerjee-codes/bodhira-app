import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testAPI, profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SmartProTips from '../components/SmartProTips';
import ConfirmationModal from '../components/ConfirmationModal';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'teacher') {
          // Teacher: fetch created tests
          await fetchTeacherTests();
        } else {
          // Student: fetch profile stats
          await fetchStudentStats();
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.role]);

  const fetchTeacherTests = async () => {
    try {
      const response = await testAPI.getTeacherTests();
      // API returns: { success: true, data: { tests: [...], total: N } }
      const testsData = response.data?.data?.tests || response.data?.tests || [];
      console.log('📊 Dashboard - Fetched teacher tests:', testsData);
      console.log('📊 Dashboard - Tests count:', testsData.length);
      setTests(Array.isArray(testsData) ? testsData : []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setTests([]);
    }
  };

  const fetchStudentStats = async () => {
    try {
      const response = await profileAPI.getProfile();
      const profileData = response.data?.data || {};
      console.log('📊 Dashboard - Fetched student profile:', profileData);
      setStats(profileData.stats || {});
      setTests(profileData.attemptedTests || []);
    } catch (error) {
      console.error('Error fetching student stats:', error);
      setStats({});
      setTests([]);
    }
  };

  const handleDeleteTest = (testId) => {
    setDeleteError(null);
    setTestToDelete(testId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!testToDelete) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      console.log(`🗑️ Deleting test: ${testToDelete}`);
      const response = await testAPI.deleteTest(testToDelete);
      console.log('✅ Test deleted successfully:', response);
      setTests(tests.filter(t => t._id !== testToDelete));
      setShowDeleteConfirm(false);
      setTestToDelete(null);
    } catch (error) {
      console.error('❌ Failed to delete test:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to delete test';
      setDeleteError(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="skeleton-loader">
          {/* Header Skeleton */}
          <div className="skeleton-header">
            <div className="skeleton-title" style={{ width: '30%', height: '32px' }}></div>
            <div className="skeleton-subtitle" style={{ width: '60%', height: '16px', marginTop: '12px' }}></div>
          </div>

          {/* Quick Stats Skeleton - matching actual layout */}
          <div className="skeleton-stats">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-stat-card" style={{ padding: '24px' }}>
                <div style={{ height: '28px', width: '28px', borderRadius: '6px', marginBottom: '12px' }}></div>
                <div style={{ height: '14px', width: '70%', marginBottom: '8px' }}></div>
                <div style={{ height: '24px', width: '50%', marginBottom: '12px' }}></div>
                <div style={{ height: '12px', width: '60%' }}></div>
              </div>
            ))}
          </div>

          {/* CTA Skeleton */}
          <div style={{ height: '48px', width: '200px', marginBottom: '32px' }}></div>

          {/* Tests List Skeleton */}
          <div className="skeleton-tests">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton-test-item" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ height: '20px', width: '50%' }}></div>
                  <div style={{ height: '20px', width: '12%' }}></div>
                </div>
                <div style={{ display: 'flex', gap: '24px', paddingTop: '16px', borderTop: '1px solid rgba(96, 165, 250, 0.1)' }}>
                  <div style={{ height: '14px', width: '15%' }}></div>
                  <div style={{ height: '14px', width: '15%' }}></div>
                  <div style={{ height: '14px', width: '15%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }

          .skeleton-loader * {
            background-color: rgba(51, 65, 85, 0.08);
            background-image: linear-gradient(
              90deg,
              rgba(51, 65, 85, 0.08) 0%,
              rgba(71, 85, 99, 0.12) 50%,
              rgba(51, 65, 85, 0.08) 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 3s infinite;
            border-radius: 6px;
          }

          .skeleton-header {
            margin-bottom: 40px;
            padding-bottom: 20px;
          }

          .skeleton-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 32px;
          }

          .skeleton-stat-card {
            background: rgba(30, 41, 59, 0.25);
            border: 1px solid rgba(96, 165, 250, 0.08);
            border-radius: 12px;
          }

          .skeleton-tests {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .skeleton-test-item {
            background: rgba(30, 41, 59, 0.25);
            border: 1px solid rgba(96, 165, 250, 0.08);
            border-radius: 12px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1>{user?.role === 'teacher' ? 'My Tests' : 'My Performance'}</h1>
        <p className="header-subtitle">
          {user?.role === 'teacher' 
            ? 'Manage and track all your test assessments'
            : 'Track your test attempts and performance'}
        </p>
      </div>

      {/* Quick Stats - Premium Cards */}
      <div className="quick-stats">
        {user?.role === 'teacher' ? (
          <>
            <div className="stat-item">
              <div className="stat-icon">📝</div>
              <span className="stat-label">Total Tests</span>
              <span className="stat-value">{tests.length}</span>
              <div className="stat-trend">
                <span className="trend-indicator">All time</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📤</div>
              <span className="stat-label">Total Submissions</span>
              <span className="stat-value">{tests.reduce((sum, t) => sum + (t.submissionCount || 0), 0)}</span>
              <div className="stat-trend">
                <span className="trend-indicator">From all tests</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">✨</div>
              <span className="stat-label">Active Tests</span>
              <span className="stat-value">{tests.filter(t => t.isPublished).length}</span>
              <div className="stat-trend">
                <span className="trend-indicator">Published</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-item">
              <div className="stat-icon">📋</div>
              <span className="stat-label">Tests Attempted</span>
              <span className="stat-value">{stats.testsAttempted || 0}</span>
              <div className="stat-trend">
                <span className="trend-indicator">Total</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <span className="stat-label">Average Score</span>
              <span className="stat-value">{stats.averageScore ? stats.averageScore.toFixed(1) : 0}%</span>
              <div className="stat-trend">
                <span className="trend-indicator">Overall</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🏆</div>
              <span className="stat-label">Tests Passed</span>
              <span className="stat-value">{stats.testsPassed || 0}</span>
              <div className="stat-trend">
                <span className="trend-indicator">Success rate</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main CTA */}
      {user?.role === 'teacher' && (
        <div className="dashboard-cta">
          <Link to="/generate-test" className="cta-button">
            <span className="cta-icon">+</span>
            <span className="cta-text">Create New Test</span>
          </Link>
        </div>
      )}

      {/* Tests List or Empty State */}
      {tests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <h2>{user?.role === 'teacher' ? 'No Tests Yet' : 'No Attempts Yet'}</h2>
          <p>
            {user?.role === 'teacher' 
              ? 'Create your first test to start assessing your students'
              : 'Start taking tests to build your track record'}
          </p>
          {user?.role === 'teacher' && (
            <Link to="/generate-test" className="empty-cta">
              Create Test
            </Link>
          )}
          {user?.role === 'student' && (
            <Link to="/join" className="empty-cta">
              Take a Test
            </Link>
          )}
        </div>
      ) : (
        <div className="tests-container">
          <div className="tests-list">
            {tests.map((test) => (
              <div key={test._id} className="test-item">
                <div className="test-item-header">
                  <div className="test-item-title-section">
                    <h3 className="test-item-title">{test.title}</h3>
                    <p className="test-item-topic">{test.topic || 'General'}</p>
                  </div>
                  <div className="test-item-badge">
                    {test.isPublished ? (
                      <span className="badge badge-published">Published</span>
                    ) : (
                      <span className="badge badge-draft">Draft</span>
                    )}
                  </div>
                </div>

                <div className="test-item-meta">
                  <div className="meta-group">
                    <span className="meta-label">Code</span>
                    <span className="meta-value code-value">{test.testCode}</span>
                  </div>
                  <div className="meta-group">
                    <span className="meta-label">Questions</span>
                    <span className="meta-value">{test.totalQuestions || test.questions?.length || 0}</span>
                  </div>
                  <div className="meta-group">
                    <span className="meta-label">Submissions</span>
                    <span className="meta-value">{test.submissionCount || 0}</span>
                  </div>
                  <div className="meta-group">
                    <span className="meta-label">Created</span>
                    <span className="meta-value">{new Date(test.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="test-item-actions">
                  <button 
                    onClick={() => copyToClipboard(test.testCode)}
                    className="action-button action-secondary"
                    title="Copy test code"
                  >
                    Copy Code
                  </button>
                  <Link 
                    to={`/test/${test.testCode}/results`}
                    className="action-button action-primary"
                    title="View test results"
                  >
                    View Results
                  </Link>
                  <Link 
                    to={`/leaderboard?code=${test.testCode}`}
                    className="action-button action-secondary"
                    title="View leaderboard"
                  >
                    Leaderboard
                  </Link>
                  <button 
                    onClick={() => handleDeleteTest(test._id)}
                    className="action-button action-danger"
                    title="Delete this test"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro Tips Section */}
      {tests.length > 0 && (
        <div className="dashboard-tips-section">
          <SmartProTips />
        </div>
      )}

      {/* Delete Test Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title={deleteError ? "Delete Failed" : "Delete Test?"}
        message={deleteError ? `Error: ${deleteError}` : "This will permanently delete this test. Any students who have attempted it will still have their results, but the test itself will be removed."}
        confirmText={deleteError ? "Try Again" : "Delete Test"}
        cancelText={deleteError ? "Close" : "Cancel"}
        onConfirm={deleteError ? confirmDelete : confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setTestToDelete(null);
          setDeleteError(null);
        }}
        isLoading={deleting}
        isDangerous={!deleteError}
      />
    </div>
  );
};

export default Dashboard;