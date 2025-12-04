import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import '../../../pages/GenerateTest.css';
import StudentLineChart from './charts/StudentLineChart';
import StudentBarChart from './charts/StudentBarChart';
import api from '../../../services/api';

export default function StudentDetailModal({ classroom, student, onClose }) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [topicData, setTopicData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!classroom || !student) return;
      setLoading(true);
      setError(null);
      try {
        const classroomId = classroom.id || classroom._id;
        const resp = await api.get(`/classrooms/${classroomId}/analytics/students/${student.studentId}/history`);
        if (!mounted) return;
        const items = resp?.data?.data || [];
        setHistory(items);

        // Aggregate by topic for bar chart
        const topics = {};
        items.forEach((it) => {
          if (!topics[it.topic]) topics[it.topic] = { topic: it.topic, total: 0, count: 0 };
          topics[it.topic].total += it.score;
          topics[it.topic].count += 1;
        });
        const topicArr = Object.values(topics).map((t) => ({ topic: t.topic, avg: Math.round(t.total / t.count) }));
        setTopicData(topicArr);
      } catch (err) {
        console.error('StudentDetailModal.load error', err);
        setError(err.response?.data?.error || 'Failed to load student details');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [classroom, student]);

  if (!student) return null;

  const bestScore = history.length > 0 ? Math.max(...history.map(h => h.score)) : 0;
  const worstScore = history.length > 0 ? Math.min(...history.map(h => h.score)) : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(2, 6, 23, 0.75)',
      }}
      onClick={onClose}
    >
      {/* Close on backdrop click only, not on card */}
      <div
        style={{
          position: 'relative',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '90vh',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalFadeIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '28px 32px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
            backgroundImage: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
          }}
        >
          <div>
            <h2 style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: 700, margin: 0 }}>{student.name}</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '6px 0 0 0' }}>Student Performance Details</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: '#e2e8f0',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.15)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'scale(1)';
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px',
          }}
        >
          {error && (
            <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              {error}
            </div>
          )}

          {/* Student Summary Cards */}
          {!loading && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                }}
              >
                <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, margin: 0, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Score</p>
                <p style={{ color: '#f1f5f9', fontSize: '32px', fontWeight: 800, margin: 0 }}>{student.avgScore}%</p>
              </div>

              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                }}
              >
                <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, margin: 0, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tests Taken</p>
                <p style={{ color: '#10b981', fontSize: '32px', fontWeight: 800, margin: 0 }}>{student.testsTaken}</p>
              </div>

              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                }}
              >
                <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, margin: 0, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best Score</p>
                <p style={{ color: '#3b82f6', fontSize: '32px', fontWeight: 800, margin: 0 }}>{bestScore}%</p>
              </div>

              <div
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  padding: '20px',
                  borderRadius: '12px',
                }}
              >
                <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, margin: 0, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Worst Score</p>
                <p style={{ color: '#f87171', fontSize: '32px', fontWeight: 800, margin: 0 }}>{worstScore}%</p>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 700, margin: '0 0 20px 0' }}>Performance Analytics</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              <div>
                <h4 style={{ color: '#cbd5e1', fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0' }}>Score Trend</h4>
                {loading ? (
                  <div style={{ height: '280px', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ) : history.length > 0 ? (
                  <StudentLineChart data={history.map((h) => ({ date: new Date(h.testDate).toLocaleDateString(), score: h.score }))} />
                ) : (
                  <div style={{ height: '280px', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    No test data available
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ color: '#cbd5e1', fontSize: '15px', fontWeight: 600, margin: '0 0 16px 0' }}>Topic Mastery</h4>
                {loading ? (
                  <div style={{ height: '280px', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ) : topicData.length > 0 ? (
                  <StudentBarChart data={topicData} />
                ) : (
                  <div style={{ height: '280px', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    No topic data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Test History Section */}
          <div>
            <h3 style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 700, margin: '0 0 20px 0' }}>Test History</h3>
            {loading ? (
              <div style={{ space: '12px' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ height: '16px', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '8px', marginBottom: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.1)', background: 'rgba(15, 23, 42, 0.4)' }}>
                <table className="student-detail-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', background: 'rgba(30, 41, 59, 0.5)' }}>
                      <th style={{ textAlign: 'left', padding: '16px', color: '#94a3b8', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '16px', color: '#94a3b8', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Topic</th>
                      <th style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr key={idx} style={{ borderBottom: idx < history.length - 1 ? '1px solid rgba(148, 163, 184, 0.06)' : 'none' }}>
                        <td style={{ padding: '16px', color: '#e6eef8', fontSize: '14px' }}>{new Date(h.testDate).toLocaleDateString()}</td>
                        <td style={{ padding: '16px', color: '#cbd5e1', fontSize: '14px' }}>{h.topic}</td>
                        <td style={{ padding: '16px', color: h.score >= 70 ? '#10b981' : h.score >= 50 ? '#f59e0b' : '#ef4444', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>{h.score}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(30, 41, 59, 0.3)', borderRadius: '12px', color: '#94a3b8' }}>
                No test history available
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .student-detail-table tbody tr {
          transition: background 0.2s ease;
          border-bottom: 1px solid rgba(148, 163, 184, 0.06);
        }

        .student-detail-table tbody tr:last-child {
          border-bottom: none;
        }

        .student-detail-table tbody tr:hover {
          background: rgba(30, 41, 59, 0.3);
        }
      `}</style>
    </div>
  );
}

/*
========== TESTING INSTRUCTIONS ==========
1. Navigate to a classroom's Student Analytics tab
2. Click "View Details" on any student card to open this modal
3. Verify:
   - Modal appears centered on screen with smooth animation (no blinking)
   - Dark frosted background overlay is visible behind modal
   - Close (X) button in top-right works to dismiss modal
   - All student summary cards display (Avg Score, Tests Taken, Best/Worst Scores)
   - Charts render correctly (Score Trend line chart, Topic Mastery bar chart)
   - Test history table displays test attempts with date, topic, score
   - Scores colored appropriately (green >=70%, yellow >=50%, red <50%)
   - Modal is scrollable if content exceeds viewport height
   - Modal has proper spacing, shadows, and rounded corners
   - Colors match dark theme (slate, indigo, emerald accents)
4. Test on multiple screen sizes (mobile, tablet, desktop)
5. Test with students having varying amounts of test history (0, few, many tests)
*/
