import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Plus, Search, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { classroomAPI, testAPI } from '../services/api';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import toast from '../utils/toast';
import './TestsTab.css';

export default function TestsTab({ classroom, isTeacher }) {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    if (classroom) {
      fetchTests();
    }
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
    if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return;
    }
    
    try {
      console.log('🗑️ Delete clicked for test:', testId);
      setActionLoading({ ...actionLoading, [testId]: true });
      const response = await testAPI.deleteTest(testId);
      console.log('✅ Delete successful, response:', response);
      toast.success('Test deleted successfully');
      await fetchTests();
    } catch (err) {
      console.error('❌ Failed to delete test:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete test';
      setError(errorMsg);
      toast.error(errorMsg);
      await fetchTests();
    } finally {
      setActionLoading({ ...actionLoading, [testId]: false });
    }
  };

  const handlePreview = (testId) => {
    console.log('👁️ Preview clicked for test:', testId);
    window.location.href = `/test/${testId}/preview`;
  };

  // Filter logic with search
  const filteredTests = tests.filter((test) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = (test.title || test.topic || '').toLowerCase();
      const topic = (test.topic || '').toLowerCase();
      const code = (test.testCode || '').toLowerCase();
      if (!title.includes(query) && !topic.includes(query) && !code.includes(query)) {
        return false;
      }
    }

    // Status filter
    if (filterStatus === 'all') return true;
    return test.status === filterStatus;
  });

  const stats = {
    all: tests.length,
    published: tests.filter((t) => t.status === 'published').length,
    draft: tests.filter((t) => t.status === 'draft').length,
  };

  const avgCompletionRate = tests.length > 0
    ? Math.round(tests.reduce((sum, t) => sum + (t.completionRate || 0), 0) / tests.length)
    : 0;

  const totalQuestions = tests.reduce((sum, t) => sum + (t.totalQuestions || t.questions?.length || 0), 0);

  // Early returns
  if (!classroom) {
    return <LoadingSkeleton type="content" />;
  }

  return (
    <div className="tests-tab-premium">
      {/* Header */}
      <div className="tests-header-premium">
        <div className="tests-header-left">
          <h2>Tests</h2>
          <p>
            {isTeacher 
              ? `Create and manage tests for ${classroom.name}` 
              : `Take tests assigned by your teacher`}
          </p>
        </div>
        
        {isTeacher && (
          <button 
            className="btn-premium btn-primary"
            onClick={() => navigate(`/classrooms/${classroom._id || classroom.id}/generate-test`)}
          >
            <Plus size={18} />
            Create Test
          </button>
        )}
      </div>

      {/* Search and Filter Toolbar */}
      <div className="tests-toolbar-premium">
        {/* Search */}
        <div className="tests-search-wrapper">
          <Search className="tests-search-icon" size={18} />
          <input
            type="text"
            placeholder="Search tests by title, topic, or code..."
            className="tests-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="tests-filter-tabs-premium">
          {[
            { value: 'all', label: 'All' },
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`tests-filter-tab-premium ${filterStatus === tab.value ? 'active' : ''}`}
            >
              {tab.label}
              <span className="filter-count-badge">{stats[tab.value]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      {isTeacher && (
        <div className="tests-stats-bar-premium">
          <div className="tests-stat-item-premium">
            <div className="tests-stat-icon-premium primary">
              <FileText size={24} color="white" />
            </div>
            <div className="tests-stat-content">
              <span className="tests-stat-label">Total Tests</span>
              <span className="tests-stat-value">{tests.length}</span>
            </div>
          </div>

          <div className="tests-stat-item-premium">
            <div className="tests-stat-icon-premium success">
              <CheckCircle size={24} color="white" />
            </div>
            <div className="tests-stat-content">
              <span className="tests-stat-label">Published</span>
              <span className="tests-stat-value">{stats.published}</span>
            </div>
          </div>

          <div className="tests-stat-item-premium">
            <div className="tests-stat-icon-premium warning">
              <Clock size={24} color="white" />
            </div>
            <div className="tests-stat-content">
              <span className="tests-stat-label">Total Questions</span>
              <span className="tests-stat-value">{totalQuestions}</span>
            </div>
          </div>

          <div className="tests-stat-item-premium">
            <div className="tests-stat-icon-premium info">
              <TrendingUp size={24} color="white" />
            </div>
            <div className="tests-stat-content">
              <span className="tests-stat-label">Avg Completion</span>
              <span className="tests-stat-value">{avgCompletionRate}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="tests-error-premium">
          <div className="tests-error-title">⚠️ Error</div>
          <p className="tests-error-message">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSkeleton type="grid" count={6} />}

      {/* Tests Grid */}
      {!loading && filteredTests.length > 0 && (
        <div className="tests-grid-premium">
          {filteredTests.map((test) => (
            <TestCardPremium
              key={test._id}
              test={test}
              isTeacher={isTeacher}
              isLoading={actionLoading[test._id]}
              onPreview={handlePreview}
              onPublish={handlePublish}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTests.length === 0 && (
        <EmptyState
          icon={FileText}
          title={tests.length === 0 ? 'No Tests Yet' : 'No Tests Found'}
          description={
            tests.length === 0
              ? isTeacher
                ? 'Create your first test to get started with your classroom.'
                : 'No tests are available yet. Check back later!'
              : searchQuery.trim()
              ? `No tests match "${searchQuery}"`
              : `No ${filterStatus} tests found. Try a different filter.`
          }
          action={
            tests.length === 0 && isTeacher
              ? {
                  label: 'Create First Test',
                  icon: Plus,
                  onClick: () => navigate(`/classrooms/${classroom._id || classroom.id}/generate-test`)
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

// Premium Test Card Component
function TestCardPremium({ test, isTeacher, isLoading, onPreview, onPublish, onDelete }) {
  const isDraft = test.status === 'draft';
  const isPublished = test.status === 'published';

  const difficulty = test.difficulty || 'medium';
  const totalQuestions = test.totalQuestions || test.questions?.length || 0;
  const duration = test.duration || 30;
  const avgScore = test.avgScore || 0;
  const completionRate = test.completionRate || 0;
  const attemptCount = test.attemptCount || 0;

  return (
    <div className={`test-card-premium ${test.status}`}>
      {/* Header */}
      <div className="test-card-header-premium">
        <div className="test-card-title-section">
          <h3 className="test-card-title-premium">
            {test.title || test.topic || 'Untitled Test'}
          </h3>
          {test.topic && test.topic !== (test.title || test.topic) && (
            <p className="test-card-topic-premium">{test.topic}</p>
          )}
        </div>
        
        <div className={`test-status-badge-premium ${test.status}`}>
          {isPublished && (
            <>
              <CheckCircle size={12} />
              Published
            </>
          )}
          {isDraft && (
            <>
              <Clock size={12} />
              Draft
            </>
          )}
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="test-metadata-grid-premium">
        <div className="test-metadata-item-premium">
          <span className="test-metadata-label-premium">Difficulty</span>
          <span className={`test-metadata-value-premium ${difficulty}`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </div>
        <div className="test-metadata-item-premium">
          <span className="test-metadata-label-premium">Questions</span>
          <span className="test-metadata-value-premium">{totalQuestions}</span>
        </div>
        <div className="test-metadata-item-premium">
          <span className="test-metadata-label-premium">Duration</span>
          <span className="test-metadata-value-premium">{duration}m</span>
        </div>
      </div>

      {/* Test Code */}
      <div className="test-code-section-premium">
        <span className="test-code-label-premium">Test Code</span>
        <code className="test-code-value-premium">{test.testCode || 'N/A'}</code>
      </div>

      {/* Analytics Preview - Only for published tests */}
      {isTeacher && isPublished && (
        <div className="test-analytics-preview-premium">
          <div className="test-analytics-row">
            <span className="test-analytics-label">Attempts</span>
            <span className="test-analytics-value">{attemptCount}</span>
          </div>
          <div className="test-analytics-row">
            <span className="test-analytics-label">Avg Score</span>
            <span className="test-analytics-value">{avgScore}%</span>
          </div>
          <div className="test-analytics-row">
            <span className="test-analytics-label">Completion Rate</span>
            <span className="test-analytics-value">{completionRate}%</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="test-actions-premium">
        <button 
          onClick={() => onPreview(test._id)}
          disabled={isLoading}
          className="test-action-btn-premium primary"
        >
          <Eye size={16} />
          Preview
        </button>

        {isTeacher && isDraft && (
          <button 
            onClick={() => onPublish(test._id)}
            disabled={isLoading}
            className="test-action-btn-premium success"
          >
            <CheckCircle size={16} />
            Publish
          </button>
        )}

        {isTeacher && (
          <button 
            onClick={() => onDelete(test._id)}
            disabled={isLoading}
            className="test-action-btn-premium danger"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
