import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import {
  Users, FileText, Target, Layout, TrendingUp, TrendingDown,
  BarChart3, PieChart, Activity, Trophy, Medal, CheckCircle2,
  AlertCircle, AlertTriangle, Sparkles, Crown, Zap, Plus,
  FileDown, CalendarClock, BarChart4, Hash, Copy, Share2,
  ChevronDown, ArrowUp, ArrowDown, ArrowRight, ChevronLeft,
  ChevronRight, Clock, User, Loader2, Inbox, Check, BookOpen,
  Calendar, FolderOpen, LayoutDashboard, ClipboardList
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTests: 0,
    classAverage: 0,
    activeClassrooms: 0,
    trends: { students: 0, tests: 0, average: 0 }
  });
  const [performanceStats, setPerformanceStats] = useState({
    peakScore: 0,
    lowestScore: 0,
    trend: 'Loading...'
  });
  const [topPerformers, setTopPerformers] = useState([]);
  const [recentTests, setRecentTests] = useState([]);
  const [scoreDistribution, setScoreDistribution] = useState([]);
  const [topicsAnalysis, setTopicsAnalysis] = useState({ strong: [], needsHelp: [] });
  const [performanceData, setPerformanceData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('30days');
  const [insightIndex, setInsightIndex] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [classroomHandle, setClassroomHandle] = useState('');
  const [aiInsights, setAiInsights] = useState([
    {
      icon: 'calendar',
      text: "Loading insights..."
    }
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Auto-rotate insights
  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % aiInsights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'teacher') {
        // Fetch all dashboard data from single API endpoint
        const response = await dashboardAPI.getAnalytics();
        const data = response.data?.data;
        
        if (data) {
          // Set overview stats
          setStats({
            totalStudents: data.overview.totalStudents || 0,
            totalTests: data.overview.totalTests || 0,
            classAverage: data.overview.classAverage || 0,
            activeClassrooms: data.overview.activeClassrooms || 0,
            trends: data.overview.trends || { students: 0, tests: 0, average: 0 }
          });
          
          // Set all other data
          setScoreDistribution(data.scoreDistribution || []);
          setPerformanceData(data.performance?.weeklyData || []);
          setPerformanceStats({
            peakScore: data.performance?.peakScore || 0,
            lowestScore: data.performance?.lowestScore || 0,
            trend: data.performance?.trend || 'Loading...'
          });
          setRecentTests(data.recentActivity || []);
          setTopPerformers(data.topPerformers || []);
          setTopicsAnalysis({
            strong: data.topicsAnalysis?.strong || [],
            needsHelp: data.topicsAnalysis?.needsHelp || []
          });
          setClassroomHandle(data.classroomHandle || '@classroom-1');
          
          // Set AI insights with icons
          if (data.aiInsights && data.aiInsights.length > 0) {
            const insightsWithIcons = data.aiInsights.map(insight => {
              let IconComponent;
              switch (insight.icon) {
                case 'calendar': IconComponent = Calendar; break;
                case 'book': IconComponent = BookOpen; break;
                case 'activity': IconComponent = Activity; break;
                case 'alert': IconComponent = AlertCircle; break;
                default: IconComponent = Sparkles;
              }
              return {
                icon: <IconComponent className="w-5 h-5" />,
                text: insight.text
              };
            });
            setAiInsights(insightsWithIcons);
          }
          
          console.log('✅ Dashboard data loaded successfully');
        }
      } else {
        // Student view - simplified stats
        setStats({
          totalStudents: 0,
          totalTests: 0,
          classAverage: 0,
          activeClassrooms: 0,
          trends: { students: 0, tests: 0, average: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error
      setStats({
        totalStudents: 0,
        totalTests: 0,
        classAverage: 0,
        activeClassrooms: 0,
        trends: { students: 0, tests: 0, average: 0 }
      });
      setScoreDistribution([]);
      setPerformanceData([]);
      setRecentTests([]);
      setTopPerformers([]);
      setTopicsAnalysis({ strong: [], needsHelp: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHandle = () => {
    navigator.clipboard.writeText(classroomHandle);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = Math.floor((now - past) / 1000 / 60);
    
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-poor';
  };

  const quickActions = [
    { icon: <Plus />, label: 'Create New Test', subtitle: 'Build from scratch or AI', path: '/generate', primary: true },
    { icon: <Layout />, label: 'View All Classrooms', subtitle: 'Manage students & tests', path: '/classrooms' },
    { icon: <FileDown />, label: 'Generate Report', subtitle: 'Export analytics data', path: '/reports' },
    { icon: <Users />, label: 'Manage Students', subtitle: 'Add, edit, or remove', path: '/students' },
    { icon: <CalendarClock />, label: 'Schedule Test', subtitle: 'Set date & time', path: '/schedule' },
    { icon: <BarChart4 />, label: 'Analytics Deep Dive', subtitle: 'Detailed insights', path: '/analytics' }
  ];

  if (loading) {
    return (
      <div className="dashboard-premium-container">
        <div className="dashboard-loading">
          <Loader2 className="w-12 h-12 animate-spin text-accent-primary" />
          <p className="loading-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-premium-container">
      {/* Welcome Header */}
      <div className="dashboard-header-premium">
        <div className="header-content">
          <h1 className="dashboard-title">
            Welcome back, {user?.name || 'Teacher'}!
          </h1>
          <p className="dashboard-subtitle">
            Here's what's happening with your classes today
          </p>
        </div>
        <div className="header-actions">
          <button className="filter-button">
            <Clock className="w-4 h-4" />
            <span>Last 30 days</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Stats Bar */}
      <div className="stats-grid-top">
        <div className="stat-card animate-fade-in">
          <div className="stat-content">
            <div className="stat-label">Total Students</div>
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-trend positive">
              <TrendingUp className="w-4 h-4" />
              <span>+{stats.trends.students}%</span>
            </div>
          </div>
          <div className="stat-icon-wrapper blue">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-content">
            <div className="stat-label">Total Tests Created</div>
            <div className="stat-value">{stats.totalTests}</div>
            <div className="stat-trend positive">
              <TrendingUp className="w-4 h-4" />
              <span>+{stats.trends.tests}%</span>
            </div>
          </div>
          <div className="stat-icon-wrapper purple">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-content">
            <div className="stat-label">Class Average Score</div>
            <div className="stat-value">{stats.classAverage}%</div>
            <div className="stat-trend positive">
              <TrendingUp className="w-4 h-4" />
              <span>+{stats.trends.average}%</span>
            </div>
          </div>
          <div className="stat-icon-wrapper green">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="stat-content">
            <div className="stat-label">Active Classrooms</div>
            <div className="stat-value">{stats.activeClassrooms}</div>
            <div className="status-badge">Active</div>
          </div>
          <div className="stat-icon-wrapper cyan">
            <Layout className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-main-grid">
        {/* Left Column */}
        <div className="dashboard-left-column">
          {/* Performance Overview Card */}
          <div className="dashboard-card performance-card">
            <div className="card-header">
              <div className="header-title">
                <BarChart3 className="w-5 h-5 text-accent-primary" />
                <h3>Performance Overview</h3>
              </div>
              <button className="filter-dropdown">
                <span>Last 30 days</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            <div className="chart-container">
              {/* Simple SVG Chart */}
              <svg className="performance-chart" viewBox="0 0 400 200">
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4f6ef5" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4f6ef5" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                {/* Grid lines */}
                <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="120" x2="400" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <line x1="0" y1="160" x2="400" y2="160" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                
                {/* Area Chart */}
                <path
                  d="M 0 150 L 100 130 L 200 110 L 300 100 L 400 90 L 400 200 L 0 200 Z"
                  fill="url(#blueGradient)"
                />
                <path
                  d="M 0 150 L 100 130 L 200 110 L 300 100 L 400 90"
                  stroke="#4f6ef5"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>

            <div className="mini-stats-grid">
              <div className="mini-stat">
                <div className="mini-stat-icon green">
                  <ArrowUp className="w-4 h-4" />
                </div>
                <div className="mini-stat-content">
                  <div className="mini-stat-value">{performanceStats.peakScore}%</div>
                  <div className="mini-stat-label">Peak Score</div>
                </div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-icon red">
                  <ArrowDown className="w-4 h-4" />
                </div>
                <div className="mini-stat-content">
                  <div className="mini-stat-value">{performanceStats.lowestScore}%</div>
                  <div className="mini-stat-label">Lowest Dip</div>
                </div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-icon blue">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="mini-stat-content">
                  <div className="mini-stat-value">{performanceStats.trend}</div>
                  <div className="mini-stat-label">Trend</div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Distribution */}
          <div className="dashboard-card score-distribution-card">
            <div className="card-header">
              <div className="header-title">
                <PieChart className="w-5 h-5 text-accent-secondary" />
                <h3>Score Distribution</h3>
              </div>
            </div>

            <div className="donut-chart-wrapper">
              <svg className="donut-chart" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="70" fill="none" stroke="#ff5252" strokeWidth="30" strokeDasharray="22 440" transform="rotate(-90 100 100)" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="#ffab00" strokeWidth="30" strokeDasharray="53 440" strokeDashoffset="-22" transform="rotate(-90 100 100)" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="#ffd600" strokeWidth="30" strokeDasharray="88 440" strokeDashoffset="-75" transform="rotate(-90 100 100)" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="#76ff03" strokeWidth="30" strokeDasharray="167 440" strokeDashoffset="-163" transform="rotate(-90 100 100)" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="#00e676" strokeWidth="30" strokeDasharray="110 440" strokeDashoffset="-330" transform="rotate(-90 100 100)" />
                <text x="100" y="95" textAnchor="middle" className="donut-center-value">
                  {scoreDistribution.reduce((sum, item) => sum + item.count, 0)}
                </text>
                <text x="100" y="115" textAnchor="middle" className="donut-center-label">Submissions</text>
              </svg>
            </div>

            <div className="distribution-legend">
              {scoreDistribution.map((item, idx) => (
                <div key={idx} className="legend-item">
                  <div className="legend-dot" style={{ background: item.color }}></div>
                  <span className="legend-label">{item.range}</span>
                  <span className="legend-value">{item.count} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Test Activity */}
          <div className="dashboard-card recent-activity-card">
            <div className="card-header">
              <div className="header-title">
                <Activity className="w-5 h-5 text-accent-primary" />
                <h3>Recent Test Activity</h3>
              </div>
            </div>

            <div className="activity-list">
              {recentTests.length > 0 ? recentTests.map((test, idx) => (
                <div key={test.id} className="activity-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="activity-icon">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="activity-content">
                    <div className="activity-main">
                      <span className="activity-title">{test.name}</span>
                      <span className="classroom-badge">
                        <Users className="w-3 h-3" />
                        {test.classroom}
                      </span>
                    </div>
                    <div className="activity-meta">
                      <span className={`score-badge ${getScoreColor(test.averageScore)}`}>
                        {test.averageScore}%
                      </span>
                      <span className="activity-time">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(test.timestamp)}
                      </span>
                    </div>
                  </div>
                  <button className="activity-action">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <div className="empty-state">
                  <Inbox className="w-12 h-12" />
                  <h4>No tests yet</h4>
                  <p>Create your first test to see activity here</p>
                  <button className="cta-button" onClick={() => navigate('/generate')}>
                    <Plus className="w-4 h-4" />
                    Create Test
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right-column">
          {/* Top Performers */}
          <div className="dashboard-card top-performers-card">
            <div className="card-header">
              <div className="header-title">
                <Trophy className="w-5 h-5 text-warning" />
                <h3>Top 5 Performers</h3>
              </div>
            </div>

            <div className="leaderboard-list">
              {topPerformers.length > 0 ? topPerformers.map((performer, idx) => (
                <div key={performer.id} className="leaderboard-item" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="rank-badge">
                    {idx < 3 ? (
                      <Medal className={`w-5 h-5 ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : 'text-amber-600'}`} />
                    ) : (
                      <span className="rank-number">{performer.rank}</span>
                    )}
                  </div>
                  <div className="performer-avatar">
                    {performer.name.charAt(0)}
                  </div>
                  <div className="performer-info">
                    <div className="performer-name">{performer.name}</div>
                    <div className="performer-tests">
                      <CheckCircle2 className="w-3 h-3" />
                      {performer.testsCompleted} tests
                    </div>
                  </div>
                  <div className={`performer-score ${getScoreColor(performer.score)}`}>
                    {performer.score}%
                  </div>
                </div>
              )) : (
                <div className="empty-state">
                  <Users className="w-12 h-12" />
                  <h4>No submissions yet</h4>
                  <p>Create your first test!</p>
                </div>
              )}
            </div>
          </div>

          {/* Topics Analysis */}
          <div className="dashboard-card topics-analysis-card">
            <div className="card-header">
              <div className="header-title">
                <Target className="w-5 h-5 text-accent-primary" />
                <h3>Topics Overview</h3>
              </div>
            </div>

            {/* Strongest Topics */}
            <div className="topics-section">
              <div className="topics-section-header strong">
                <CheckCircle2 className="w-4 h-4" />
                <span>Strongest Topics</span>
              </div>
              {topicsAnalysis.strong.map((topic, idx) => (
                <div key={idx} className="topic-item">
                  <div className="topic-icon green">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="topic-content">
                    <span className="topic-name">{topic.topic}</span>
                    <div className="topic-progress-bar">
                      <div className="topic-progress green" style={{ width: `${topic.percentage}%` }}></div>
                    </div>
                  </div>
                  <span className="topic-percentage">{topic.percentage}%</span>
                </div>
              ))}
            </div>

            <div className="topics-divider"></div>

            {/* Topics Needing Help */}
            <div className="topics-section">
              <div className="topics-section-header warning">
                <AlertCircle className="w-4 h-4" />
                <span>Topics Needing Help</span>
              </div>
              {topicsAnalysis.needsHelp.map((topic, idx) => (
                <div key={idx} className="topic-item">
                  <div className="topic-icon amber">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="topic-content">
                    <span className="topic-name">{topic.topic}</span>
                    <div className="topic-progress-bar">
                      <div className="topic-progress amber" style={{ width: `${topic.percentage}%` }}></div>
                    </div>
                  </div>
                  <span className="topic-percentage">{topic.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="dashboard-card ai-insights-card">
            <div className="card-header">
              <div className="header-title">
                <Sparkles className="w-5 h-5 text-accent-primary" />
                <h3>AI-Powered Insights</h3>
              </div>
              <div className="premium-badge">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            </div>

            <div className="insights-carousel">
              <div className="insight-card">
                <div className="insight-icon">
                  {aiInsights[insightIndex].icon}
                </div>
                <p className="insight-text">{aiInsights[insightIndex].text}</p>
                <button className="insight-action">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="carousel-dots">
                {aiInsights.map((_, idx) => (
                  <div
                    key={idx}
                    className={`carousel-dot ${idx === insightIndex ? 'active' : ''}`}
                    onClick={() => setInsightIndex(idx)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Classroom Handle */}
          <div className="dashboard-card classroom-handle-card">
            <div className="card-header">
              <div className="header-title">
                <Hash className="w-5 h-5 text-accent-secondary" />
                <h3>Classroom Handle</h3>
              </div>
            </div>
            <div className="handle-content">
              <div className="handle-display">{classroomHandle}</div>
              <div className="handle-actions">
                <button
                  className={`handle-button ${copySuccess ? 'success' : ''}`}
                  onClick={handleCopyHandle}
                >
                  {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button className="handle-button">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card quick-actions-card">
        <div className="card-header">
          <div className="header-title">
            <Zap className="w-5 h-5 text-accent-primary" />
            <h3>Quick Actions</h3>
          </div>
        </div>

        <div className="quick-actions-grid">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className={`quick-action-item ${action.primary ? 'primary' : ''}`}
              onClick={() => navigate(action.path)}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="action-icon">
                {action.icon}
              </div>
              <div className="action-content">
                <div className="action-label">{action.label}</div>
                <div className="action-subtitle">{action.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
