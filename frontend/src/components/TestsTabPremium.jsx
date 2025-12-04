import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classroomAPI, testAPI } from '../services/api';
import ConfirmationModal from './ConfirmationModal';
import TestInsightsModal from './TestInsightsModal';
import toast from '../utils/toast';

export default function TestsTabPremium({ classroom, isTeacher }) {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [selectedTestForInsights, setSelectedTestForInsights] = useState(null);

  console.log('🧪 TestsTabPremium - isTeacher:', isTeacher, 'classroom:', classroom?.name);

  if (!classroom) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
        <p>Loading classroom...</p>
      </div>
    );
  }

  // CRITICAL: If not a teacher, students should only see preview option
  if (!isTeacher) {
    console.log('⚠️ Student viewing tests - hiding create/edit/delete buttons');
  }

  useEffect(() => {
    fetchTests();
  }, [classroom]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const classroomId = classroom._id || classroom.id;
      console.log('📚 Fetching tests for classroom:', classroomId);
      
      if (!classroomId) {
        throw new Error('Classroom ID is missing');
      }

      const response = await classroomAPI.getTests(classroomId);
      console.log('✅ Tests fetched successfully:', response.data);
      
      // Handle response data structure
      const testsData = response.data?.data || response.data || [];
      console.log('📋 Tests data:', testsData);
      
      setTests(Array.isArray(testsData) ? testsData : []);
      
      if (testsData.length === 0) {
        console.log('ℹ️ No tests found in this classroom');
      }
    } catch (err) {
      console.error('❌ Error fetching tests:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
      });
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load tests';
      setError(errorMessage);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = () => {
    navigate(`/classrooms/${classroom._id}/generate`);
  };

  const handlePreview = (testId) => {
    navigate(`/test/${testId}/preview`);
  };

  const handlePublish = async (testId) => {
    setActionLoading(prev => ({ ...prev, [testId]: true }));
    try {
      await testAPI.publishTest(testId, { classroomId: classroom._id });
      toast.success('Test published successfully');
      await fetchTests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish test');
    } finally {
      setActionLoading(prev => ({ ...prev, [testId]: false }));
    }
  };

  const handleDeleteClick = (testId) => {
    setTestToDelete(testId);
    setShowDeleteConfirm(true);
  };

  const handleInsights = (test) => {
    console.log('📊 Opening insights for test:', test._id);
    setSelectedTestForInsights(test);
    setShowInsightsModal(true);
  };

  const confirmDelete = async () => {
    if (!testToDelete) return;
    
    setActionLoading(prev => ({ ...prev, [testToDelete]: true }));
    try {
      console.log('🗑️ Deleting test:', testToDelete);
      const response = await testAPI.deleteTest(testToDelete);
      console.log('✅ Test deleted:', response);
      toast.success('Test deleted successfully');
      setShowDeleteConfirm(false);
      setTestToDelete(null);
      // Refresh the tests list from server
      await fetchTests();
    } catch (err) {
      console.error('❌ Delete failed:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete test';
      toast.error(errorMsg);
      setShowDeleteConfirm(false);
      setTestToDelete(null);
      // Still refresh to ensure UI is in sync
      await fetchTests();
    } finally {
      setActionLoading(prev => ({ ...prev, [testToDelete]: false }));
    }
  };

  const filteredTests = tests.filter(test =>
    test.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.testCode?.includes(searchQuery)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header with Create Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search tests by topic or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '10px',
              color: '#f1f5f9',
              fontSize: '14px',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)';
            }}
          />
          <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</div>
        </div>

        {isTeacher && (
          <button
            data-testid="create-test-btn"
            onClick={handleCreateTest}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ✨ Create Test
          </button>
        )}
      </div>

      {/* Tests List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#60a5fa', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          color: '#fb7185',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
          <p style={{ margin: '0 0 16px 0', fontWeight: '600' }}>{error}</p>
          <button
            onClick={fetchTests}
            style={{
              padding: '8px 16px',
              background: '#f43f5e',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e11d48';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f43f5e';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🔄 Try Again
          </button>
        </div>
      ) : filteredTests.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 32px',
          background: 'rgba(30, 41, 59, 0.2)',
          borderRadius: '16px',
          border: '2px dashed rgba(148, 163, 184, 0.2)',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📝</div>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#cbd5e1', margin: '0 0 8px 0' }}>No tests yet</p>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, marginBottom: '24px' }}>{isTeacher ? 'Create your first test to get started' : 'Tests will appear here once your teacher creates them'}</p>
          {isTeacher && (
            <button
              onClick={handleCreateTest}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Create First Test
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {filteredTests.map((test, idx) => (
            <div
              key={test._id}
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.6) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.3s ease',
                cursor: 'default',
                animation: `slide-up 0.4s ease-out ${idx * 0.05}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px 0' }}>
                  {test.topic}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: '#94a3b8',
                  }}>
                    📋 {test.totalQuestions} questions
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    color: '#94a3b8',
                  }}>
                    ⏱️ {test.duration} min
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: (test.isPublished || test.status === 'published') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: (test.isPublished || test.status === 'published') ? '#6ee7b7' : '#fcd34d',
                }}>
                  {(test.isPublished || test.status === 'published') ? '✓ Published' : '⏳ Draft'}
                </span>
              </div>

              {/* Test Code */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>Code</div>
                <code style={{ fontSize: '14px', fontWeight: '700', color: '#60a5fa', fontFamily: 'monospace' }}>
                  {test.testCode || test._id?.substring(0, 8)}
                </code>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handlePreview(test._id)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#60a5fa',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  }}
                >
                  👁️ Preview
                </button>

                {isTeacher && (
                  <>
                    <button
                      onClick={() => handleInsights(test)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'rgba(168, 85, 247, 0.1)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        borderRadius: '8px',
                        color: '#d8b4fe',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
                      }}
                      title="View question-wise analytics"
                    >
                      📊 Insights
                    </button>

                    {!test.isPublished && test.status !== 'published' && (
                      <button
                        onClick={() => handlePublish(test._id)}
                        disabled={actionLoading[test._id]}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '8px',
                          color: '#6ee7b7',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: actionLoading[test._id] ? 'not-allowed' : 'pointer',
                          opacity: actionLoading[test._id] ? 0.6 : 1,
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!actionLoading[test._id]) {
                            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                        }}
                      >
                        {actionLoading[test._id] ? '⏳...' : '🚀 Publish'}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteClick(test._id)}
                      disabled={actionLoading[test._id]}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: '8px',
                        color: '#fb7185',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: actionLoading[test._id] ? 'not-allowed' : 'pointer',
                        opacity: actionLoading[test._id] ? 0.6 : 1,
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!actionLoading[test._id]) {
                          e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
                      }}
                    >
                      {actionLoading[test._id] ? '⏳...' : '🗑️'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Test?"
        message="This action cannot be undone. All test data and responses will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={actionLoading[testToDelete]}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setTestToDelete(null);
        }}
      />

      <TestInsightsModal
        isOpen={showInsightsModal}
        onClose={() => {
          setShowInsightsModal(false);
          setSelectedTestForInsights(null);
        }}
        testId={selectedTestForInsights?._id}
        testTopic={selectedTestForInsights?.topic}
      />

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
