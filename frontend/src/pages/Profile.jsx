import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI, paymentAPI, profileAPI } from '../services/api';
import { processSubscriptionPayment } from '../utils/razorpay';
import './Profile.css';
import './Dashboard.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Handle tab navigation from URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'subscription') {
      // Scroll to subscription section after a short delay to ensure DOM is ready
      setTimeout(() => {
        const subscriptionSection = document.querySelector('[data-section="subscription"]');
        if (subscriptionSection) {
          subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [searchParams]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getCurrentUser();
      const userData = response.data.data?.user || response.data.user;
      setProfile(userData);
      setFormData({ name: userData.name, bio: userData.bio || '' });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchStats();
      fetchSubscription();
    }
  }, [profile]);

  const fetchSubscription = async () => {
    try {
      const response = await paymentAPI.getSubscription();
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await profileAPI.getProfile();
      const statsData = response.data.data?.stats || {};
      console.log('📊 Profile Stats Fetched:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await authAPI.updateProfile(formData);
      const updatedUser = response.data.data?.user;
      setProfile(updatedUser);
      setEditModalOpen(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setError(error.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubscribe = async (plan) => {
    setSubscribing(plan);
    try {
      await processSubscriptionPayment(
        plan,
        {
          name: profile.name,
          email: profile.email,
          contact: profile.phone || '',
        },
        () => {
          // Success callback
          fetchSubscription();
        },
        (error) => {
          // Failure callback
          console.error('Subscription failed:', error);
          setError(error || 'Subscription failed. Please try again.');
        }
      );
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="skeleton-profile-container">
        {/* Avatar Skeleton */}
        <div className="skeleton-profile-avatar"></div>
        
        {/* Name and Handle Skeleton */}
        <div className="skeleton-profile-name"></div>
        <div className="skeleton-profile-handle"></div>
        
        {/* Details Grid Skeleton */}
        <div className="skeleton-profile-grid">
          <div className="skeleton-profile-item"></div>
          <div className="skeleton-profile-item"></div>
          <div className="skeleton-profile-item"></div>
          <div className="skeleton-profile-item"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="skeleton-profile-stats">
          <div className="skeleton-profile-stat-card"></div>
          <div className="skeleton-profile-stat-card"></div>
          <div className="skeleton-profile-stat-card"></div>
          <div className="skeleton-profile-stat-card"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <div className="profile-error-box">
          <p>{error || 'Failed to load profile'}</p>
        </div>
      </div>
    );
  }

  const avatarColor = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'][Math.floor(Math.random() * 6)];
  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const isStudent = profile.role === 'student';
  const isTeacher = profile.role === 'teacher';

  return (
    <div className="profile-container">
      {/* Premium Background with Abstract Shapes */}
      <div className="profile-bg-decoration profile-bg-shape-1"></div>
      <div className="profile-bg-decoration profile-bg-shape-2"></div>
      <div className="profile-bg-decoration profile-bg-shape-3"></div>

      {/* Floating Edit Button */}
      <button
        onClick={() => setEditModalOpen(true)}
        className="profile-floating-edit-btn"
      >
        <span className="edit-btn-icon">✏️</span>
        <span className="edit-btn-text">Edit</span>
      </button>

      {/* Main Glassmorphic Card */}
      <div className="profile-card-wrapper">
        <div className="profile-main-card">
          {/* Header Section - Avatar, Name, Role */}
          <div className="profile-card-header">
            <div className="profile-avatar-section">
              <div className="profile-avatar-container" style={{ background: avatarColor }}>
                <span className="profile-avatar-initials">{initials}</span>
                <div className="profile-avatar-glow"></div>
              </div>
            </div>

            <div className="profile-header-content">
              <h1 className="profile-user-name">{profile.name}</h1>
              <p className="profile-user-handle">@{profile.handle}</p>
              <div className="profile-role-badge">
                <span className="role-icon">
                  {isTeacher ? '👨‍🏫' : isStudent ? '👨‍🎓' : '👤'}
                </span>
                <span className="role-text">
                  {isTeacher ? 'Teacher' : isStudent ? 'Student' : 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="profile-bio-section">
              <p className="profile-bio">{profile.bio}</p>
            </div>
          )}

          {/* Details Grid - 2 Columns */}
          <div className="profile-details-grid">
            <div className="profile-detail-item">
              <span className="detail-label">User ID</span>
              <span className="detail-value">{profile._id?.substring(0, 12)}...</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{profile.email}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">
                {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Account Status</span>
              <span className="detail-value status-active">Active</span>
            </div>
          </div>

          {/* Stats Section - 4 Stat Cards */}
          <div className="profile-stats-section">
            <div className="profile-quick-stat">
              <div className="stat-icon stat-icon-blue">📝</div>
              <div className="stat-content">
                <span className="stat-label">{isTeacher ? 'Tests Created' : 'Tests Taken'}</span>
                <span className="stat-number">{isTeacher ? (stats?.testsCreated || 0) : (stats?.testsAttempted || 0)}</span>
              </div>
            </div>

            <div className="profile-quick-stat">
              <div className="stat-icon stat-icon-green">⭐</div>
              <div className="stat-content">
                <span className="stat-label">{isTeacher ? 'Avg. Student Score' : 'Average Score'}</span>
                <span className="stat-number">{stats?.averageScore ? `${Math.round(stats.averageScore)}%` : (stats?.averageStudentScore ? `${Math.round(stats.averageStudentScore)}%` : '—')}</span>
              </div>
            </div>

            <div className="profile-quick-stat">
              <div className="stat-icon stat-icon-orange">🔥</div>
              <div className="stat-content">
                <span className="stat-label">Current Streak</span>
                <span className="stat-number">{typeof stats?.streak === 'number' ? stats.streak : (isTeacher ? '—' : 0)}</span>
              </div>
            </div>

            <div className="profile-quick-stat">
              <div className="stat-icon stat-icon-purple">📈</div>
              <div className="stat-content">
                <span className="stat-label">Improvement</span>
                <span className="stat-number">{typeof stats?.improvement === 'number' ? (stats.improvement > 0 ? `+${stats.improvement}%` : stats.improvement === 0 ? '—' : `${stats.improvement}%`) : (isTeacher ? '—' : '—')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Below Card */}
      <div className="profile-content-wrapper">
        {/* STUDENT PROFILE STATS */}
        {isStudent && (
          <>
            {/* Statistics Grid */}
            <div className="profile-stats-grid">
              {/* Tests Taken */}
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                  📝
                </div>
                <div className="profile-stat-content">
                  <p className="profile-stat-label">Tests Taken</p>
                  <p className="profile-stat-value" style={{ color: '#3b82f6' }}>
                    {stats?.testsAttempted || 0}
                  </p>
                </div>
              </div>

              {/* Average Score */}
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  ⭐
                </div>
                <div className="profile-stat-content">
                  <p className="profile-stat-label">Average Score</p>
                  <p className="profile-stat-value" style={{ color: '#10b981' }}>
                    {stats?.averageScore ? `${Math.round(stats.averageScore)}%` : '—'}
                  </p>
                </div>
              </div>

              {/* Current Streak */}
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  🔥
                </div>
                <div className="profile-stat-content">
                  <p className="profile-stat-label">Current Streak</p>
                  <p className="profile-stat-value" style={{ color: '#f59e0b' }}>
                    {typeof stats?.streak === 'number' ? stats.streak : 0}
                  </p>
                </div>
              </div>

              {/* Improvement */}
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' }}>
                  📈
                </div>
                <div className="profile-stat-content">
                  <p className="profile-stat-label">Improvement</p>
                  <p className="profile-stat-value" style={{ color: '#a855f7' }}>
                    {typeof stats?.improvement === 'number' ? (stats.improvement > 0 ? `+${stats.improvement}%` : stats.improvement === 0 ? '—' : `${stats.improvement}%`) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Learning Profile Section */}
            <div className="profile-section">
              <h2 className="profile-section-title">📚 Your Learning Profile</h2>
              <div className="profile-learning-grid">
                {/* Strongest Topics */}
                <div className="profile-learning-card">
                  <h3 className="profile-learning-card-title">💪 Strongest Topics</h3>
                  <div className="profile-topics-list">
                    {stats?.strongestTopics && stats.strongestTopics.length > 0 ? (
                      stats.strongestTopics.map((topic, index) => (
                        <div key={index} className="profile-topic-badge" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)', borderColor: '#10b981' }}>
                          <div>
                            <span className="profile-topic-name">{topic.topic}</span>
                            <span className="profile-topic-score">{topic.score}%</span>
                          </div>
                          <span className="profile-topic-indicator">✓</span>
                        </div>
                      ))
                    ) : (
                      <p className="profile-empty-state">Take tests to build your profile</p>
                    )}
                  </div>
                </div>

                {/* Weakest Topics */}
                <div className="profile-learning-card">
                  <h3 className="profile-learning-card-title">🎯 Areas to Improve</h3>
                  <div className="profile-topics-list">
                    {stats?.weakestTopics && stats.weakestTopics.length > 0 ? (
                      stats.weakestTopics.map((topic, index) => (
                        <div key={index} className="profile-topic-badge" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)', borderColor: '#ef4444' }}>
                          <div>
                            <span className="profile-topic-name">{topic.topic}</span>
                            <span className="profile-topic-score">{topic.score}%</span>
                          </div>
                          <span className="profile-topic-indicator">⚡</span>
                        </div>
                      ))
                    ) : (
                      <p className="profile-empty-state">Take tests to identify areas for improvement</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Performance Section */}
            <div className="profile-section">
              <h2 className="profile-section-title">📊 Recent Performance</h2>
              <div className="profile-performance-card">
                <div className="profile-performance-content">
                  <div className="profile-performance-item">
                    <span className="profile-performance-label">Success Rate</span>
                    <span className="profile-performance-value">
                      {stats?.averageScore ? `${Math.round(stats.averageScore)}%` : '—'}
                    </span>
                  </div>
                  <div className="profile-performance-item">
                    <span className="profile-performance-label">Tests Completed</span>
                    <span className="profile-performance-value">
                      {stats?.totalTestsTaken || 0}
                    </span>
                  </div>
                  <div className="profile-performance-item">
                    <span className="profile-performance-label">Topics Covered</span>
                    <span className="profile-performance-value">
                      {stats?.topicCount || 0}
                    </span>
                  </div>
                  <div className="profile-performance-item">
                    <span className="profile-performance-label">Streak</span>
                    <span className="profile-performance-value">
                      {stats?.streak || 0} 🔥
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Tests */}
              {stats?.recentTests && stats.recentTests.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '15px' }}>Recent Tests</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {stats.recentTests.map((test, index) => (
                      <div key={index} style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <p style={{ color: '#e2e8f0', margin: '0 0 4px 0', fontWeight: '600' }}>{test.topic}</p>
                          <p style={{ color: '#64748b', margin: 0, fontSize: '12px' }}>
                            {new Date(test.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {test.difficulty}
                          </p>
                        </div>
                        <span style={{
                          color: test.score >= 60 ? '#10b981' : '#ef4444',
                          fontWeight: '700',
                          fontSize: '16px'
                        }}>
                          {test.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!stats?.recentTests || stats.recentTests.length === 0) && (
                <div style={{ marginTop: '20px', textAlign: 'center', padding: '20px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px dashed rgba(59, 130, 246, 0.2)' }}>
                  <p style={{ color: '#94a3b8', margin: 0 }}>No recent tests yet. Start taking tests to see your performance here!</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* TEACHER PROFILE STATS */}
        {isTeacher && (
          <>
            {/* Statistics Grid */}
            <div className="profile-stats-grid">
              {/* Tests Created */}
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                  📝
                </div>
                <div className="profile-stat-content">
                  <p className="profile-stat-label">Tests Created</p>
                  <p className="profile-stat-value" style={{ color: '#3b82f6' }}>
                    {stats?.testsCreated || 0}
                  </p>
                </div>
              </div>

              {/* Published Tests */}
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  ✅
                </div>
                <div className="profile-stat-content">
                  <p className="profile-stat-label">Published Tests</p>
                  <p className="profile-stat-value" style={{ color: '#10b981' }}>
                    {stats?.publishedTests || 0}
                  </p>
                </div>
              </div>

              {/* Classrooms Created */}
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  🏫
                </div>
                <div className="profile-stat-content">
                  <p className="profile-stat-label">Classrooms</p>
                  <p className="profile-stat-value" style={{ color: '#f59e0b' }}>
                    {stats?.classroomsCreated || 0}
                  </p>
                </div>
              </div>

              {/* Total Students */}
              <div className="profile-stat-card">
                <div className="profile-stat-icon" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)' }}>
                  👥
                </div>
                <div className="profile-stat-content">
                  <p className="profile-stat-label">Total Students</p>
                  <p className="profile-stat-value" style={{ color: '#a855f7' }}>
                    {stats?.totalStudents || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Teaching Performance Section */}
            <div className="profile-section">
              <h2 className="profile-section-title">📊 Teaching Performance Overview</h2>
              <div className="profile-performance-card">
                <div className="profile-performance-content">
                  <div className="profile-performance-item">
                    <span className="profile-performance-label">Total Test Attempts</span>
                    <span className="profile-performance-value">
                      {stats?.totalAttempts || 0}
                    </span>
                  </div>
                  <div className="profile-performance-item">
                    <span className="profile-performance-label">Avg Student Score</span>
                    <span className="profile-performance-value">
                      {stats?.averageStudentScore ? `${Math.round(stats.averageStudentScore)}%` : '—'}
                    </span>
                  </div>
                  <div className="profile-performance-item">
                    <span className="profile-performance-label">Tests Created</span>
                    <span className="profile-performance-value">
                      {stats?.testsCreated || 0}
                    </span>
                  </div>
                  <div className="profile-performance-item">
                    <span className="profile-performance-label">Active Students</span>
                    <span className="profile-performance-value">
                      {stats?.totalStudents || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Classroom Overview Section */}
            <div className="profile-section">
              <h2 className="profile-section-title">🏫 Classroom Overview</h2>
              <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px'
                }}>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '15px',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Total Classrooms</p>
                    <p style={{ color: '#3b82f6', fontSize: '28px', fontWeight: '700', margin: 0 }}>
                      {stats?.classroomsCreated || 0}
                    </p>
                  </div>
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '15px',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Avg Class Size</p>
                    <p style={{ color: '#a855f7', fontSize: '28px', fontWeight: '700', margin: 0 }}>
                      {stats?.averageClassSize || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Subscription Plans Section */}
        <div className="profile-section" data-section="subscription">
          <h2 className="profile-section-title">💳 Subscription Plans</h2>
          
          {subscription?.status === 'active' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <p style={{ color: '#10b981', margin: '0 0 8px 0', fontWeight: '600' }}>
                ✅ Active Subscription
              </p>
              <p style={{ color: '#cbd5e1', margin: '0 0 4px 0' }}>
                Plan: <strong>{subscription?.plan?.charAt(0).toUpperCase() + subscription?.plan?.slice(1)}</strong>
              </p>
              <p style={{ color: '#cbd5e1', margin: 0 }}>
                Expires: {new Date(subscription?.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} ({subscription?.daysRemaining} days)
              </p>
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {[
              { name: 'Single Test', amount: 29, originalAmount: 39, validity: 1, plan: 'single', dailyRate: 'Per test', priceType: 'One-time' },
              { name: 'Monthly', amount: 299, originalAmount: 349, validity: 30, plan: 'monthly', dailyRate: '₹10/day', priceType: 'Monthly' },
              { name: '6 Months', amount: 1499, originalAmount: 1799, validity: 180, plan: '6months', dailyRate: '₹8.3/day', priceType: '6 Months' },
              { name: 'Yearly', amount: 2499, originalAmount: 3999, validity: 365, plan: 'yearly', dailyRate: '₹6.8/day', priceType: 'Yearly' }
            ].map((planOption) => {
              const discount = Math.round(((planOption.originalAmount - planOption.amount) / planOption.originalAmount) * 100);
              return (
                <div key={planOption.plan} style={{
                  position: 'relative',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.5) 100%)',
                  border: '2px solid rgba(96, 165, 250, 0.25)',
                  borderRadius: '18px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(96, 165, 250, 0.1)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.5)';
                  e.currentTarget.style.boxShadow = '0 16px 48px rgba(59, 130, 246, 0.25), 0 0 30px rgba(96, 165, 250, 0.2)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.6) 100%)';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.25)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(96, 165, 250, 0.1)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.5) 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      padding: '8px 20px',
                      borderRadius: '0 16px 0 12px',
                      fontSize: '13px',
                      fontWeight: '800',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      letterSpacing: '0.5px',
                      zIndex: 10,
                      whiteSpace: 'nowrap'
                    }}>
                      🔥 {discount}% OFF
                    </div>
                  )}

                  {/* Plan Name and Type */}
                  <div>
                    <h3 style={{ 
                      color: '#e2e8f0', 
                      margin: '0 0 8px 0', 
                      fontSize: '22px', 
                      fontWeight: '800', 
                      letterSpacing: '-0.5px',
                      background: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {planOption.name}
                    </h3>
                    <p style={{ color: '#a0aec0', margin: '0', fontSize: '13px', fontWeight: '500', opacity: 0.9 }}>
                      {planOption.priceType} Plan
                    </p>
                  </div>

                  {/* Price Section with Strike-through */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)', 
                    borderRadius: '14px', 
                    padding: '20px', 
                    textAlign: 'center', 
                    border: '1px solid rgba(96, 165, 250, 0.15)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                      <p style={{ 
                        color: '#f1f5f9', 
                        fontSize: '16px', 
                        margin: 0, 
                        fontWeight: '600',
                        textDecoration: 'line-through',
                        textDecorationColor: '#ef4444',
                        textDecorationThickness: '2px'
                      }}>
                        ₹{planOption.originalAmount}
                      </p>
                    </div>
                    <p style={{ 
                      color: '#3b82f6', 
                      fontSize: '40px', 
                      fontWeight: '900', 
                      margin: '0 0 6px 0', 
                      letterSpacing: '-1px'
                    }}>
                      ₹{planOption.amount}
                    </p>
                    <p style={{ 
                      color: '#93c5fd', 
                      fontSize: '13px', 
                      margin: '0', 
                      fontWeight: '600',
                      opacity: 0.95
                    }}>
                      {planOption.dailyRate}
                    </p>
                  </div>

                  {/* Features List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {planOption.plan === 'single' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '13px', fontWeight: '500' }}>
                        <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                        <span>One single test generation</span>
                      </div>
                    )}
                    {(planOption.plan === 'monthly' || planOption.plan === '6months' || planOption.plan === 'yearly') && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '13px', fontWeight: '500' }}>
                          <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                          <span>Unlimited test generation</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '13px', fontWeight: '500' }}>
                          <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                          <span>{planOption.validity} days access</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1', fontSize: '13px', fontWeight: '500' }}>
                          <span style={{ color: '#10b981', fontWeight: '700' }}>✓</span>
                          <span>Premium support</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Upgrade Button */}
                  <button
                    onClick={() => handleSubscribe(planOption.plan)}
                    disabled={subscribing !== null}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: '#fff',
                      border: '2px solid rgba(96, 165, 250, 0.3)',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: subscribing !== null ? 'not-allowed' : 'pointer',
                      opacity: subscribing !== null ? 0.6 : 1,
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)',
                      letterSpacing: '0.3px',
                      marginTop: 'auto'
                    }}
                    onMouseEnter={(e) => {
                      if (subscribing === null) {
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.35)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
                    }}
                  >
                    {subscribing === planOption.plan ? (
                      <>Processing...</>
                    ) : (
                      <>Upgrade Now 🚀</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Info Banner */}
          <div style={{
            marginTop: '32px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ 
              color: '#cbd5e1', 
              fontSize: '13px', 
              margin: 0,
              fontWeight: '500'
            }}>
              💡 All plans include unlimited test sharing, analytics, and premium support
            </p>
          </div>
        </div>

        {/* Logout Section at Bottom */}
        <div className="profile-footer">
          <button
            onClick={handleLogout}
            className="profile-logout-btn"
          >
            🚪 Logout
          </button>
          <p className="profile-footer-text">
            Last login: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div
          className="profile-modal"
          onClick={() => setEditModalOpen(false)}
        >
          <div
            className="profile-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="profile-modal-header">
              <h2 className="profile-modal-title">
                Edit Profile
              </h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="profile-modal-close"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="profile-modal-body">
              {error && (
                <div className="profile-error-message">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave}>
                {/* Name */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="profile-form-input"
                  />
                </div>

                {/* Bio */}
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Add a short bio about yourself..."
                    className="profile-form-textarea"
                  />
                  <p className="profile-form-hint">
                    {formData.bio.length}/200
                  </p>
                </div>

                {/* Info */}
                <div className="profile-form-info">
                  ℹ️ Your handle (@{profile.handle}) and email cannot be changed.
                </div>

                {/* Buttons */}
                <div className="profile-modal-buttons">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="profile-btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="profile-btn-save"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
