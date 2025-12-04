import { useState, useEffect } from 'react';
import { UserPlus, Users } from 'lucide-react';
import StudentCard from './StudentCard';
import AddStudentModal from './AddStudentModal';
import { classroomAPI } from '../services/api';
import toast from '../utils/toast';
import '../pages/GenerateTest.css';
import './ClassroomStudents.css';

export default function StudentsTab({ classroom, isTeacher, onStudentAdded, onStudentRemoved }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // all | active | needsAttention
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

  if (!classroom) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>Loading classroom...</p>
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
        <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', margin: '0 0 1rem 0' }}>👥 Students</h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0' }}>Only the teacher can manage classroom students.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchStudents();
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
      // Notify parent to refresh classroom data (updates totalStudents count)
      if (onStudentRemoved) {
        onStudentRemoved();
      }
      setError(null);
      setConfirmRemove(null);
    } catch (err) {
      console.error('Failed to remove student:', err);
      setError(err.response?.data?.error || 'Failed to remove student');
    } finally {
      setActionLoading({ ...actionLoading, [confirmRemove._id]: false });
    }
  };

  const handleViewProgress = (student) => {
    // Navigate to student progress page
    window.location.href = `/student/${student._id}/progress`;
  };

  // Filter logic
  const filteredStudents = students.filter((student) => {
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

  return (
    <div className="classroom-students-container">
      {/* Header Section */}
      <div className="classroom-students-header">
        <div>
          <h2 className="classroom-students-title">{classroom.name || 'Classroom'} - Students</h2>
          <p className="classroom-students-subtitle">Manage and monitor student progress</p>
        </div>

        {/* Add Student Section - Teachers Only */}
        {isTeacher && (
          <div className="add-student-section">
            <form className="add-student-form" onSubmit={(e) => {
              e.preventDefault();
              setShowAddModal(true);
            }}>
              <label>
                <span className="add-student-label-text">Student Handle</span>
                <input 
                  type="text"
                  placeholder="@username_#### or username"
                  className="add-student-input"
                  onClick={() => setShowAddModal(true)}
                  readOnly
                />
              </label>
              <button 
                type="button"
                onClick={() => setShowAddModal(true)}
                className="btn-add-student"
              >
                <UserPlus size={16} />
                Add Student
              </button>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="students-filter-tabs">
          {[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'needsAttention', label: 'Needs Attention' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterMode(tab.value)}
              className={`students-filter-tab ${filterMode === tab.value ? 'active' : ''}`}
            >
              {tab.label}
              <span className="filter-count">({stats[tab.value]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="students-error">
          <div className="students-error-title">⚠️ Error</div>
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="students-loading">
          <div className="students-loading-spinner"></div>
          <p>Loading students...</p>
        </div>
      )}

      {/* Students Grid */}
      {!loading && filteredStudents.length > 0 && (
        <div className="students-grid">
          {filteredStudents.map((student) => (
            <StudentCard
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
        <div className="students-empty-state">
          <div className="students-empty-state-icon">👥</div>
          <h3 className="students-empty-state-title">
            {students.length === 0 ? 'No Students Yet' : 'No Students in this Filter'}
          </h3>
          <p className="students-empty-state-description">
            {students.length === 0
              ? 'Add your first student to the classroom to get started.'
              : 'Try a different filter to see more students.'}
          </p>
          {students.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="students-empty-state-action"
            >
              <UserPlus size={16} />
              Add First Student
            </button>
          )}
        </div>
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
        <div className="confirm-dialog">
          <div className="confirm-dialog-content">
            <h3 className="confirm-dialog-title">Remove Student?</h3>
            <p className="confirm-dialog-message">
              Are you sure you want to remove <strong>{confirmRemove.name}</strong> from this classroom? This action cannot be undone.
            </p>
            <div className="confirm-dialog-actions">
              <button 
                className="btn-confirm btn-confirm-cancel"
                onClick={() => setConfirmRemove(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm btn-confirm-delete"
                onClick={confirmRemoveStudent}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
