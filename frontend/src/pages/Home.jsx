import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-premium">
      {/* Background Grid Pattern */}
      <div className="bg-grid-pattern"></div>

      {/* Hero Section */}
      <section className="hero-premium">
        <div className="hero-container">
          <div className="hero-content-premium">
            <h1 className="hero-heading-premium">
              Teach Like the Top 1%<br />
              <span className="gradient-text-premium">With Bodhira AI</span>
            </h1>
            <p className="hero-subheading-premium">
              Step ahead of traditional tutors. Use AI-driven assessments that adapt to each student and elevate your teaching impact to a professional, future-ready standard.
            </p>
            <div className="hero-cta-group">
              {user ? (
                <>
                  <Link to="/generate" className="cta-primary-premium">
                    Create Test
                    <span className="cta-arrow">→</span>
                  </Link>
                  <Link to="/dashboard" className="cta-glass-premium">
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="cta-primary-premium">
                    Get Started Free
                    <span className="cta-arrow">→</span>
                  </Link>
                  <Link to="/login" className="cta-glass-premium">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <p className="hero-caption-premium">
              No credit card required. Start creating in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Announcement Banner */}
      <section className="announcement-section">
        <div className="content-container">
          <div className="announcement-card">
            <div className="announcement-header">
              <span className="announcement-badge">🎯 New Platform</span>
              <h2 className="announcement-title">About Bodhira</h2>
            </div>
            <p className="announcement-text">
              Bodhira is an AI-native assessment platform designed for modern educators. We combine intelligent test generation, real-time analytics, and engaging gamification to help teachers save time while improving student outcomes.
            </p>
            <a href="#features" className="announcement-link">
              Click to explore <span className="link-arrow">→</span>
            </a>
            <div className="feature-pills">
              <div className="pill">
                <span className="pill-icon">🤖</span>
                <span className="pill-text">AI-Powered Generation</span>
              </div>
              <div className="pill">
                <span className="pill-icon">⚡</span>
                <span className="pill-text">Instant Results</span>
              </div>
              <div className="pill">
                <span className="pill-icon">📊</span>
                <span className="pill-text">Deep Analytics</span>
              </div>
              <div className="pill">
                <span className="pill-icon">🏆</span>
                <span className="pill-text">Leaderboards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="features-section-premium" id="features">
        <div className="content-container">
          <div className="section-header-premium">
            <h2 className="section-heading-premium">Why Bodhira?</h2>
            <p className="section-subheading-premium">
              Everything you need for world-class assessments
            </p>
          </div>
          <div className="feature-grid">
            <div className="feature-card-premium">
              <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, #2C52FF, #5B7FFF)' }}>
                <span>🤖</span>
              </div>
              <h3 className="feature-title-premium">Intelligent Generation</h3>
              <p className="feature-description-premium">
                Advanced AI creates contextually relevant questions tailored to your curriculum, difficulty level, and learning objectives.
              </p>
            </div>

            <div className="feature-card-premium">
              <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, #10B981, #39FF88)' }}>
                <span>📊</span>
              </div>
              <h3 className="feature-title-premium">Actionable Analytics</h3>
              <p className="feature-description-premium">
                Comprehensive insights into student performance with topic-wise analysis, trends, and personalized recommendations.
              </p>
            </div>

            <div className="feature-card-premium">
              <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' }}>
                <span>👥</span>
              </div>
              <h3 className="feature-title-premium">Classroom Ready</h3>
              <p className="feature-description-premium">
                Built for teachers. Manage classes, track student progress, and create assignments with intuitive workflows.
              </p>
            </div>

            <div className="feature-card-premium">
              <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}>
                <span>🏆</span>
              </div>
              <h3 className="feature-title-premium">Engaging Competition</h3>
              <p className="feature-description-premium">
                Global leaderboards, achievements, and gamification features that motivate students to excel.
              </p>
            </div>

            <div className="feature-card-premium">
              <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, #EF4444, #F87171)' }}>
                <span>⚡</span>
              </div>
              <h3 className="feature-title-premium">Lightning Fast</h3>
              <p className="feature-description-premium">
                Get tests in seconds. Instant grading, real-time results, and zero waiting time for students and teachers.
              </p>
            </div>

            <div className="feature-card-premium">
              <div className="feature-icon-premium" style={{ background: 'linear-gradient(135deg, #06B6D4, #22D3EE)' }}>
                <span>🎯</span>
              </div>
              <h3 className="feature-title-premium">Adaptive Learning</h3>
              <p className="feature-description-premium">
                Personalized learning paths that adapt to each student's strengths, weaknesses, and learning pace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section-premium">
        <div className="content-container">
          <div className="stats-grid-premium">
            <div className="stat-card-premium">
              <div className="stat-icon-premium">👥</div>
              <div className="stat-number-premium">10K+</div>
              <div className="stat-label-premium">Active Students</div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-icon-premium">📝</div>
              <div className="stat-number-premium">50K+</div>
              <div className="stat-label-premium">Tests Generated</div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-icon-premium">🎓</div>
              <div className="stat-number-premium">500+</div>
              <div className="stat-label-premium">Teachers</div>
            </div>
            <div className="stat-card-premium">
              <div className="stat-icon-premium">⭐</div>
              <div className="stat-number-premium">95%</div>
              <div className="stat-label-premium">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="problem-solution-section">
        <div className="content-container-narrow">
          <h2 className="section-heading-premium">
            Teaching isn't just about teaching anymore.
          </h2>
          <div className="problem-card-premium">
            <p className="problem-text-premium">
              Traditional educators spend countless hours creating tests, grading papers, analyzing results, and managing classroom logistics. Meanwhile, students need instant feedback and personalized learning experiences that paper-based systems simply can't provide.
            </p>
          </div>
          <p className="solution-callout-premium">
            Bodhira fixes this.
          </p>
          <p className="solution-text-premium">
            Our AI-powered platform handles the busywork—test generation, grading, analytics, and more—so you can focus on what matters: teaching. Students get instant feedback and engaging experiences that keep them motivated. Everyone wins.
          </p>
        </div>
      </section>

      {/* Feature List Section */}
      <section className="feature-list-section">
        <div className="content-container">
          <h2 className="section-heading-premium">Why teachers love Bodhira</h2>
          <div className="feature-list-grid">
            <div className="feature-list-item">
              <div className="feature-list-icon">🤖</div>
              <div className="feature-list-content">
                <h3 className="feature-list-title">AI-Powered Test Generation</h3>
                <p className="feature-list-description">
                  Create comprehensive tests in seconds with AI that understands your curriculum and learning objectives.
                </p>
              </div>
            </div>

            <div className="feature-list-item">
              <div className="feature-list-icon">⚡</div>
              <div className="feature-list-content">
                <h3 className="feature-list-title">Instant Test-Taking System</h3>
                <p className="feature-list-description">
                  Students take tests online with automatic grading and immediate results. No more paper, no more waiting.
                </p>
              </div>
            </div>

            <div className="feature-list-item">
              <div className="feature-list-icon">👥</div>
              <div className="feature-list-content">
                <h3 className="feature-list-title">Classroom & Student Management</h3>
                <p className="feature-list-description">
                  Organize classes, track progress, and manage students with powerful yet simple tools.
                </p>
              </div>
            </div>

            <div className="feature-list-item">
              <div className="feature-list-icon">📊</div>
              <div className="feature-list-content">
                <h3 className="feature-list-title">Premium Performance Analytics</h3>
                <p className="feature-list-description">
                  Deep insights into student performance with topic analysis, trends, and actionable recommendations.
                </p>
              </div>
            </div>

            <div className="feature-list-item">
              <div className="feature-list-icon">⏱️</div>
              <div className="feature-list-content">
                <h3 className="feature-list-title">Save Hours Every Week</h3>
                <p className="feature-list-description">
                  Automate test creation, grading, and analysis. Spend your time teaching, not on administrative work.
                </p>
              </div>
            </div>

            <div className="feature-list-item">
              <div className="feature-list-icon">🏆</div>
              <div className="feature-list-content">
                <h3 className="feature-list-title">Gamification & Engagement</h3>
                <p className="feature-list-description">
                  Leaderboards, achievements, and competitive features that motivate students to perform their best.
                </p>
              </div>
            </div>

            <div className="feature-list-item">
              <div className="feature-list-icon">📱</div>
              <div className="feature-list-content">
                <h3 className="feature-list-title">Multi-Device Support</h3>
                <p className="feature-list-description">
                  Works seamlessly on desktop, tablet, and mobile. Students can take tests anywhere, anytime.
                </p>
              </div>
            </div>

            <div className="feature-list-item">
              <div className="feature-list-icon">🔒</div>
              <div className="feature-list-content">
                <h3 className="feature-list-title">Secure & Reliable</h3>
                <p className="feature-list-description">
                  Enterprise-grade security with reliable infrastructure. Your data is safe and always available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner-section">
        <div className="cta-banner-content-premium">
          <h2 className="cta-banner-heading">Ready to transform your classroom?</h2>
          <p className="cta-banner-subheading">
            Join educators worldwide using Bodhira to create better assessments, save time, and improve student outcomes.
          </p>
          <Link to="/register" className="cta-banner-button">
            Start Free Now
            <span className="cta-arrow">→</span>
          </Link>
          <p className="cta-banner-secondary">
            Already have an account? <Link to="/login" className="cta-banner-link">Sign in here</Link>
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section-premium">
        <div className="content-container">
          <div className="final-cta-card-premium">
            <h2 className="final-cta-heading">Built for Modern Education</h2>
            <p className="final-cta-description">
              Bodhira isn't just another EdTech tool—it's a complete transformation of how assessments work. We've combined cutting-edge AI, intuitive design, and powerful analytics to create something truly special.
            </p>
            <p className="final-cta-statement">
              Teach better. Save time. Improve student performance. All in one platform.
            </p>
            <Link to="/register" className="final-cta-button">
              Start Creating Tests
              <span className="cta-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="footer-spacing"></div>
    </div>
  );
};

export default Home;