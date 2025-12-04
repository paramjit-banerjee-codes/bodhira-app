import '../pages/GenerateTest.css';

export default function OverviewTab({ classroom, isTeacher }) {
  if (!classroom) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
        <p>Loading classroom data...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Classroom Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          textAlign: 'center',
        }}
      >
        {/* Classroom Name */}
        <h2 style={{
          color: '#f1f5f9',
          fontSize: '36px',
          fontWeight: 800,
          margin: 0,
          marginBottom: '12px',
          letterSpacing: '-0.5px',
        }}>
          {classroom.name}
        </h2>

        {/* Description */}
        {classroom.description && (
          <p style={{
            color: '#cbd5e1',
            fontSize: '16px',
            margin: 0,
            marginBottom: '28px',
            lineHeight: '1.6',
          }}>
            {classroom.description}
          </p>
        )}

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent)',
          margin: '28px 0',
        }} />

        {/* Basic Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '24px',
        }}>
          {/* Classroom ID */}
          <div>
            <p style={{
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 700,
              margin: 0,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              ID
            </p>
            <p style={{
              color: '#3b82f6',
              fontSize: '14px',
              fontWeight: 600,
              margin: 0,
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}>
              {classroom._id || classroom.id || '—'}
            </p>
          </div>

          {/* Handle */}
          <div>
            <p style={{
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 700,
              margin: 0,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Handle
            </p>
            <p style={{
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: 600,
              margin: 0,
            }}>
              @{classroom.handle || '—'}
            </p>
          </div>

          {/* Created On */}
          <div>
            <p style={{
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 700,
              margin: 0,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Created
            </p>
            <p style={{
              color: '#cbd5e1',
              fontSize: '14px',
              fontWeight: 600,
              margin: 0,
            }}>
              {classroom.createdAt ? new Date(classroom.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
        }}
      >
        <h3 style={{
          color: '#e2e8f0',
          fontSize: '18px',
          fontWeight: 700,
          margin: 0,
          marginBottom: '28px',
          letterSpacing: '-0.3px',
        }}>
          Quick Stats
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '20px',
        }}>
          {/* Total Students */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            padding: '24px 16px',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.35)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <p style={{
              color: '#94a3b8',
              fontSize: '10px',
              fontWeight: 700,
              margin: 0,
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}>
              Students
            </p>
            <p style={{
              color: '#10b981',
              fontSize: '32px',
              fontWeight: 800,
              margin: 0,
            }}>
              {classroom.totalStudents || 0}
            </p>
          </div>

          {/* Total Tests */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '12px',
            padding: '24px 16px',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.35)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <p style={{
              color: '#94a3b8',
              fontSize: '10px',
              fontWeight: 700,
              margin: 0,
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}>
              Tests
            </p>
            <p style={{
              color: '#3b82f6',
              fontSize: '32px',
              fontWeight: 800,
              margin: 0,
            }}>
              {classroom.totalTests || 0}
            </p>
          </div>

          {/* Average Score */}
          <div style={{
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '12px',
            padding: '24px 16px',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(168, 85, 247, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.35)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(168, 85, 247, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <p style={{
              color: '#94a3b8',
              fontSize: '10px',
              fontWeight: 700,
              margin: 0,
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}>
              Avg Score
            </p>
            <p style={{
              color: '#a855f7',
              fontSize: '32px',
              fontWeight: 800,
              margin: 0,
            }}>
              {classroom.avgScore || 0}%
            </p>
          </div>

          {/* Recent Test */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '24px 16px',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.35)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <p style={{
              color: '#94a3b8',
              fontSize: '10px',
              fontWeight: 700,
              margin: 0,
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}>
              Latest
            </p>
            <p style={{
              color: '#f59e0b',
              fontSize: '13px',
              fontWeight: 700,
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {classroom.recentTestName ? classroom.recentTestName : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
========== TESTING INSTRUCTIONS ==========
1. Navigate to any classroom
2. Click the "Overview" tab
3. Verify the following clean, minimal layout:
   - Centered Classroom Header Card with:
     * Large classroom name (36px, bold)
     * Description (if provided)
     * Classroom ID, Handle, Created Date in neat grid
   - Quick Stats Card with 4 stat boxes:
     * Total Students (emerald accent)
     * Total Tests (indigo accent)
     * Average Score (purple accent)
     * Latest Test (amber accent)
4. Verify styling:
   - Soft gradient backgrounds
   - Subtle borders and shadows
   - Hover effects on stat boxes (lift up 2px, border brighten)
   - Clean, professional typography
   - Plenty of breathing room (no clutter)
   - Consistent spacing (28px between cards, 20px within grids)
5. Verify data accuracy:
   - All stats fetch real values from backend
   - IDs, handles, dates display correctly
   - No hardcoded/dummy data
   - Description hidden if not provided
6. Test responsiveness:
   - Desktop: 4 stat boxes in single row, 3 info fields in header
   - Tablet: 2-3 boxes per row
   - Mobile: 1 box per row (stacked)
7. Edge cases:
   - No description provided (gracefully hidden)
   - Missing recent test name (shows "—")
   - Large classroom names (don't overflow, readable)
   - Missing fields (show "—")
*/
