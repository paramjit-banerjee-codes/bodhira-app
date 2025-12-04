import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classroomAPI } from '../services/api';
import toast from '../utils/toast';

export default function StudentsTabPremium({ classroom, isTeacher, onStudentAdded, onStudentRemoved }) {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentHandle, setNewStudentHandle] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  console.log('👥 StudentsTabPremium - isTeacher:', isTeacher, 'classroom:', classroom?.name);

  if (!classroom) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
        <p>Loading classroom...</p>
      </div>
    );
  }

  // CRITICAL: Students should never reach this component - redirect immediately
  if (!isTeacher) {
    console.warn('🔒 SECURITY: Non-teacher attempted to access StudentsTabPremium');
    return (
      <div style={{
        padding: '48px 32px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
        borderRadius: '16px',
        border: '2px solid rgba(59, 130, 246, 0.2)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
        <h3 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' }}>Teacher Only</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Only the teacher can manage classroom students.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchStudents();
  }, [classroom]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classroomAPI.getStudents(classroom._id);
      setStudents(response.data.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (userHandle) => {
    if (!classroom || !userHandle) return;

    setAddingStudent(true);
    try {
      console.log('📤 Adding student:', userHandle, 'to classroom:', classroom._id);
      // Send userHandle in the request body as expected by backend
      await classroomAPI.addStudent(classroom._id, { userHandle: userHandle.trim() });
      toast.success(`${userHandle} added to classroom`);
      await fetchStudents();
      if (onStudentAdded) onStudentAdded();
      setNewStudentHandle('');
      setShowAddModal(false);
    } catch (err) {
      console.error('❌ Error adding student:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || 'Failed to add student';
      toast.error(errorMsg);
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;

    setActionLoading(prev => ({ ...prev, [studentId]: true }));
    try {
      await classroomAPI.removeStudent(classroom._id, studentId);
      toast.success('Student removed');
      await fetchStudents();
      if (onStudentRemoved) onStudentRemoved();
      setConfirmRemove(null);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to remove student';
      toast.error(errorMsg);
    } finally {
      setActionLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.userHandle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Add Student Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: '2px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
        data-testid="add-student-card"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onClick={() => setShowAddModal(true)}
      >
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#10b981', margin: '0 0 4px 0' }}>Add New Student</h3>
          <p style={{ fontSize: '14px', color: '#6ee7b7', margin: 0 }}>Invite a student to join this classroom</p>
        </div>
        <div style={{ fontSize: '28px' }}>➕</div>
      </div>

      {/* Search Bar */}
      <div style={{
        position: 'relative',
      }}>
        <input
          type="text"
          placeholder="Search students by name or handle..."
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

      {/* Students List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
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
          {error}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 32px',
          background: 'rgba(30, 41, 59, 0.2)',
          borderRadius: '16px',
          border: '1px dashed rgba(148, 163, 184, 0.2)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#cbd5e1', margin: '0 0 8px 0' }}>No students yet</p>
          <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Add your first student to get started</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {filteredStudents.map((student, idx) => (
            <div
              key={student._id}
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.6) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                animation: `slide-up 0.4s ease-out ${idx * 0.05}s both`,
              }}
              onClick={() => navigate(`/classrooms/${classroom._id}/student/${student._id}`)}
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
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${['#60a5fa', '#10b981', '#f59e0b'][idx % 3]} 0%, ${['#3b82f6', '#059669', '#d97706'][idx % 3]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '18px',
                }}>
                  {student.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 2px 0' }}>
                    {student.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                    @{student.userHandle}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/classrooms/${classroom._id}/student/${student._id}`);
                  }}
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
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  }}
                >
                  👁️ View Profile
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveStudent(student._id);
                  }}
                  disabled={actionLoading[student._id]}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: '8px',
                    color: '#fb7185',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: actionLoading[student._id] ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: actionLoading[student._id] ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!actionLoading[student._id]) {
                      e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
                  }}
                >
                  {actionLoading[student._id] ? '⏳' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 8px 0' }}>Add Student</h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 24px 0' }}>Enter the student's username</p>

            <input
              type="text"
              placeholder="Enter student username..."
              value={newStudentHandle}
              onChange={(e) => setNewStudentHandle(e.target.value)}
              disabled={addingStudent}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '14px',
                marginBottom: '24px',
                boxSizing: 'border-box',
                opacity: addingStudent ? 0.6 : 1,
                cursor: addingStudent ? 'not-allowed' : 'text',
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  const userHandle = newStudentHandle.trim();
                  if (userHandle) {
                    handleAddStudent(userHandle);
                  }
                }}
                disabled={addingStudent || !newStudentHandle.trim()}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: addingStudent || !newStudentHandle.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: addingStudent || !newStudentHandle.trim() ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!addingStudent && newStudentHandle.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {addingStudent ? '⏳ Adding...' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewStudentHandle('');
                }}
                disabled={addingStudent}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'rgba(148, 163, 184, 0.1)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  color: '#cbd5e1',
                  fontWeight: '600',
                  cursor: addingStudent ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: addingStudent ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!addingStudent) {
                    e.currentTarget.style.background = 'rgba(148, 163, 184, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
