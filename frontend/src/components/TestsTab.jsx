import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Plus } from 'lucide-react';
import { classroomAPI, testAPI } from '../services/api';
import ConfirmationModal from './ConfirmationModal';
import toast from '../utils/toast';
import '../pages/GenerateTest.css';
import './ClassroomTests.css';

export default function TestsTab({ classroom, isTeacher }) {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);

  // Debug logging
  console.log('\n📋 ===== TESTS TAB ROLE CHECK =====');
  console.log('Received Props:', {
    classroom: classroom?._id,
    isTeacher,
    classroomName: classroom?.name
  });
  console.log('Teacher UI Visibility:', {
    shouldShow: isTeacher,
    'Create Test': isTeacher ? '✅ VISIBLE' : '❌ HIDDEN',
    'Publish Button': isTeacher ? '✅ VISIBLE' : '❌ HIDDEN',
    'Delete Button': isTeacher ? '✅ VISIBLE' : '❌ HIDDEN'
  });
  console.log('====================================\n');

  if (!classroom) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>Loading classroom...</p>
      </div>
    );
  }

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroom]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!classroom?.id && !classroom?._id) {
        throw new Error('Classroom ID is missing');
      }
      const classroomId = classroom.id || classroom._id;
      console.log('📍 Fetching tests for classroom:', classroomId);
      const resp = await classroomAPI.getClassroomTests(classroomId);
      console.log('✅ Tests API response:', resp);
      const data = resp?.data?.data || resp?.data || [];
      console.log('📊 Processed tests data:', data);
      if (!Array.isArray(data)) {
        console.warn('⚠️ Tests data is not an array:', data);
        setTests([]);
      } else {
        setTests(data);
      }
    } catch (err) {
      console.error('❌ TestsTab.fetchTests error:', err.message, err.response?.data || err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch tests';
      setError(errorMsg);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (testId) => {
    try {
      console.log('📢 Publish clicked for test:', testId);
      setActionLoading({ ...actionLoading, [testId]: true });
      const response = await testAPI.publishTest(testId);
      console.log('✅ Publish successful, response:', response);
      setTests(tests.map(t => t._id === testId ? { ...t, status: 'published', isPublished: true } : t));
      toast.success('Test published!');
    } catch (err) {
      console.error('❌ Failed to publish test:', err);
      const errorMsg = err.response?.data?.error || 'Failed to publish test';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionLoading({ ...actionLoading, [testId]: false });
    }
  };

  const handleDelete = async (testId) => {
    setTestToDelete(testId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!testToDelete) return;
    
    try {
      console.log('🗑️ Delete clicked for test:', testToDelete);
      setActionLoading({ ...actionLoading, [testToDelete]: true });
      const response = await testAPI.deleteTest(testToDelete);
      console.log('✅ Delete successful, response:', response);
      toast.success('Test deleted');
      setShowDeleteConfirm(false);
      setTestToDelete(null);
      // Refresh tests list from server
      await fetchTests();
    } catch (err) {
      console.error('❌ Failed to delete test:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete test';
      setError(errorMsg);
      toast.error(errorMsg);
      setShowDeleteConfirm(false);
      setTestToDelete(null);
      // Still refresh to ensure UI is in sync
      await fetchTests();
    } finally {
      setActionLoading({ ...actionLoading, [testToDelete]: false });
    }
  };

  const handlePreview = (testId) => {
    console.log('👁️ Preview clicked for test:', testId);
    window.location.href = `/test/${testId}/preview`;
  };

  const handleTestCreated = (newTest) => {
    fetchTests();
  };

  const filteredTests = filterStatus === 'all' ? tests : tests.filter((test) => test.status === filterStatus);

  const stats = {
    total: tests.length,
    published: tests.filter((t) => t.status === 'published').length,
    draft: tests.filter((t) => t.status === 'draft').length,
  };

  const statusColors = {
    published: { bg: 'bg-gradient-to-br from-slate-800/60 to-slate-900/40', border: 'border-emerald-500/20', text: 'text-emerald-300', badge: 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/30', borderL: 'border-l-emerald-500', hoverBorder: 'hover:border-emerald-500/40', shadowColor: 'hover:shadow-emerald-500/10' },
    draft: { bg: 'bg-gradient-to-br from-slate-800/60 to-slate-900/40', border: 'border-yellow-500/20', text: 'text-yellow-300', badge: 'bg-gradient-to-r from-yellow-600/30 to-yellow-500/30', borderL: 'border-l-yellow-500', hoverBorder: 'hover:border-yellow-500/40', shadowColor: 'hover:shadow-yellow-500/10' },
    archived: { bg: 'bg-gradient-to-br from-slate-800/40 to-slate-900/20', border: 'border-slate-700/30', text: 'text-slate-400', badge: 'bg-slate-700/30', borderL: 'border-l-slate-600', hoverBorder: 'hover:border-slate-700/50', shadowColor: 'hover:shadow-slate-500/10' }
  };

  return (
    <div className="classroom-tests-wrapper">
      {/* Header Section */}
      <div className="classroom-tests-header">
        <div className="classroom-tests-title-section">
          <h2 className="classroom-tests-title">📋 Tests</h2>
          <p className="classroom-tests-subtitle">
            {isTeacher ? `Create and manage tests for your classroom (${stats.total} total)` : `Take tests assigned by your teacher (${stats.published} available)`}
          </p>
        </div>
        
        {/* Generate Test Button - Only for Teachers */}
        {isTeacher && (
          <button 
            onClick={() => navigate(`/classrooms/${classroom._id || classroom.id}/generate-test`)}
            className="btn-generate-test"
            title="Generate or create a new test"
          >
            <Plus size={18} />
            Create Test
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="tests-filter-tabs">
        {['all', 'published', 'draft'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
          >
            <span className="filter-label">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className="filter-count">{stats[status] || 0}</span>
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="tests-loading">
          <div className="spinner"></div>
          <p>Loading tests...</p>
        </div>
      )}

      {/* Tests Grid */}
      {!loading && filteredTests.length > 0 && (
        <div className="tests-grid">
          {filteredTests.map((test) => {
            const isLoading = actionLoading[test._id];
            const isDraft = test.status === 'draft';
            const isPublished = test.status === 'published';

            return (
              <div key={test._id} className="test-card">
                {/* Status Badge */}
                <div className={`test-status-badge test-status-${test.status}`}>
                  {isPublished && '✓ Published'}
                  {isDraft && '✎ Draft'}
                </div>

                {/* Card Body */}
                <div className="test-card-body">
                  <h3 className="test-card-title">{test.title || test.topic || 'Untitled'}</h3>
                  
                  {test.topic && test.topic !== (test.title || test.topic) && (
                    <p className="test-card-topic">{test.topic}</p>
                  )}

                  {/* Metadata */}
                  <div className="test-card-meta">
                    <div className="meta-item">
                      <span className="meta-label">Difficulty:</span>
                      <span className={`meta-value difficulty-${test.difficulty || 'medium'}`}>
                        {test.difficulty ? test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1) : 'Medium'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Questions:</span>
                      <span className="meta-value">{test.totalQuestions || test.questions?.length || 0}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Duration:</span>
                      <span className="meta-value">{test.duration || 30}m</span>
                    </div>
                  </div>

                  {/* Test Code */}
                  <div className="test-code-section">
                    <span className="test-code-label">Code:</span>
                    <code className="test-code-value">{test.testCode || 'N/A'}</code>
                  </div>
                </div>

                {/* Actions */}
                <div className="test-card-actions">
                  {/* Preview Button - Available to both */}
                  <button 
                    onClick={() => handlePreview(test._id)}
                    disabled={isLoading}
                    className="btn-action btn-action-preview"
                  >
                    <Eye size={16} />
                    Preview
                  </button>

                  {/* Publish Button - Teachers only, Draft status */}
                  {isTeacher && isDraft && (
                    <button 
                      onClick={() => handlePublish(test._id)}
                      disabled={isLoading}
                      className="btn-action btn-action-publish"
                    >
                      {isLoading ? '⏳' : '🎉'} Publish
                    </button>
                  )}

                  {/* Delete Button - Teachers only */}
                  {isTeacher && (
                    <button 
                      onClick={() => handleDelete(test._id)}
                      disabled={isLoading}
                      className="btn-action btn-action-delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTests.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3 className="empty-title">
            {tests.length === 0 ? 'No Tests Yet' : `No ${filterStatus} Tests`}
          </h3>
          <p className="empty-description">
            {isTeacher 
              ? 'Create your first test to get started with your classroom.' 
              : 'No tests are available yet. Check back later!'}
          </p>
          {isTeacher && tests.length === 0 && (
            <button 
              onClick={() => navigate(`/classrooms/${classroom._id || classroom.id}/generate-test`)}
              className="btn-generate-test"
            >
              <Plus size={18} />
              Create First Test
            </button>
          )}
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
    </div>
  );
}
