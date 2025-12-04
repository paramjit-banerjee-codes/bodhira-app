import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './ClassroomPremium.css';
import OverviewTab from '../components/OverviewTab';
import StudentsTab from '../components/StudentsTab';
import TestsTab from '../components/TestsTab';
import AnalyticsTab from '../components/AnalyticsTab';
import OverviewTabPremium from '../components/OverviewTabPremium';
import StudentsTabPremium from '../components/StudentsTabPremium';
import TestsTabPremium from '../components/TestsTabPremium';
import ConfirmationModal from '../components/ConfirmationModal';
import { classroomAPI } from '../services/api';
import toast from '../utils/toast';

export default function ClassroomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  console.log('🔍 ClassroomPage mounted, classroom ID:', id, 'user:', user?.name);

  // Fetch classroom data on mount
  useEffect(() => {
    console.log('📍 useEffect triggered with id:', id);
    if (!id) {
      setError('No classroom ID provided');
      setLoading(false);
      return;
    }
    fetchClassroom();
  }, [id]);

  const fetchClassroom = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching classroom with ID:', id);
      const response = await classroomAPI.getClassroom(id);
      console.log('✅ Full Classroom API response:', response.data);
      const data = response.data.data;
      console.log('✅ Classroom data received:', data);
      console.log('   - teacherId:', data?.teacherId, 'type:', typeof data?.teacherId);
      console.log('   - teacherName:', data?.teacherName);
      if (!data) {
        throw new Error('No classroom data in response');
      }
      setClassroom(data);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching classroom:', err.message, err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load classroom';
      setError(errorMsg);
      setClassroom(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClassroom = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await classroomAPI.deleteClassroom(id);
      toast.success('Classroom deleted successfully');
      setShowDeleteConfirm(false);
      navigate('/classrooms');
    } catch (err) {
      console.error('Failed to delete classroom:', err);
      const errorMsg = err.response?.data?.error || 'Failed to delete classroom';
      toast.error(errorMsg);
      setError(errorMsg);
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Callbacks to refresh classroom data when students are added/removed
  const handleStudentAdded = () => {
    console.log('📢 Student added callback triggered, refreshing classroom data');
    fetchClassroom();
  };

  const handleStudentRemoved = () => {
    console.log('📢 Student removed callback triggered, refreshing classroom data');
    fetchClassroom();
  };

  // Check if current user is the teacher
  const normalizeId = (id) => {
    if (!id) return null;
    return String(id).trim();
  };

  const classroomTeacherId = normalizeId(classroom?.teacherId);
  const currentUserId = normalizeId(user?._id);
  const isTeacher = classroomTeacherId && currentUserId && classroomTeacherId === currentUserId;
  
  // Comprehensive debug logging
  console.log('\n🎓 ===== TEACHER ROLE DETECTION DEBUG =====');
  console.log('Classroom:', {
    id: classroom?._id,
    name: classroom?.name,
    teacherId: classroom?.teacherId,
    teacherId_normalized: classroomTeacherId
  });
  console.log('Current User:', {
    id: user?._id,
    name: user?.name,
    _id_normalized: currentUserId
  });
  console.log('Comparison:', {
    'classroomTeacherId === currentUserId': classroomTeacherId === currentUserId,
    'isTeacher': isTeacher
  });
  
  if (isTeacher) {
    console.log('✅ TEACHER VIEW - All teacher features should be visible (Delete, Manage Students, Create Test, Publish, etc.)');
  } else if (classroom && user) {
    console.log('❌ STUDENT VIEW - Only student features should be visible (Preview, Take Test, etc.)');
  } else {
    console.log('⚠️ LOADING - Waiting for classroom and user data');
  }
  console.log('==========================================\n');

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    ...(isTeacher ? [{ id: 'students', label: '👥 Students' }] : []),
    { id: 'tests', label: '📝 Tests' },
    ...(isTeacher ? [{ id: 'analytics', label: '📈 Analytics' }] : [])
  ];

  const renderContent = () => {
    try {
      console.log('🎨 Rendering content for tab:', activeTab);
      switch (activeTab) {
        case 'overview':
          return <OverviewTabPremium classroom={classroom} isTeacher={isTeacher} />;
        case 'students':
          return <StudentsTabPremium classroom={classroom} isTeacher={isTeacher} onStudentAdded={handleStudentAdded} onStudentRemoved={handleStudentRemoved} />;
        case 'tests':
          return <TestsTabPremium classroom={classroom} isTeacher={isTeacher} />;
        case 'analytics':
          return <AnalyticsTab classroom={classroom} isTeacher={isTeacher} />;
        default:
          return <OverviewTabPremium classroom={classroom} isTeacher={isTeacher} />;
      }
    } catch (err) {
      console.error('❌ renderContent error for tab', activeTab, ':', err);
      return (
        <div className="classroom-error">
          <p>Error rendering {activeTab} tab: {err.message}</p>
        </div>
      );
    }
  };

  return (
    <div className="classroom-container">
      <div className="classroom-bg-glow"></div>
      
      {/* Loading State */}
      {loading && (
        <div className="classroom-main">
          <div className="classroom-loading">
            <div className="skeleton-loader skeleton-header"></div>
            <div className="skeleton-loader skeleton-card"></div>
            <div className="skeleton-loader skeleton-card"></div>
            <div className="skeleton-loader skeleton-line" style={{ width: '80%' }}></div>
            <div className="skeleton-loader skeleton-line" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="classroom-main">
          <div className="classroom-error">
            <p>{error}</p>
            <button
              onClick={() => navigate('/classrooms')}
              className="btn-premium btn-premium-primary"
              style={{ marginTop: '16px' }}
            >
              ← Back to Classrooms
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !classroom && (
        <div className="classroom-main">
          <div className="classroom-empty-state">
            <div className="classroom-empty-icon">📁</div>
            <h3 className="classroom-empty-title">Classroom not found</h3>
            <p className="classroom-empty-desc">This classroom may have been deleted or you don't have access to it.</p>
            <button
              onClick={() => navigate('/classrooms')}
              className="btn-premium btn-premium-primary"
            >
              ← Back to Classrooms
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && classroom && (
        <div className="classroom-main">
          {/* Header */}
          <div className="classroom-header">
            <div className="classroom-header-top">
              <button
                onClick={() => navigate('/classrooms')}
                className="classroom-back-btn"
                title="Back to Classrooms"
              >
                ←
              </button>
              <div className="classroom-header-content">
                <h1 className="classroom-title">{classroom.name}</h1>
                <p className="classroom-subtitle">
                  <span>📚 Subject: {classroom.subject || 'Not specified'}</span>
                  <span className="classroom-badge">@{classroom.handle}</span>
                  {isTeacher && <span className="classroom-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#6ee7b7' }}>🔑 Teacher</span>}
                </p>
              </div>
            </div>
            {isTeacher && (
              <div className="classroom-header-actions">
                <button 
                  className="btn-delete-classroom"
                  onClick={handleDeleteClassroom}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? '⏳ Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="classroom-tabs-container">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`classroom-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Summary Card - Top */}
          <div className="classroom-sidebar classroom-sidebar-top">
            <div className="classroom-summary-card">
              <h3 className="classroom-summary-title">📊 Summary</h3>
              <div className="classroom-stat-item">
                <span className="classroom-stat-label">Total Students</span>
                <span className="classroom-stat-value">{classroom.totalStudents || 0}</span>
              </div>
              <div className="classroom-stat-item">
                <span className="classroom-stat-label">Total Tests</span>
                <span className="classroom-stat-value">{classroom.totalTests || 0}</span>
              </div>
              <div className="classroom-stat-item">
                <span className="classroom-stat-label">Class Avg Score</span>
                <span className="classroom-stat-value">{classroom.avgScore || 0}%</span>
              </div>
              <div className="classroom-stat-item">
                <span className="classroom-stat-label">Handle</span>
                <span className="classroom-stat-value" style={{ fontSize: '14px' }}>@{classroom.handle}</span>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="classroom-content">
            <div className="classroom-main-content">
              {renderContent()}
            </div>
          </div>
        </div>
      )}

      {/* Delete Classroom Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Classroom?"
        message="This will permanently delete this classroom and all associated data. This action cannot be undone."
        confirmText="Delete Classroom"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={deleteLoading}
        isDangerous={true}
      />
    </div>
  );
}
