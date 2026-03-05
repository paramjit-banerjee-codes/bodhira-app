import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, MoreVertical } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import TabNavigation from '../components/TabNavigation';
import OverviewTab from '../components/OverviewTab';
import AnnouncementsTab from '../components/AnnouncementsTab';
import MaterialsTab from '../components/MaterialsTab';
import AssignmentsTab from '../components/AssignmentsTab';
import StudentsTab from '../components/StudentsTab';
import TestsTab from '../components/TestsTab';
import AnalyticsTab from '../components/AnalyticsTab';
import ConfirmationModal from '../components/ConfirmationModal';
import { classroomAPI } from '../services/api';
import toast from '../utils/toast';
import '../styles/DesignSystem.css';
import './ClassroomPremium.css';

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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab classroom={classroom} isTeacher={isTeacher} />;
      case 'announcements':
        return <AnnouncementsTab classroom={classroom} isTeacher={isTeacher} />;
      case 'materials':
        return <MaterialsTab classroom={classroom} isTeacher={isTeacher} />;
      case 'assignments':
        return <AssignmentsTab classroom={classroom} isTeacher={isTeacher} />;
      case 'tests':
        return <TestsTab classroom={classroom} isTeacher={isTeacher} />;
      case 'students':
        return <StudentsTab classroom={classroom} isTeacher={isTeacher} onStudentAdded={handleStudentAdded} onStudentRemoved={handleStudentRemoved} />;
      case 'analytics':
        return <AnalyticsTab classroom={classroom} isTeacher={isTeacher} />;
      default:
        return <OverviewTab classroom={classroom} isTeacher={isTeacher} />;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="classroom-page-premium">
        <div className="container-premium section-premium">
          <div className="flex-center" style={{ minHeight: '60vh' }}>
            <div className="spinner-premium spinner-premium-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !classroom) {
    return (
      <div className="classroom-page-premium">
        <div className="container-premium section-premium">
          <div className="card-premium" style={{ textAlign: 'center', padding: 'var(--spacing-4xl)' }}>
            <h2 className="heading-2" style={{ color: 'var(--accent-danger)', marginBottom: 'var(--spacing-lg)' }}>
              {error || 'Classroom not found'}
            </h2>
            <button 
              className="btn-premium btn-premium-primary"
              onClick={() => navigate('/classrooms')}
            >
              <ArrowLeft size={18} />
              Back to Classrooms
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="classroom-page-premium">
      {/* Header */}
      <div className="classroom-header-premium">
        <div className="container-premium">
          <div className="header-content-flex">
            <button 
              className="btn-premium btn-premium-ghost"
              onClick={() => navigate('/classrooms')}
              style={{ marginRight: 'var(--spacing-lg)' }}
            >
              <ArrowLeft size={18} />
            </button>
            
            <div style={{ flex: 1 }}>
              <h1 className="heading-1" style={{ marginBottom: 'var(--spacing-xs)' }}>
                {classroom.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                <span className="badge-premium badge-info">
                  {classroom.subject || 'General'}
                </span>
                <span className="body-small" style={{ color: 'var(--text-tertiary)' }}>
                  @{classroom.handle}
                </span>
                {isTeacher && (
                  <span className="badge-premium badge-success">
                    Teacher
                  </span>
                )}
              </div>
            </div>

            {isTeacher && (
              <button 
                className="btn-premium btn-premium-danger"
                onClick={handleDeleteClassroom}
                disabled={deleteLoading}
              >
                <Trash2 size={18} />
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Content */}
      <div className="classroom-content-premium">
        {renderContent()}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
      )}
    </div>
  );
}
