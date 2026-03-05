import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI, paymentAPI, profileAPI } from '../services/api';
import { processSubscriptionPayment } from '../utils/razorpay';
import {
  GraduationCap,
  LogOut,
  FileText,
  Star,
  Flame,
  TrendingUp,
  BarChart3,
  School,
  CreditCard,
  Check,
  Zap,
  Users
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subscribing, setSubscribing] = useState(null);
  const abortControllerRef = useRef(null);

  // Subscription plans data
  const subscriptionPlans = [
    {
      id: 'single',
      name: 'Single Test',
      subtitle: 'Perfect for one-time use',
      originalPrice: 39,
      currentPrice: 29,
      discount: '26% OFF',
      perUnit: 'Per test',
      features: ['One single test generation'],
      popular: false
    },
    {
      id: 'monthly',
      name: 'Monthly',
      subtitle: 'Great for regular testing',
      originalPrice: 349,
      currentPrice: 299,
      discount: '14% OFF',
      perUnit: '₹10/day',
      features: ['Unlimited test generation', '30 days access', 'Premium support'],
      popular: false
    },
    {
      id: '6months',
      name: '6 Months',
      subtitle: 'Best value for educators',
      originalPrice: 1799,
      currentPrice: 1499,
      discount: '17% OFF',
      perUnit: '₹8.3/day',
      features: ['Unlimited test generation', '180 days access', 'Premium support'],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Yearly',
      subtitle: 'Maximum savings',
      originalPrice: 3999,
      currentPrice: 2499,
      discount: '38% OFF',
      perUnit: '₹6.8/day',
      features: ['Unlimited test generation', '365 days access', 'Premium support', 'Priority features'],
      popular: true
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setError(null);
    setLoading(true);
    setProfile(null);
    fetchProfile(abortController.signal);
    
    return () => {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    };
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'subscription') {
      setTimeout(() => {
        const subscriptionSection = document.querySelector('[data-section="subscription"]');
        if (subscriptionSection) {
          subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [searchParams]);

  const fetchProfile = async (signal) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getCurrentUser(signal);
      const userData = response.data.data?.user || response.data.user;
      if (userData) {
        setProfile(userData);
        setLoading(false);
      } else {
        setError('Failed to load profile');
        setLoading(false);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch profile:', error);
        if (error.response?.status === 401) {
          navigate('/login', { replace: true });
          return;
        }
        setError('Failed to load profile');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (profile) {
      const abortController = new AbortController();
      const signal = abortController.signal;
      
      fetchStats(signal);
      fetchSubscription(signal);
      
      return () => abortController.abort();
    }
  }, [profile]);

  const fetchSubscription = async (signal) => {
    try {
      setSubscriptionLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const response = await paymentAPI.getSubscription(signal);
      setSubscription(response.data.subscription);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch subscription:', error);
      }
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const fetchStats = async (signal) => {
    try {
      setStatsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      const response = await profileAPI.getProfile(signal);
      const statsData = response.data.data?.stats || {};
      setStats(statsData);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch stats:', error);
      }
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    if (subscribing) return;
    
    setSubscribing(planId);
    try {
      await processSubscriptionPayment(planId);
      await fetchSubscription(new AbortController().signal);
    } catch (error) {
      console.error('Subscription failed:', error);
    } finally {
      setSubscribing(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-premium-container">
        <div className="profile-premium-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-premium-container">
        <div className="profile-premium-error">
          <p>{error}</p>
          <button onClick={() => fetchProfile(new AbortController().signal)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-premium-container">
      <div className="profile-premium-layout">
        {/* LEFT COLUMN - User Profile Card */}
        <aside className="profile-left-column">
          <div className="profile-card-premium">
            {/* Profile Header */}
            <div className="profile-header-premium">
              <div className="profile-avatar-large">
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.name} />
                ) : (
                  <div className="avatar-placeholder-large">
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              
              <h1 className="profile-name-premium">{profile?.name || 'Guest User'}</h1>
              <p className="profile-username-premium">{profile?.handle || user?.handle || '@user'}</p>
              
              <div className="profile-role-badge">
                <GraduationCap size={20} strokeWidth={2.5} />
                <span>{profile?.role === 'teacher' ? 'Teacher' : 'Student'}</span>
              </div>
            </div>

            <div className="profile-divider"></div>

            {/* Account Info Grid */}
            <div className="account-info-grid">
              <div className="info-item">
                <div className="info-label">USER ID</div>
                <div className="info-value" title={profile?._id}>
                  {profile?._id?.substring(0, 12)}...
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">EMAIL</div>
                <div className="info-value">{profile?.email || 'N/A'}</div>
              </div>

              <div className="info-item">
                <div className="info-label">MEMBER SINCE</div>
                <div className="info-value">
                  {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">ACCOUNT STATUS</div>
                <div className="status-badge-active">Active</div>
              </div>
            </div>

            <div className="profile-divider"></div>

            {/* Quick Stats Grid */}
            <div className="quick-stats-grid">
              <div className="quick-stat-card">
                <FileText size={32} className="stat-icon-blue" strokeWidth={2} />
                <div className="stat-content">
                  <div className="stat-label">Tests Created</div>
                  <div className="stat-number">{stats?.testsCreated || 0}</div>
                </div>
              </div>

              <div className="quick-stat-card">
                <Star size={32} className="stat-icon-yellow" strokeWidth={2} />
                <div className="stat-content">
                  <div className="stat-label">Average Score</div>
                  <div className="stat-number">{stats?.avgScore || 0}%</div>
                </div>
              </div>

              <div className="quick-stat-card">
                <Flame size={32} className="stat-icon-orange" strokeWidth={2} />
                <div className="stat-content">
                  <div className="stat-label">Current Streak</div>
                  <div className="stat-number">{stats?.streak || 0}</div>
                </div>
              </div>

              <div className="quick-stat-card">
                <Users size={32} className="stat-icon-purple" strokeWidth={2} />
                <div className="stat-content">
                  <div className="stat-label">Total Students</div>
                  <div className="stat-number">{stats?.totalStudents || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <section className="section-card-premium activity-summary-left">
            <div className="section-header-premium">
              <BarChart3 size={28} strokeWidth={2} />
              <h2>Activity Summary</h2>
            </div>

            <div className="activity-summary-grid">
              <div className="activity-item">
                <div className="activity-icon activity-icon-blue">
                  <FileText size={24} strokeWidth={2} />
                </div>
                <div className="activity-content">
                  <div className="activity-number">{statsLoading ? '-' : (stats?.testsCreated || 0)}</div>
                  <div className="activity-label">Tests Created</div>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon activity-icon-green">
                  <Check size={24} strokeWidth={2.5} />
                </div>
                <div className="activity-content">
                  <div className="activity-number">{statsLoading ? '-' : (stats?.publishedTests || 0)}</div>
                  <div className="activity-label">Published Tests</div>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon activity-icon-orange">
                  <School size={24} strokeWidth={2} />
                </div>
                <div className="activity-content">
                  <div className="activity-number">{statsLoading ? '-' : (stats?.totalClassrooms || 0)}</div>
                  <div className="activity-label">Classrooms</div>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon activity-icon-purple">
                  <GraduationCap size={24} strokeWidth={2} />
                </div>
                <div className="activity-content">
                  <div className="activity-number">{statsLoading ? '-' : (stats?.totalStudents || 0)}</div>
                  <div className="activity-label">Total Students</div>
                </div>
              </div>
            </div>
          </section>

          {/* Logout Button */}
          <button className="logout-button-premium" onClick={handleLogout}>
            <LogOut size={18} strokeWidth={2} />
            <span>Logout</span>
          </button>
        </aside>

        {/* RIGHT COLUMN - Detailed Sections */}
        <main className="profile-right-column">
          {/* Performance Overview */}
          <section className="section-card-premium">
            <div className="section-header-premium">
              <BarChart3 size={28} strokeWidth={2} />
              <h2>Teaching Performance Overview</h2>
            </div>

            <div className="performance-stats-grid">
              <div className="performance-stat-card">
                <div className="performance-label">TOTAL TEST ATTEMPTS</div>
                <div className="performance-number-gradient">
                  {statsLoading ? '-' : (stats?.totalAttempts || stats?.totalTests || 0)}
                </div>
              </div>

              <div className="performance-stat-card">
                <div className="performance-label">AVG STUDENT SCORE</div>
                <div className="performance-number-gradient">
                  {statsLoading ? '-' : (stats?.avgStudentScore || stats?.averageScore || 0)}%
                </div>
              </div>

              <div className="performance-stat-card">
                <div className="performance-label">TESTS CREATED</div>
                <div className="performance-number-gradient">
                  {statsLoading ? '-' : (stats?.testsCreated || stats?.totalTestsCreated || 0)}
                </div>
              </div>

              <div className="performance-stat-card">
                <div className="performance-label">ACTIVE STUDENTS</div>
                <div className="performance-number-gradient">
                  {statsLoading ? '-' : (stats?.activeStudents || stats?.totalStudents || 0)}
                </div>
              </div>
            </div>
          </section>

          {/* Classroom Overview */}
          <section className="section-card-premium">
            <div className="section-header-premium">
              <School size={28} strokeWidth={2} />
              <h2>Classroom Overview</h2>
            </div>

            <div className="classroom-overview-grid">
              <div className="classroom-card classroom-card-blue">
                <div className="classroom-label">TOTAL CLASSROOMS</div>
                <div className="classroom-number-blue">
                  {statsLoading ? '-' : (stats?.totalClassrooms || stats?.classrooms?.length || 0)}
                </div>
              </div>

              <div className="classroom-card classroom-card-purple">
                <div className="classroom-label">AVG CLASS SIZE</div>
                <div className="classroom-number-purple">
                  {statsLoading ? '-' : (stats?.avgClassSize || stats?.averageClassSize || 0)}
                </div>
              </div>
            </div>
          </section>

          {/* Subscription Plans */}
          <section className="section-card-premium" data-section="subscription">
            <div className="section-header-premium">
              <CreditCard size={28} strokeWidth={2} />
              <h2>Subscription Plans</h2>
            </div>

              <div className="subscription-plans-grid">
                {subscriptionPlans.map((plan) => (
                  <div key={plan.id} className="plan-card-premium">
                    {plan.discount && (
                      <div className="plan-discount-badge">
                        🔥 {plan.discount}
                      </div>
                    )}
                    {plan.popular && (
                      <div className="plan-popular-badge">
                        ⭐ MOST POPULAR
                      </div>
                    )}

                    <div className="plan-header">
                      <h3 className="plan-name">{plan.name}</h3>
                      <p className="plan-subtitle">{plan.subtitle}</p>
                    </div>

                    <div className="plan-pricing">
                      <div className="plan-original-price">₹{plan.originalPrice}</div>
                      <div className="plan-current-price">₹{plan.currentPrice}</div>
                      <div className="plan-per-unit">{plan.perUnit}</div>
                    </div>

                    <div className="plan-features">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="plan-feature">
                          <Check size={18} className="feature-check" strokeWidth={2.5} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      className="plan-cta-button"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribing === plan.id}
                    >
                      {subscribing === plan.id ? 'Processing...' : (
                        <>
                          Upgrade Now <Zap size={18} />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="subscription-footer-note">
                💡 All plans include unlimited test sharing, analytics, and premium support
              </div>
            </section>
        </main>
      </div>
    </div>
  );
};

export default Profile;
