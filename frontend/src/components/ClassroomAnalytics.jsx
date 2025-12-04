import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Award, AlertCircle, Zap, Users } from 'lucide-react';
import api from '../services/api';
import AIPerformanceAnalysis from './AIPerformanceAnalysis';

// Premium Metric Card with Glow Effect
function PremiumMetricCard({ icon: Icon, label, value, unit = '', color = 'blue' }) {
  const colorMap = {
    blue: { iconColor: '#60a5fa', bgColor: 'rgba(59, 130, 246, 0.15)' },
    emerald: { iconColor: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
    amber: { iconColor: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.15)' },
    rose: { iconColor: '#f87171', bgColor: 'rgba(248, 113, 113, 0.15)' },
    violet: { iconColor: '#a78bfa', bgColor: 'rgba(167, 139, 250, 0.15)' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        transition: 'all 0.3s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = `0 20px 40px ${c.iconColor}30`;
        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ padding: '12px', borderRadius: '12px', background: c.bgColor }}>
          <Icon size={20} color={c.iconColor} />
        </div>
      </div>
      <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '36px', fontWeight: '900', color: c.iconColor, display: 'flex', alignItems: 'baseline' }}>
        {value}
        {unit && <span style={{ fontSize: '18px', fontWeight: '600', marginLeft: '8px', opacity: 0.75 }}>{unit}</span>}
      </div>
    </div>
  );
}

// Leaderboard Component
function LeaderboardSection({ title, students, isTopScorers = true }) {
  const displayStudents = students.slice(0, 5);
  const iconColor = isTopScorers ? '#fbbf24' : '#f87171';

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ padding: '8px', borderRadius: '8px', background: isTopScorers ? 'rgba(251, 191, 36, 0.2)' : 'rgba(248, 113, 113, 0.2)' }}>
          <Award size={20} color={iconColor} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>{title}</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayStudents.map((student, idx) => {
          const rankColors = [
            { bg: 'rgba(251, 191, 36, 0.3)', text: '#fcd34d', border: 'rgba(251, 191, 36, 0.5)' }, // Gold
            { bg: 'rgba(200, 200, 200, 0.3)', text: '#e5e7eb', border: 'rgba(200, 200, 200, 0.5)' }, // Silver
            { bg: 'rgba(231, 126, 76, 0.3)', text: '#fdba74', border: 'rgba(231, 126, 76, 0.5)' }, // Bronze
            { bg: 'rgba(100, 116, 139, 0.3)', text: '#cbd5e1', border: 'rgba(100, 116, 139, 0.5)' }, // Default
            { bg: 'rgba(100, 116, 139, 0.3)', text: '#cbd5e1', border: 'rgba(100, 116, 139, 0.5)' }, // Default
          ];

          const rankColor = rankColors[idx] || rankColors[3];

          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '12px',
                padding: '16px',
                background: 'rgba(100, 116, 139, 0.1)',
                border: `1px solid rgba(100, 116, 139, 0.2)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                {/* Rank Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    background: rankColor.bg,
                    color: rankColor.text,
                    border: `2px solid ${rankColor.border}`,
                  }}
                >
                  #{idx + 1}
                </div>

                {/* Student Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', color: '#f1f5f9', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {student.name || student.userHandle || 'Unknown'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    @{student.userHandle || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>
                  {student.avgScore?.toFixed(1) || '0'}%
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginTop: '4px' }}>avg score</div>
              </div>
            </div>
          );
        })}
      </div>

      {displayStudents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: '#94a3b8' }}>
          <Target size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
          <p style={{ margin: 0 }}>No student data available</p>
        </div>
      )}
    </div>
  );
}

// Premium Score Distribution Chart
function ScoreDistributionChart({ data, distribution }) {
  // Use distribution data if available, otherwise build from raw scores
  let chartData = [
    { range: '0-20%', count: 0, color: '#ef4444' },
    { range: '20-40%', count: 0, color: '#f97316' },
    { range: '40-60%', count: 0, color: '#eab308' },
    { range: '60-80%', count: 0, color: '#22c55e' },
    { range: '80-100%', count: 0, color: '#10b981' },
  ];

  // If distribution is provided from backend, use it
  if (distribution && Array.isArray(distribution) && distribution.length > 0) {
    distribution.forEach((d, idx) => {
      if (idx < chartData.length) {
        chartData[idx].count = d.count || 0;
      }
    });
  } else if (data && Array.isArray(data)) {
    // Otherwise, build from raw scores
    data.forEach(score => {
      if (score < 20) chartData[0].count++;
      else if (score < 40) chartData[1].count++;
      else if (score < 60) chartData[2].count++;
      else if (score < 80) chartData[3].count++;
      else chartData[4].count++;
    });
  }

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
      }}
    >
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 32px 0' }}>
        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(126, 34, 206, 0.2)' }}>
          <Zap size={20} color='#a78bfa' />
        </div>
        Score Distribution
      </h3>

      {/* Grid of bars - 5 columns with better spacing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', alignItems: 'flex-end' }}>
        {chartData.map((item, idx) => {
          const barHeight = item.count === 0 ? 20 : (item.count / maxCount) * 240;
          const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: '100%', justifyContent: 'flex-end' }}>
              {/* Count Label Above Bar */}
              {item.count > 0 && (
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: colors[idx],
                  minHeight: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {item.count}
                </div>
              )}

              {/* Bar Container */}
              <div
                style={{
                  width: '100%',
                  height: `${barHeight}px`,
                  background: 'rgba(100, 116, 139, 0.2)',
                  borderRadius: '10px 10px 6px 6px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  padding: '6px',
                  position: 'relative',
                  overflow: 'hidden',
                  border: `1px solid rgba(100, 116, 139, 0.3)`,
                  transition: 'all 0.25s ease',
                  cursor: 'default',
                  minHeight: '24px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.15)';
                  e.currentTarget.style.transform = 'scaleY(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(100, 116, 139, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scaleY(1)';
                }}
              >
                {/* Actual Bar */}
                {item.count > 0 && (
                  <div
                    style={{
                      width: '70%',
                      height: '100%',
                      background: `linear-gradient(180deg, ${colors[idx]}, ${colors[idx]}dd)`,
                      borderRadius: '4px',
                      transition: 'all 0.3s ease',
                      boxShadow: `0 0 20px ${colors[idx]}40`,
                    }}
                  />
                )}
              </div>

              {/* Label - Score Range */}
              <div style={{ textAlign: 'center', width: '100%', marginTop: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', marginBottom: '6px' }}>
                  {item.range}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
                  {item.count} {item.count === 1 ? 'test' : 'tests'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(148, 163, 184, 0.2)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
        <div style={{ textAlign: 'center', padding: '12px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Total Tests</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#60a5fa' }}>{chartData.reduce((sum, d) => sum + d.count, 0)}</div>
        </div>
      </div>
    </div>
  );
}

// Difficult Topics/Chapters Heatmap
function DifficultAreasHeatmap({ data = [] }) {
  // Sample data structure with topics/chapters
  const heatmapData = data.slice(0, 8).map((item, idx) => ({
    name: item.topic || item.name || `Topic ${idx + 1}`,
    difficulty: item.avgScore || 50,
    attempts: item.totalAttempts || 0,
  }));

  const getHeatmapColor = (score) => {
    if (score >= 80) return { color: '#10b981', lightColor: '#6ee7b7' };
    if (score >= 60) return { color: '#eab308', lightColor: '#fcd34d' };
    if (score >= 40) return { color: '#f97316', lightColor: '#fb923c' };
    return { color: '#ef4444', lightColor: '#fca5a5' };
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.2)' }}>
          <AlertCircle size={20} color='#f43f5e' />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>Most Difficult Topics</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {heatmapData.length > 0 ? (
          heatmapData.map((topic, idx) => {
            const colors = getHeatmapColor(topic.difficulty);
            return (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  padding: '20px',
                  background: `linear-gradient(135deg, rgba(${parseInt(colors.color.slice(1, 3), 16)}, ${parseInt(colors.color.slice(3, 5), 16)}, ${parseInt(colors.color.slice(5, 7), 16)}, 0.2) 0%, rgba(${parseInt(colors.color.slice(1, 3), 16)}, ${parseInt(colors.color.slice(3, 5), 16)}, ${parseInt(colors.color.slice(5, 7), 16)}, 0.05) 100%)`,
                  border: `1px solid rgba(${parseInt(colors.color.slice(1, 3), 16)}, ${parseInt(colors.color.slice(3, 5), 16)}, ${parseInt(colors.color.slice(5, 7), 16)}, 0.4)`,
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `0 12px 24px ${colors.color}40`;
                  e.currentTarget.style.borderColor = `rgba(${parseInt(colors.color.slice(1, 3), 16)}, ${parseInt(colors.color.slice(3, 5), 16)}, ${parseInt(colors.color.slice(5, 7), 16)}, 0.7)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = `rgba(${parseInt(colors.color.slice(1, 3), 16)}, ${parseInt(colors.color.slice(3, 5), 16)}, ${parseInt(colors.color.slice(5, 7), 16)}, 0.4)`;
                }}
              >
                {/* Background overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)', opacity: 0, transition: 'opacity 0.3s ease' }} />

                <div style={{ position: 'relative', zIndex: 10 }}>
                  {/* Title */}
                  <h4 style={{ fontWeight: 'bold', color: '#f1f5f9', marginBottom: '16px', fontSize: '16px', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {topic.name}
                  </h4>

                  {/* Score and Progress Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: colors.color }}>
                      {topic.difficulty.toFixed(0)}%
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'rgba(100, 116, 139, 0.3)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${topic.difficulty}%`,
                          background: `linear-gradient(90deg, ${colors.color}, ${colors.lightColor})`,
                          borderRadius: '8px',
                          transition: 'all 0.5s ease',
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
                    {topic.attempts} attempts
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
            <Target size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>No topic data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Analytics Component
export default function ClassroomAnalytics({ classroom, isTeacher }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
      if (!classroom) return;

      try {
        setLoading(true);
        setError(null);
        const classroomId = classroom.id || classroom._id;

        // Fetch real analytics data from backend
        const [overviewRes, studentsRes] = await Promise.all([
          api.get(`/classrooms/${classroomId}/analytics/overview`),
          api.get(`/classrooms/${classroomId}/analytics/students`),
        ]);

        if (!mounted) return;

        const overviewData = overviewRes?.data?.data || {};
        const studentsData = studentsRes?.data?.data || [];

        console.log('📊 Analytics Data Loaded:', { overview: overviewData, students: studentsData });
        console.log('📚 Students with test results:', studentsData.map(s => ({ 
          name: s.name, 
          testResultsCount: s.testResults?.length || 0,
          testResults: s.testResults 
        })));

        // Process students data - they should have avgScore from backend
        const processedStudents = studentsData
          .map(s => ({
            ...s,
            avgScore: s.avgScore || s.percentage || 0,
            name: s.name || s.fullName || s.userHandle || 'Unknown',
          }))
          .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));

        const topScorers = processedStudents.slice(0, 5);
        const bottomScorers = processedStudents.slice(-5).reverse();

        // Calculate metrics from overview data
        const avgClassScore = Math.round(overviewData.avgScore || 0);
        const highestScore = Math.round(overviewData.maxScore || 0);
        const lowestScore = Math.round(overviewData.minScore || 0);
        const allScores = overviewData.scores || [];

        // Get topic statistics - sort by avgScore ascending (hardest topics first)
        const topicStats = (overviewData.topicStats || [])
          .map(topic => ({
            topic: topic.topic || topic.name || 'General',
            avgScore: Math.round(topic.avgScore || 50),
            totalAttempts: topic.attempts || 0,
          }))
          .sort((a, b) => (a.avgScore || 0) - (b.avgScore || 0));

        setAnalyticsData({
          avgClassScore,
          highestScore,
          lowestScore,
          topScorers,
          bottomScorers,
          allScores,
          topicStats,
          totalStudents: processedStudents.length,
          totalTests: overviewData.totalResults || 0,
          medianScore: Math.round(overviewData.medianScore || 0),
          distribution: overviewData.distribution || [],
        });

        console.log('✅ Analytics processed successfully:', {
          avgClassScore,
          topScorers: topScorers.map(s => ({ name: s.name, score: s.avgScore })),
          bottomScorers: bottomScorers.map(s => ({ name: s.name, score: s.avgScore })),
        });
      } catch (err) {
        console.error('Analytics load error:', err);
        if (mounted) {
          setError(err.response?.data?.error || err.message || 'Failed to load analytics');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAnalytics();
    return () => (mounted = false);
  }, [classroom]);

  if (!isTeacher) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f1f5f9', margin: '0 0 16px 0' }}>📊 Analytics</h2>
        <p style={{ color: '#94a3b8', margin: 0 }}>Only teachers can access classroom analytics. Contact your teacher for performance insights.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: '128px',
              background: 'rgba(100, 116, 139, 0.2)',
              borderRadius: '16px',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }} />
          ))}
        </div>
        <div style={{
          height: '384px',
          background: 'rgba(100, 116, 139, 0.2)',
          borderRadius: '16px',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'rgba(244, 63, 94, 0.2)',
        border: '1px solid rgba(244, 63, 94, 0.4)',
        borderRadius: '16px',
        padding: '24px',
        color: '#fb7185',
      }}>
        <p style={{ fontWeight: '600', margin: '0 0 8px 0' }}>⚠️ Error Loading Analytics</p>
        <p style={{ fontSize: '14px', margin: 0 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#f8fafc', margin: '0 0 12px 0' }}>📊 Classroom Analytics</h2>
        <p style={{ color: '#94a3b8', fontSize: '18px', margin: 0 }}>Deep insights into your classroom's performance</p>
      </div>

      {/* Top Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <PremiumMetricCard
          icon={Target}
          label="Class Average"
          value={analyticsData?.avgClassScore || 0}
          unit="%"
          color="blue"
        />
        <PremiumMetricCard
          icon={Award}
          label="Total Students"
          value={analyticsData?.totalStudents || 0}
          unit="students"
          color="emerald"
        />
        <PremiumMetricCard
          icon={TrendingUp}
          label="Highest Score"
          value={analyticsData?.highestScore || 0}
          unit="%"
          color="amber"
        />
        <PremiumMetricCard
          icon={TrendingDown}
          label="Lowest Score"
          value={analyticsData?.lowestScore || 0}
          unit="%"
          color="rose"
        />
      </div>

      {/* Leaderboards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        <LeaderboardSection title="🏆 Top 5 Performers" students={analyticsData?.topScorers || []} isTopScorers={true} />
        <LeaderboardSection title="⚠️ Bottom 5 Performers" students={analyticsData?.bottomScorers || []} isTopScorers={false} />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <ScoreDistributionChart data={analyticsData?.allScores || []} distribution={analyticsData?.distribution || []} />
        <DifficultAreasHeatmap data={analyticsData?.topicStats || []} />
      </div>

      {/* AI/ML Performance Analysis Section */}
      <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '2px solid rgba(148, 163, 184, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(167, 139, 250, 0.2)' }}>
            <Zap size={20} color='#a78bfa' />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>
            🤖 AI-Powered Performance Analysis
          </h2>
        </div>

        {/* Class-wide Analysis */}
        <div style={{ marginBottom: '32px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(148, 163, 184, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Users size={20} color='#60a5fa' />
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>
              Class-wide Insights
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}>Strongest Topics</div>
              {analyticsData?.topicStats && analyticsData.topicStats.length > 0 && (
                analyticsData.topicStats
                  .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))
                  .slice(0, 3)
                  .map((t, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#6ee7b7', fontWeight: '600', marginBottom: '4px' }}>
                      ✓ {t.topic || t.name} - {t.avgScore || 0}%
                    </div>
                  ))
              )}
            </div>

            <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}>Topics Needing Help</div>
              {analyticsData?.topicStats && analyticsData.topicStats.length > 0 && (
                analyticsData.topicStats
                  .sort((a, b) => (a.avgScore || 0) - (b.avgScore || 0))
                  .slice(0, 3)
                  .map((t, i) => (
                    <div key={i} style={{ fontSize: '13px', color: '#fb7185', fontWeight: '600', marginBottom: '4px' }}>
                      ⚠ {t.topic || t.name} - {t.avgScore || 0}%
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Student Performance Analysis */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '16px' }}>
            Student Performance Breakdown
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
            Individual AI-powered analysis showing strengths, weaknesses, and learning priorities for each student based on their test history and confidence levels.
          </p>

          {analyticsData?.topScorers && analyticsData.topScorers.length > 0 ? (
            <div style={{ display: 'grid', gap: '32px' }}>
              {analyticsData.topScorers.map((student, idx) => (
                <div key={idx} style={{ borderLeft: '4px solid #60a5fa', paddingLeft: '20px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '16px' }}>
                    👤 {student.name || `Student ${idx + 1}`}
                  </h4>
                  <AIPerformanceAnalysis
                    allTestResults={student.testResults || []}
                    studentName={student.name || `Student ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <p>No student data available for analysis yet</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
