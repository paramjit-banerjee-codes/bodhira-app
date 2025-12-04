import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap, Target, AlertCircle, CheckCircle } from 'lucide-react';
import PerformanceAnalysisEngine from './PerformanceAnalysisEngine';

/**
 * Premium Heatmap Component - Shows topic-wise performance
 * Green = Strong, Red = Weak
 */
function TopicPerformanceHeatmap({ performanceMap }) {
  const heatmapData = PerformanceAnalysisEngine.prepareHeatmapData(performanceMap);

  if (heatmapData.length === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        textAlign: 'center',
        color: '#94a3b8',
      }}>
        <p>No performance data available yet</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(148, 163, 184, 0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(126, 34, 206, 0.2)' }}>
          <Zap size={20} color='#a78bfa' />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>
          Topic Performance Heatmap
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {heatmapData.map((topic, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '12px',
              padding: '16px',
              background: `linear-gradient(135deg, ${topic.color}20, ${topic.color}05)`,
              border: `1.5px solid ${topic.color}40`,
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = `0 12px 30px ${topic.color}30`;
              e.currentTarget.style.borderColor = `${topic.color}80`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = `${topic.color}40`;
            }}
          >
            {/* Topic Name */}
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#f1f5f9', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {topic.topic}
              </h4>
            </div>

            {/* Score and Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: topic.color }}>
                {topic.score}%
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(100, 116, 139, 0.3)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${topic.score}%`,
                    background: `linear-gradient(90deg, ${topic.color}, ${topic.color}cc)`,
                    borderRadius: '4px',
                    boxShadow: `0 0 10px ${topic.color}40`,
                  }} />
                </div>
              </div>
            </div>

            {/* Confidence Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '11px', fontWeight: 'bold', color: '#94a3b8' }}>
              <span>🎯 Confidence: {topic.confidence}%</span>
              <span>📊 {topic.testCount} tests</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Strength/Weakness Analysis Cards
 */
function StrengthWeaknessPanel({ performanceMap }) {
  const { strengths, weaknesses } = performanceMap;

  const renderSection = (title, items, isStrength) => {
    const icon = isStrength ? '⭐' : '⚠️';
    const color = isStrength ? '#10b981' : '#f43f5e';

    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: `${color}20` }}>
            {isStrength ? <CheckCircle size={20} color={color} /> : <AlertCircle size={20} color={color} />}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>
            {icon} {title}
          </h3>
        </div>

        {Object.entries(items).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(items).map(([topic, analysis], idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  background: `${analysis.color}15`,
                  border: `1px solid ${analysis.color}40`,
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '14px' }}>
                    {topic}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    Score: {analysis.avgScore}% • Confidence: {analysis.confidence}%
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: analysis.color,
                  fontWeight: 'bold',
                }}>
                  {analysis.trend > 0 && <TrendingUp size={16} />}
                  {analysis.trend < 0 && <TrendingDown size={16} />}
                  {analysis.trend === 0 && <span>—</span>}
                  {Math.abs(analysis.trend)}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>
            No {isStrength ? 'strong' : 'weak'} topics yet
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      {renderSection('Student Strengths', strengths, true)}
      {renderSection('Areas for Improvement', weaknesses, false)}
    </div>
  );
}

/**
 * Suggested Learning Priorities
 */
function LearningPriorities({ performanceMap }) {
  const priorities = PerformanceAnalysisEngine.generateLearningPriorities(performanceMap);

  if (priorities.length === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        textAlign: 'center',
        color: '#94a3b8',
      }}>
        <p>No learning priorities at this time</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(148, 163, 184, 0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.2)' }}>
          <Target size={20} color='#f43f5e' />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f1f5f9', margin: 0 }}>
          📚 Suggested Learning Priorities
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {priorities.map((priority, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '12px',
              padding: '16px',
              background: `linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0.05) 100%)`,
              border: '1px solid rgba(244, 63, 94, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.6)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(244, 63, 94, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {/* Priority Rank */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, #f43f5e, #fb7185)`,
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '18px',
                flexShrink: 0,
              }}>
                {idx + 1}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#f1f5f9', margin: '0 0 8px 0' }}>
                  {priority.topic}
                </h4>

                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span>📊 Score: <strong>{priority.score}%</strong></span>
                  <span>🎯 Confidence: <strong>{priority.confidence}%</strong></span>
                  <span>📝 Attempts: <strong>{priority.attempts}</strong></span>
                </div>

                {/* Priority Score */}
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(100, 116, 139, 0.3)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(priority.priority, 100)}%`,
                    background: `linear-gradient(90deg, #f43f5e, #fb7185)`,
                    borderRadius: '4px',
                  }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93c5fd', fontSize: '13px' }}>
        💡 <strong>Tip:</strong> Focus on these topics to improve overall performance. The priority is based on confidence level, improvement trend, and number of attempts.
      </div>
    </div>
  );
}

/**
 * Performance Summary Cards
 */
function PerformanceSummary({ performanceMap }) {
  const { overallScore, topicAnalysis } = performanceMap;

  const strongCount = Object.values(topicAnalysis).filter(t => t.strength === 'EXCELLENT' || t.strength === 'STRONG').length;
  const weakCount = Object.values(topicAnalysis).filter(t => t.strength === 'WEAK' || t.strength === 'CRITICAL').length;
  const avgConfidence = Math.round(
    Object.values(topicAnalysis).reduce((sum, t) => sum + t.confidence, 0) / Object.keys(topicAnalysis).length
  );

  const cards = [
    { label: 'Overall Score', value: overallScore, unit: '%', color: '#60a5fa', icon: '🎯' },
    { label: 'Strong Topics', value: strongCount, unit: '', color: '#10b981', icon: '⭐' },
    { label: 'Topics to Improve', value: weakCount, unit: '', color: '#f43f5e', icon: '📚' },
    { label: 'Avg Confidence', value: avgConfidence, unit: '%', color: '#a78bfa', icon: '🎓' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          style={{
            background: `linear-gradient(135deg, ${card.color}15, ${card.color}05)`,
            border: `1px solid ${card.color}40`,
            borderRadius: '12px',
            padding: '16px',
            transition: 'all 0.3s ease',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 8px 20px ${card.color}25`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>
            {card.icon} {card.label}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: card.color }}>
            {card.value}{card.unit}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main AI/ML Performance Analysis Component
 */
export default function AIPerformanceAnalysis({ allTestResults = [], studentName = 'Student' }) {
  const [performanceMap, setPerformanceMap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(`🎓 AIPerformanceAnalysis for ${studentName}:`, {
      testResultsCount: allTestResults?.length || 0,
      allTestResults: allTestResults,
    });

    if (!allTestResults || allTestResults.length === 0) {
      console.log(`⚠️ No test results for ${studentName}`);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`📊 Building performance map for ${studentName} with ${allTestResults.length} results`);
      // Build performance map using the analysis engine
      const map = PerformanceAnalysisEngine.buildPerformanceMap(allTestResults);
      console.log(`✅ Performance map built for ${studentName}:`, map);
      setPerformanceMap(map);
    } catch (error) {
      console.error('Error analyzing performance:', error);
    } finally {
      setLoading(false);
    }
  }, [allTestResults]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid rgba(59, 130, 246, 0.2)',
          borderTopColor: '#60a5fa',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  if (!performanceMap) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        textAlign: 'center',
        color: '#94a3b8',
      }}>
        <Target size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
        <p>No test results available for analysis. Complete some tests to see your performance insights!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Summary Cards */}
      <PerformanceSummary performanceMap={performanceMap} />

      {/* Topic Performance Heatmap */}
      <TopicPerformanceHeatmap performanceMap={performanceMap} />

      {/* Strength/Weakness Analysis */}
      <StrengthWeaknessPanel performanceMap={performanceMap} />

      {/* Learning Priorities */}
      <LearningPriorities performanceMap={performanceMap} />
    </div>
  );
}
