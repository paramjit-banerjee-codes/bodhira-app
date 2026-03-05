import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Award, AlertCircle, Zap, Users, Brain, BarChart3 } from 'lucide-react';
import api from '../services/api';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import './AnalyticsTab.css';

export default function AnalyticsTab({ classroom, isTeacher }) {
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

        // Process students data
        const processedStudents = studentsData
          .map(s => ({
            ...s,
            avgScore: s.avgScore || s.percentage || 0,
            name: s.name || s.fullName || s.userHandle || 'Unknown',
          }))
          .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));

        const topScorers = processedStudents.slice(0, 5);
        const bottomScorers = processedStudents.slice(-5).reverse();

        // Calculate metrics
        const avgClassScore = Math.round(overviewData.avgScore || 0);
        const highestScore = Math.round(overviewData.maxScore || 0);
        const lowestScore = Math.round(overviewData.minScore || 0);
        const allScores = overviewData.scores || [];

        // Topic statistics
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
          scoreDistribution: overviewData.scoreDistribution || [],
        });

        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to load analytics:', err);
        setError(err.response?.data?.error || 'Failed to load analytics data');
        setLoading(false);
      }
    };

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, [classroom]);

  if (!classroom) {
    return <LoadingSkeleton type="content" />;
  }

  if (loading) {
    return <LoadingSkeleton type="grid" count={8} />;
  }

  if (error) {
    return (
      <div className="analytics-tab-premium">
        <div className="analytics-error-premium">
          <div className="analytics-error-title">⚠️ Error</div>
          <p className="analytics-error-message">{error}</p>
        </div>
      </div>
    );
  }

  if (!analyticsData || analyticsData.totalTests === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No Analytics Data Yet"
        description={
          isTeacher
            ? 'Analytics will appear once students start taking tests in this classroom.'
            : 'Take some tests to see your performance analytics.'
        }
      />
    );
  }

  return (
    <div className="analytics-tab-premium">
      {/* Header */}
      <div className="analytics-header-premium">
        <div className="analytics-header-left">
          <h2>Analytics Dashboard</h2>
          <p>Comprehensive performance insights for {classroom.name}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="analytics-kpi-grid">
        <KPICard
          icon={TrendingUp}
          label="Average Score"
          value={analyticsData.avgClassScore}
          unit="%"
          color="primary"
        />
        <KPICard
          icon={Award}
          label="Highest Score"
          value={analyticsData.highestScore}
          unit="%"
          color="success"
        />
        <KPICard
          icon={TrendingDown}
          label="Lowest Score"
          value={analyticsData.lowestScore}
          unit="%"
          color="danger"
        />
        <KPICard
          icon={Users}
          label="Total Students"
          value={analyticsData.totalStudents}
          unit=""
          color="info"
        />
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel analytics={analyticsData} />

      {/* Charts Grid */}
      <div className="analytics-charts-grid">
        {/* Score Distribution */}
        <ScoreDistributionChart
          scores={analyticsData.allScores}
          distribution={analyticsData.scoreDistribution}
        />

        {/* Difficult Topics */}
        <DifficultTopicsCard topics={analyticsData.topicStats} />
      </div>

      {/* Leaderboards */}
      <div className="analytics-charts-grid">
        <LeaderboardCard
          title="Top Performers"
          students={analyticsData.topScorers}
          variant="gold"
        />
        <LeaderboardCard
          title="Needs Attention"
          students={analyticsData.bottomScorers}
          variant="red"
        />
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({ icon: Icon, label, value, unit, color }) {
  const colorClass = color || 'primary';

  return (
    <div className="analytics-kpi-card">
      <div className="analytics-kpi-header">
        <div className={`analytics-kpi-icon ${colorClass}`}>
          <Icon size={24} color="white" />
        </div>
      </div>
      <span className="analytics-kpi-label">{label}</span>
      <div className="analytics-kpi-value">
        {value}
        {unit && <span className="analytics-kpi-unit">{unit}</span>}
      </div>
    </div>
  );
}

// AI Insights Panel
function AIInsightsPanel({ analytics }) {
  const generateInsight = () => {
    const avg = analytics.avgClassScore;
    if (avg >= 80) {
      return '🎉 Excellent performance! The class is demonstrating strong understanding of the material. Consider introducing more challenging topics.';
    } else if (avg >= 60) {
      return '📚 Good progress! Most students are grasping the concepts. Focus on supporting students scoring below 60% for better outcomes.';
    } else {
      return '⚠️ Class needs attention. Average score indicates difficulty with current material. Consider reviewing foundational concepts and providing additional support.';
    }
  };

  return (
    <div className="analytics-ai-insights">
      <div className="analytics-ai-header">
        <div className="analytics-ai-icon">
          <Brain size={24} color="white" />
        </div>
        <h3 className="analytics-ai-title">AI Performance Insights</h3>
      </div>
      <p className="analytics-ai-content">{generateInsight()}</p>
    </div>
  );
}

// Score Distribution Chart
function ScoreDistributionChart({ scores, distribution }) {
  const chartData = [
    { range: '0-20%', count: 0, rangeIndex: 0 },
    { range: '20-40%', count: 0, rangeIndex: 1 },
    { range: '40-60%', count: 0, rangeIndex: 2 },
    { range: '60-80%', count: 0, rangeIndex: 3 },
    { range: '80-100%', count: 0, rangeIndex: 4 },
  ];

  if (distribution && Array.isArray(distribution) && distribution.length > 0) {
    distribution.forEach((d, idx) => {
      if (idx < chartData.length) {
        chartData[idx].count = d.count || 0;
      }
    });
  } else if (scores && Array.isArray(scores)) {
    scores.forEach(score => {
      if (score < 20) chartData[0].count++;
      else if (score < 40) chartData[1].count++;
      else if (score < 60) chartData[2].count++;
      else if (score < 80) chartData[3].count++;
      else chartData[4].count++;
    });
  }

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <div className="analytics-chart-icon primary">
          <Zap size={20} color="#60a5fa" />
        </div>
        <h3 className="analytics-chart-title">Score Distribution</h3>
      </div>

      <div className="score-distribution-bars">
        {chartData.map((item) => {
          const barHeight = item.count === 0 ? 32 : Math.max((item.count / maxCount) * 240, 32);

          return (
            <div key={item.range} className="score-bar-container">
              {item.count > 0 && (
                <div className={`score-bar-count range-${item.rangeIndex}`} style={{ color: getBarColor(item.rangeIndex) }}>
                  {item.count}
                </div>
              )}
              <div className="score-bar-wrapper" style={{ height: `${barHeight}px` }}>
                {item.count > 0 && (
                  <div className={`score-bar-fill range-${item.rangeIndex}`} />
                )}
              </div>
              <div className="score-bar-label">
                <div className="score-bar-range">{item.range}</div>
                <div className="score-bar-tests">
                  {item.count} {item.count === 1 ? 'test' : 'tests'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getBarColor(index) {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  return colors[index] || '#60a5fa';
}

// Difficult Topics Card
function DifficultTopicsCard({ topics }) {
  const displayTopics = topics.slice(0, 6);

  return (
    <div className="analytics-chart-card">
      <div className="analytics-chart-header">
        <div className="analytics-chart-icon warning">
          <AlertCircle size={20} color="#f59e0b" />
        </div>
        <h3 className="analytics-chart-title">Most Difficult Topics</h3>
      </div>

      {displayTopics.length > 0 ? (
        <div className="analytics-topics-grid">
          {displayTopics.map((topic, idx) => {
            const difficulty = topic.avgScore < 40 ? 'high' : topic.avgScore < 60 ? 'medium' : 'low';

            return (
              <div key={idx} className={`analytics-topic-card difficulty-${difficulty}`}>
                <h4 className="analytics-topic-name">{topic.topic}</h4>
                <div className="analytics-topic-score-row">
                  <div className={`analytics-topic-score ${difficulty}`}>
                    {topic.avgScore}%
                  </div>
                  <div className="analytics-topic-progress">
                    <div className="analytics-topic-progress-bar">
                      <div
                        className={`analytics-topic-progress-fill ${difficulty}`}
                        style={{ width: `${topic.avgScore}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="analytics-topic-attempts">
                  {topic.totalAttempts} attempts
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No Topic Data"
          description="Topic performance data will appear once tests are taken."
        />
      )}
    </div>
  );
}

// Leaderboard Card
function LeaderboardCard({ title, students, variant }) {
  const iconColor = variant === 'gold' ? '#fbbf24' : '#ef4444';

  return (
    <div className="analytics-leaderboard">
      <div className="analytics-leaderboard-header">
        <div className={`analytics-leaderboard-icon ${variant}`}>
          <Award size={20} color={iconColor} />
        </div>
        <h3 className="analytics-leaderboard-title">{title}</h3>
      </div>

      {students.length > 0 ? (
        <div className="analytics-leaderboard-list">
          {students.map((student, idx) => {
            const rankClass = idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : 'rank-default';

            return (
              <div key={idx} className="analytics-leaderboard-item">
                <div className="analytics-leaderboard-left">
                  <div className={`analytics-rank-badge ${rankClass}`}>
                    #{idx + 1}
                  </div>
                  <div className="analytics-student-info">
                    <p className="analytics-student-name">
                      {student.name || student.userHandle || 'Unknown'}
                    </p>
                    <p className="analytics-student-handle">
                      @{student.userHandle || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="analytics-student-score">
                  <div className="analytics-score-value">
                    {(student.avgScore || 0).toFixed(1)}%
                  </div>
                  <div className="analytics-score-label">avg score</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Target}
          title="No Data"
          description="Student performance data will appear here."
        />
      )}
    </div>
  );
}
