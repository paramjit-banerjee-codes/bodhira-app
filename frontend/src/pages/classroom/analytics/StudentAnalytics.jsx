import React, { useEffect, useState, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import api from '../../../services/api';
import '../../../pages/GenerateTest.css';
import StudentDetailModal from './StudentDetailModal';

function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px', padding: '20px', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ height: '24px', background: 'rgba(148, 163, 184, 0.2)', borderRadius: '6px', marginBottom: '12px', width: '60%' }} />
      <div style={{ height: '16px', background: 'rgba(148, 163, 184, 0.2)', borderRadius: '6px', marginBottom: '12px', width: '100%' }} />
      <div style={{ height: '16px', background: 'rgba(148, 163, 184, 0.2)', borderRadius: '6px', width: '80%' }} />
    </div>
  );
}

export default function StudentAnalytics({ classroom }) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!classroom) return;
      setLoading(true);
      setError(null);
      try {
        const classroomId = classroom.id || classroom._id;
        const resp = await api.get(`/classrooms/${classroomId}/analytics/students`);
        if (!mounted) return;
        setStudents(resp?.data?.data || []);
      } catch (err) {
        console.error('StudentAnalytics.load error', err);
        setError(err.response?.data?.error || err.message || 'Failed to load students');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [classroom]);

  const filtered = useMemo(() => {
    if (!students) return [];
    if (filter === 'all') return students;
    if (filter === 'improving') return students.filter((s) => s.improvementDelta !== null && s.improvementDelta > 5);
    if (filter === 'at-risk') return students.filter((s) => s.improvementDelta !== null && s.improvementDelta < 0 && s.avgScore < 60);
    return students;
  }, [students, filter]);

  const counts = useMemo(
    () => ({
      all: students.length,
      improving: students.filter((s) => s.improvementDelta !== null && s.improvementDelta > 5).length,
      'at-risk': students.filter((s) => s.improvementDelta !== null && s.improvementDelta < 0 && s.avgScore < 60).length,
    }),
    [students]
  );

  return (
    <div style={{ marginTop: '32px' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h3 style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: 700, margin: 0, marginBottom: '8px' }}>Student Analytics</h3>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0 }}>Per-student performance tracking and detailed history</p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(30, 41, 59, 0.4)', padding: '8px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.1)', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Students', count: counts.all },
            { key: 'improving', label: 'Improving', count: counts.improving, color: '#10b981' },
            { key: 'at-risk', label: 'At-Risk', count: counts['at-risk'], color: '#ef4444' },
          ].map(({ key, label, count, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px',
                transition: 'all 0.2s ease',
                background: filter === key ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                color: filter === key ? '#f1f5f9' : '#94a3b8',
                borderBottom: filter === key ? `2px solid ${color || '#3b82f6'}` : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                if (filter !== key) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.color = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== key) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#94a3b8';
                }
              }}
            >
              {label}
              <span style={{ opacity: 0.8, fontSize: '12px' }}>({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', animation: 'slideIn 0.3s ease' }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Student Cards Grid */}
      {!loading && (
        <>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '12px' }}>
              <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>No students found in this filter</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {filtered.map((s) => {
                const isImproving = s.improvementDelta !== null && s.improvementDelta > 5;
                const isAtRisk = s.improvementDelta !== null && s.improvementDelta < 0 && s.avgScore < 60;
                const trendColor = isAtRisk ? '#ef4444' : isImproving ? '#10b981' : '#94a3b8';
                const trendIcon = isAtRisk ? TrendingDown : isImproving ? TrendingUp : null;

                return (
                  <div
                    key={s.studentId}
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                      border: '1px solid rgba(148, 163, 184, 0.12)',
                      borderRadius: '14px',
                      padding: '24px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.4)';
                      e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.12)';
                    }}
                  >
                    {/* Student Name & Score */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, margin: 0, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student</p>
                        <p style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 700, margin: 0 }}>{s.name}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, margin: 0, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Score</p>
                        <p style={{ fontSize: '28px', fontWeight: 800, color: s.avgScore >= 70 ? '#10b981' : s.avgScore >= 50 ? '#f59e0b' : '#ef4444', margin: 0 }}>{s.avgScore}%</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                      <div>
                        <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, margin: 0, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tests</p>
                        <p style={{ color: '#10b981', fontSize: '18px', fontWeight: 700, margin: 0 }}>{s.testsTaken}</p>
                      </div>
                      <div>
                        <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, margin: 0, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Score</p>
                        <p style={{ color: '#3b82f6', fontSize: '18px', fontWeight: 700, margin: 0 }}>{s.lastScore}%</p>
                      </div>
                      <div>
                        <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, margin: 0, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Consistency</p>
                        <p style={{ color: '#cbd5e1', fontSize: '18px', fontWeight: 700, margin: 0 }}>{s.consistencyScore}</p>
                      </div>
                    </div>

                    {/* Improvement Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trend</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', border: `1px solid ${trendColor}40` }}>
                        {trendIcon && <trendIcon size={14} color={trendColor} />}
                        <span style={{ color: trendColor, fontSize: '13px', fontWeight: 600 }}>{s.improvementDelta !== null ? (s.improvementDelta >= 0 ? '+' : '') + s.improvementDelta + '%' : '—'}</span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelected(s)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.8) 100%)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#f1f5f9',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.8) 100%)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selected && <StudentDetailModal classroom={classroom} student={selected} onClose={() => setSelected(null)} />}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

/*
========== TESTING INSTRUCTIONS ==========
1. Navigate to Classroom > Student Analytics tab
2. Verify layout and styling:
   - Title "Student Analytics" and description visible
   - Filter pills (All Students, Improving, At-Risk) display with counts
3. Test filter functionality:
   - Click "All Students" - should show all students
   - Click "Improving" - should show students with improvement delta > 5%
   - Click "At-Risk" - should show students with delta < 0 and avg score < 60
4. Verify student cards:
   - Each card shows: Student name, Avg Score (big, colored), Tests count
   - Shows Last Score, Consistency, Trend indicator with % delta
   - Trend indicator colored: green (improving), red (at-risk), gray (neutral)
   - Cards have hover effect (lift up, shadow increase)
5. Test "View Details" button:
   - Clicking opens StudentDetailModal centered on screen
   - Modal shows student name, all analytics, charts, test history
   - Modal closes smoothly when X button is clicked
   - No blinking or overlapping content
6. Loading state:
   - When data is loading, skeleton cards appear
   - Once loaded, cards smoothly fade in
7. Error handling:
   - If API fails, error message displays in red gradient
8. Responsive design:
   - Test on mobile (cards stack), tablet (2-3 cols), desktop (3+ cols)
9. Edge cases:
   - Test with 0 students (should show "No students found")
   - Test with student having 0 tests (should show data appropriately)
   - Test with students having high/low improvement deltas
*/
