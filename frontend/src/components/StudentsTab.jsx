import { useState, useEffect } from 'react';
import { UserPlus, Users, Search, TrendingUp, AlertTriangle } from 'lucide-react';
import AddStudentModal from './AddStudentModal';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import { classroomAPI } from '../services/api';
import toast from '../utils/toast';
import './StudentsTab.css';

export default function StudentsTab({ classroom, isTeacher, onStudentAdded, onStudentRemoved }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // all | active | needsAttention
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [confirmRemove, setConfirmRemove] = useState(null);

  // Debug logging for role detection
  console.log('\n👥 ===== STUDENTS TAB ROLE CHECK =====');
  console.log('Received Props:', {
    classroom: classroom?._id,
    isTeacher,
    classroomName: classroom?.name
  });
  console.log('Teacher UI Visibility:', {
    shouldShow: isTeacher,
    'Add Student': isTeacher ? '✅ VISIBLE' : '❌ HIDDEN',
    'Remove Button': isTeacher ? '✅ VISIBLE' : '❌ HIDDEN'
  });
  console.log('=======================================\n');

  useEffect(() => {
    if (classroom) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroom]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!classroom?.id && !classroom?._id) {
        throw new Error('Classroom ID is missing');
      }
      const classroomId = classroom.id || classroom._id;
      console.log('📍 Fetching students for classroom:', classroomId);
      const resp = await classroomAPI.getStudents(classroomId);
      console.log('✅ Students API response:', resp);
      const data = resp?.data?.data || resp?.data || [];
      console.log('📊 Processed students data:', data);
      if (!Array.isArray(data)) {
        console.warn('⚠️ Students data is not an array:', data);
        setStudents([]);
      } else {
        setStudents(data);
      }
    } catch (err) {
      console.error('❌ StudentsTab.fetchStudents error:', err.message, err.response?.data || err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to fetch students';
      setError(errorMsg);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (data) => {
    try {
      const classroomId = classroom.id || classroom._id;
      setError(null);
      // Expecting { userHandle }
      const payload = { userHandle: data.userHandle };
      console.log('Adding student to classroom', classroomId, payload);
      const resp = await classroomAPI.addStudent(classroomId, payload);
      const added = resp?.data?.data;
      if (added) {
        toast.success('Student added successfully');
        // Refresh the students list from server to ensure real profile data
        await fetchStudents();
        // Notify parent to refresh classroom data (updates totalStudents count)
        if (onStudentAdded) {
          onStudentAdded();
        }
        setShowAddModal(false);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Error adding student:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to add student';
      setError(errorMsg);
      toast.error(errorMsg);
      // rethrow so modal can handle it if needed
      throw err;
    }
  };

  const handleRemoveStudent = async (student) => {
    setConfirmRemove(student);
  };

  const confirmRemoveStudent = async () => {
    if (!confirmRemove) return;
    
    try {
      setActionLoading({ ...actionLoading, [confirmRemove._id]: true });
      const classroomId = classroom.id || classroom._id;
      await classroomAPI.removeStudent(classroomId, confirmRemove._id);
      setStudents(students.filter(s => s._id !== confirmRemove._id));
      toast.success('Student removed successfully');
      if (onStudentRemoved) {
        onStudentRemoved();
      }
      setError(null);
      setConfirmRemove(null);
    } catch (err) {
      console.error('Failed to remove student:', err);
      const errorMsg = err.response?.data?.error || 'Failed to remove student';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionLoading({ ...actionLoading, [confirmRemove._id]: false });
    }
  };

  const handleViewProgress = (student) => {
    // Navigate to student progress page
    window.location.href = `/student/${student._id}/progress`;
  };

  // Filter logic with search
  const filteredStudents = students.filter((student) => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const name = (student.name || '').toLowerCase();
      const handle = (student.handle || student.username || '').toLowerCase();
      if (!name.includes(query) && !handle.includes(query)) {
        return false;
      }
    }

    // Mode filter
    if (filterMode === 'all') return true;
    if (filterMode === 'active') return true; // All are active by default
    if (filterMode === 'needsAttention') return (student.avgScore || 0) < 60; // Below 60%
    return true;
  });

  const stats = {
    all: students.length,
    active: students.length,
    needsAttention: students.filter(s => (s.avgScore || 0) < 60).length
  };

  const avgScore = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.avgScore || 0), 0) / students.length)
    : 0;

  const totalTests = students.reduce((sum, s) => sum + (s.testsCompleted || s.testsTaken || 0), 0);

  // Early returns for loading/error/no access
  if (!classroom) {
    return <LoadingSkeleton type="content" />;
  }

  if (!isTeacher) {
    return (
      <EmptyState
        icon={Users}
        title="Students"
        description="Only the teacher can manage classroom students."
      />
    );
  }

  return (
    <div className="students-tab-premium">
      {/* Header */}
      <div className="students-header-premium">
        <div className="students-header-left">
          <h2>Students</h2>
          <p>Manage and monitor student progress in {classroom.name}</p>
        </div>
        
        {isTeacher && (
          <button 
            className="btn-premium btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus size={18} />
            Add Student
          </button>
        )}
      </div>

      {/* Search and Filter Toolbar */}
      <div className="students-toolbar-premium">
        {/* Search */}
        <div className="students-search-wrapper">
          <Search className="students-search-icon" size={18} />
          <input
            type="text"
            placeholder="Search students by name or handle..."
            className="students-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="students-filter-tabs-premium">
          {[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'needsAttention', label: 'Needs Attention' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterMode(tab.value)}
              className={`students-filter-tab-premium ${filterMode === tab.value ? 'active' : ''}`}
            >
              {tab.label}
              <span className="filter-count-badge">{stats[tab.value]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="students-stats-bar-premium">
        <div className="students-stat-item-premium">
          <div className="students-stat-icon-premium primary">
            <Users size={24} color="white" />
          </div>
          <div className="students-stat-content">
            <span className="students-stat-label">Total Students</span>
            <span className="students-stat-value">{students.length}</span>
          </div>
        </div>

        <div className="students-stat-item-premium">
          <div className="students-stat-icon-premium success">
            <TrendingUp size={24} color="white" />
          </div>
          <div className="students-stat-content">
            <span className="students-stat-label">Average Score</span>
            <span className="students-stat-value">{avgScore}%</span>
          </div>
        </div>

        <div className="students-stat-item-premium">
          <div className="students-stat-icon-premium warning">
            <AlertTriangle size={24} color="white" />
          </div>
          <div className="students-stat-content">
            <span className="students-stat-label">Total Tests Taken</span>
            <span className="students-stat-value">{totalTests}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="students-error-premium">
          <div className="students-error-title">⚠️ Error</div>
          <p className="students-error-message">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSkeleton type="grid" count={6} />}

      {/* Students Grid */}
      {!loading && filteredStudents.length > 0 && (
        <div className="students-grid-premium">
          {filteredStudents.map((student) => (
            <StudentCardPremium
              key={student._id || student.id}
              student={student}
              onViewProgress={handleViewProgress}
              onRemove={isTeacher ? handleRemoveStudent : null}
              loading={actionLoading[student._id]}
              isTeacher={isTeacher}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredStudents.length === 0 && (
        <EmptyState
          icon={Users}
          title={students.length === 0 ? 'No Students Yet' : 'No Students Found'}
          description={
            students.length === 0
              ? 'Add your first student to the classroom to get started.'
              : searchQuery.trim()
              ? `No students match "${searchQuery}"`
              : 'Try a different filter to see more students.'
          }
          action={
            students.length === 0 && isTeacher
              ? {
                  label: 'Add First Student',
                  icon: UserPlus,
                  onClick: () => setShowAddModal(true)
                }
              : undefined
          }
        />
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddStudent}
          onError={(msg) => setError(msg)}
        />
      )}

      {/* Confirmation Dialog */}
      {confirmRemove && (
        <>
          <div className="confirm-dialog-overlay" onClick={() => setConfirmRemove(null)} />
          <div className="confirm-dialog-container">
            <div className="confirm-dialog-premium">
              <h3 className="confirm-dialog-title">Remove Student?</h3>
              <p className="confirm-dialog-message">
                Are you sure you want to remove <strong>{confirmRemove.name}</strong> from this classroom? 
                This action cannot be undone.
              </p>
              <div className="confirm-dialog-actions">
                <button 
                  className="btn-premium btn-secondary"
                  onClick={() => setConfirmRemove(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-premium btn-danger"
                  onClick={confirmRemoveStudent}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Premium Student Card Component
function StudentCardPremium({ student, onViewProgress, onRemove, loading, isTeacher }) {
  if (!student) return null;

  const name = student.name || 'Unknown';
  const handle = student.handle || student.username || 'unknown';
  const testsCompleted = student.testsCompleted || student.testsTaken || 0;
  const avgScore = student.avgScore || 0;
  const enrolledDate = student.enrolledDate 
    ? new Date(student.enrolledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  // Determine progress bar color and status
  let progressClass = 'high';
  let scoreColorClass = 'success';
  if (avgScore < 60) {
    progressClass = 'low';
    scoreColorClass = 'danger';
  } else if (avgScore < 80) {
    progressClass = 'medium';
    scoreColorClass = 'warning';
  }

  // Generate avatar from initials
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="student-card-premium">
      {/* Header */}
      <div className="student-card-header-premium">
        <div className="student-avatar-premium">{initials}</div>
        <div className="student-info-premium">
          <h3 className="student-name-premium">{name}</h3>
          <p className="student-handle-premium">@{handle}</p>
          <span className="student-enrolled-badge">
            📅 {enrolledDate}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="student-stats-grid-premium">
        <div className="student-stat-box-premium">
          <span className="student-stat-label-premium">Tests</span>
          <span className="student-stat-value-premium">{testsCompleted}</span>
        </div>
        <div className="student-stat-box-premium">
          <span className="student-stat-label-premium">Avg Score</span>
          <span className={`student-stat-value-premium ${scoreColorClass}`}>
            {avgScore}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="student-progress-section-premium">
        <div className="student-progress-header">
          <span className="student-progress-label">Performance</span>
          <span className="student-progress-percentage">{avgScore}%</span>
        </div>
        <div className="student-progress-bar-premium">
          <div 
            className={`student-progress-fill-premium ${progressClass}`}
            style={{ width: `${avgScore}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="student-actions-premium">
        <button
          onClick={() => onViewProgress && onViewProgress(student)}
          disabled={loading}
          className="student-action-btn-premium"
          title="View student progress"
        >
          <TrendingUp size={16} />
          View Progress
        </button>
        {isTeacher && onRemove && (
          <button
            onClick={() => onRemove && onRemove(student)}
            disabled={loading}
            className="student-action-btn-premium danger"
            title="Remove student from classroom"
          >
            <AlertTriangle size={16} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
