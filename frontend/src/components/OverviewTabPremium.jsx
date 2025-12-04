import { useState, useEffect } from 'react';
import { classroomAPI } from '../services/api';

export default function OverviewTab({ classroom, isTeacher }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch additional stats if available
        const response = await classroomAPI.getClassroom(classroom._id);
        setStats(response.data.data);
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };
    if (classroom) loadStats();
  }, [classroom]);

  if (!classroom) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
        <p>Loading classroom data...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Classroom Hero Card with Accent */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.25)',
        border: '1px solid rgba(148, 163, 184, 0.08)',
        borderRadius: '20px',
        borderTop: '4px solid #60a5fa',
        padding: '40px 48px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#f1f5f9',
            margin: 0,
            marginBottom: '12px',
            letterSpacing: '-0.5px',
          }}>
            {classroom.name}
          </h2>

          {classroom.description && (
            <p style={{
              fontSize: '16px',
              color: '#cbd5e1',
              margin: '0 0 20px 0',
              lineHeight: '1.6',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}>
              {classroom.description}
            </p>
          )}

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '16px',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'rgba(96, 165, 250, 0.1)',
              border: '1.5px solid #60a5fa',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#60a5fa',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#60a5fa';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
                e.currentTarget.style.color = '#60a5fa';
              }}
            >
              📚 {classroom.subject || 'General'}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1.5px solid #a855f7',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#a855f7',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#a855f7';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
                e.currentTarget.style.color = '#a855f7';
              }}
            >
              🏷️ @{classroom.handle}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid with Accent Colors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
      }}>
        {/* Students Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.25)',
          border: '1px solid rgba(148, 163, 184, 0.08)',
          borderRadius: '16px',
          borderLeft: '4px solid #60a5fa',
          padding: '32px 24px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.12)';
            e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(96, 165, 250, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.08)';
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.25)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '16px', padding: '10px', background: 'rgba(96, 165, 250, 0.1)', borderRadius: '12px', width: 'fit-content', border: '1px solid #60a5fa' }}>👥</div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Total Students
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#60a5fa' }}>
            {classroom.totalStudents || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px', fontWeight: '500' }}>
            Active in class
          </div>
        </div>

        {/* Tests Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.25)',
          border: '1px solid rgba(148, 163, 184, 0.08)',
          borderRadius: '16px',
          borderLeft: '4px solid #a855f7',
          padding: '32px 24px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.12)';
            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.08)';
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.25)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '16px', padding: '10px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px', width: 'fit-content', border: '1px solid #a855f7' }}>📝</div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Total Tests
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#a855f7' }}>
            {classroom.totalTests || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px', fontWeight: '500' }}>
            {isTeacher ? 'Ready to assign' : 'Available'}
          </div>
        </div>

        {/* Average Score Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.25)',
          border: '1px solid rgba(148, 163, 184, 0.08)',
          borderRadius: '16px',
          borderLeft: '4px solid #10b981',
          padding: '32px 24px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.12)';
            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.08)';
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.25)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '16px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', width: 'fit-content', border: '1px solid #10b981' }}>📊</div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
            Average Score
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#10b981' }}>
            {(classroom.avgScore || 0).toFixed(1)}%
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px', fontWeight: '500' }}>
            {classroom.avgScore >= 75 ? '💪 Excellent' : classroom.avgScore >= 50 ? '📈 Good' : '⚡ Needs improvement'}
          </div>
        </div>
      </div>

      {/* Info Section with Accent */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.25)',
        border: '1px solid rgba(148, 163, 184, 0.08)',
        borderRadius: '16px',
        borderLeft: '4px solid #06b6d4',
        padding: '32px',
        backdropFilter: 'blur(10px)',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#f1f5f9',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingBottom: '12px',
          borderBottom: '2px solid #06b6d4',
        }}>
          ℹ️ About This Classroom
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '28px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Created
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>
              {classroom.createdAt ? new Date(classroom.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Classroom ID
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
              {classroom._id?.substring(0, 12)}...
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Status
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px' }}>●</span> Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
