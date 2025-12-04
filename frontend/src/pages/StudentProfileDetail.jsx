import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classroomAPI, profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentProfileDetail() {
  const { classroomId, studentId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [classroom, setClassroom] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [classroomId, studentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch classroom
      const classroomRes = await classroomAPI.getClassroom(classroomId);
      setClassroom(classroomRes.data.data);

      // Fetch students to find this specific student
      const studentsRes = await classroomAPI.getStudents(classroomId);
      const studentData = studentsRes.data.data.find(s => s._id === studentId);
      
      if (!studentData) {
        setError('Student not found in this classroom');
        return;
      }

      setStudent(studentData);

      // Always fetch student progress/stats from the endpoint
      try {
        const progressRes = await classroomAPI.getStudentProgress(classroomId, studentId);
        console.log('📊 Student progress response:', progressRes.data.data);
        setStudentStats(progressRes.data.data || {});
      } catch (err) {
        console.error('❌ Failed to fetch student progress:', err);
        // Even if progress fetch fails, we have the student data
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError(err.response?.data?.error || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ maxWidth: 1200, paddingTop: 30, paddingBottom: 60 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(148, 163, 184, 0.1)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            color: '#cbd5e1',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '30px',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          ← Back
        </button>

        {/* Hero Section Skeleton */}
        <div style={{
          background: `linear-gradient(90deg, rgba(148, 163, 184, 0.1) 0%, rgba(148, 163, 184, 0.05) 50%, rgba(148, 163, 184, 0.1) 100%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
          border: `1px solid rgba(148, 163, 184, 0.2)`,
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '40px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '200px',
        }}>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* Avatar Skeleton */}
            <div style={{
              width: '120px',
              height: '120px',
              minWidth: '120px',
              borderRadius: '20px',
              background: 'rgba(148, 163, 184, 0.2)',
              animation: 'shimmer 2s infinite',
            }} />

            {/* Text Skeleton */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(148, 163, 184, 0.2)',
                animation: 'shimmer 2s infinite',
                width: '60%',
              }} />
              <div style={{
                height: '16px',
                borderRadius: '8px',
                background: 'rgba(148, 163, 184, 0.2)',
                animation: 'shimmer 2s infinite',
                width: '40%',
              }} />
              <div style={{
                height: '16px',
                borderRadius: '8px',
                background: 'rgba(148, 163, 184, 0.2)',
                animation: 'shimmer 2s infinite',
                width: '50%',
              }} />
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              background: `linear-gradient(90deg, rgba(148, 163, 184, 0.1) 0%, rgba(148, 163, 184, 0.05) 50%, rgba(148, 163, 184, 0.1) 100%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              minHeight: '160px',
            }} />
          ))}
        </div>

        {/* Performance Analysis Skeleton */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {[1, 2].map((i) => (
            <div key={i} style={{
              background: `linear-gradient(90deg, rgba(148, 163, 184, 0.1) 0%, rgba(148, 163, 184, 0.05) 50%, rgba(148, 163, 184, 0.1) 100%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '16px',
              padding: '28px',
              minHeight: '300px',
            }} />
          ))}
        </div>

        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ maxWidth: 1200, paddingTop: 30, paddingBottom: 60 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(148, 163, 184, 0.1)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            color: '#cbd5e1',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '30px',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          ← Back
        </button>
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
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container" style={{ maxWidth: 1200, paddingTop: 30, paddingBottom: 60 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(148, 163, 184, 0.1)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            color: '#cbd5e1',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '30px',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          ← Back
        </button>
        <p style={{ color: '#94a3b8' }}>Student not found</p>
      </div>
    );
  }

  const avatarColor = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'][Math.floor(Math.random() * 6)];
  const initials = student.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'ST';

  const stats = studentStats || {};
  // Backend returns: { stats: { totalTests, avgScore, totalAttempts }, strengths, weaknesses, ... }
  const totalTests = stats?.stats?.totalTests || 0;
  const avgScore = stats?.stats?.avgScore || 0;
  const totalAttempts = stats?.stats?.totalAttempts || 0;
  const strengths = stats?.strengths || [];
  const weaknesses = stats?.weaknesses || [];

  console.log('📊 Stats from state:', stats);
  console.log('📊 Stats nested:', stats?.stats);

  return (
    <div className="container" style={{ maxWidth: 1200, paddingTop: 30, paddingBottom: 60 }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'rgba(148, 163, 184, 0.1)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          color: '#cbd5e1',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '30px',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
        }}
      >
        ← Back to {classroom?.name || 'Classroom'}
      </button>

      {/* Hero Section */}
      <div style={{
        background: `linear-gradient(135deg, ${avatarColor}22 0%, ${avatarColor}11 100%)`,
        border: `1px solid ${avatarColor}33`,
        borderRadius: '20px',
        padding: '40px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, background: `radial-gradient(circle, ${avatarColor}15 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{
            width: '120px',
            height: '120px',
            minWidth: '120px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${avatarColor} 0%, ${avatarColor}dd 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '48px',
            fontWeight: '800',
            boxShadow: `0 20px 50px ${avatarColor}44`,
            border: `3px solid ${avatarColor}66`,
          }}>
            {initials}
          </div>

          {/* Student Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 8px 0' }}>
              {student.name}
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 16px 0' }}>
              @{student.userHandle}
            </p>
            <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '0 0 20px 0' }}>
              Enrolled in <span style={{ fontWeight: '700', color: '#60a5fa' }}>{classroom?.name}</span>
            </p>
            {student.enrolledDate && (
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                Joined {new Date(student.enrolledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '40px',
      }}>
        {/* Tests Completed */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          cursor: 'default',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
          <p style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 8px 0' }}>Tests in Classroom</p>
          <p style={{ fontSize: '36px', fontWeight: '800', color: '#60a5fa', margin: 0 }}>{totalTests}</p>
        </div>

        {/* Average Score */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          cursor: 'default',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
          <p style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 8px 0' }}>Average Score</p>
          <p style={{ fontSize: '36px', fontWeight: '800', color: '#10b981', margin: 0 }}>
            {avgScore ? `${Math.round(avgScore)}%` : '—'}
          </p>
        </div>

        {/* Total Attempts */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          cursor: 'default',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(168, 85, 247, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
          <p style={{ fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', margin: '0 0 8px 0' }}>Attempts</p>
          <p style={{ fontSize: '36px', fontWeight: '800', color: '#a855f7', margin: 0 }}>
            {totalAttempts}
          </p>
        </div>
      </div>

      {/* Performance Analysis */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
      }}>
        {/* Strengths */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.6) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px',
          padding: '28px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#e2e8f0', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💪 Strength Areas
          </h3>

          {strengths && strengths.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {strengths.map((strength, idx) => (
                <div key={idx} style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{ fontSize: '18px' }}>✓</span>
                  <span style={{ color: '#cbd5e1', fontWeight: '600', fontSize: '14px' }}>
                    {strength}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>No data available yet</p>
          )}
        </div>

        {/* Weak Areas */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.6) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px',
          padding: '28px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#e2e8f0', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎯 Areas to Improve
          </h3>

          {weaknesses && weaknesses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {weaknesses.map((weakness, idx) => (
                <div key={idx} style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{ fontSize: '18px' }}>⚡</span>
                  <span style={{ color: '#cbd5e1', fontWeight: '600', fontSize: '14px' }}>
                    {weakness}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>No data available yet</p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
