import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const aboutSectionRef = useRef(null);

  const scrollToAbout = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    aboutSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-container">
      {/* Hero Section - Two Column Layout */}
      <section className="hero-section">
        {/* Left Column - Text & CTA */}
        <div className="hero-left">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              <span className="badge-text">AI-Native Assessment Platform</span>
            </div>

            <h1 className="hero-title">
              The Fastest Way to <span className="gradient-text">Generate Tests</span>
            </h1>

            <p className="hero-subtitle">
              Create powerful, AI-generated assessments in seconds. Streamline your teaching workflow and empower your students with intelligent testing.
            </p>

            <div className="hero-cta-buttons">
              {user ? (
                <>
                  <Link to="/generate" className="cta-button cta-primary">
                    <span>Create Test</span>
                    <span className="cta-arrow">→</span>
                  </Link>
                  <Link to="/dashboard" className="cta-button cta-secondary">
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="cta-button cta-primary">
                    <span>Get Started Free</span>
                    <span className="cta-arrow">→</span>
                  </Link>
                  <Link to="/login" className="cta-button cta-secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <p className="hero-subtext">
              No credit card required. Start creating in seconds.
            </p>
          </div>
        </div>

        {/* Right Column - About Bodhira Card */}
        <div className="hero-right">
          <div className="about-bodhira-card" onClick={scrollToAbout} style={{ cursor: 'pointer' }}>
            <div className="card-header">
              <div className="card-icon">🎯</div>
              <div className="card-badge">New Platform</div>
            </div>
            <h3 className="card-title">About Bodhira</h3>
            <p className="card-description">
              An AI-native assessment platform that helps teachers create high-quality tests in seconds, manage classrooms effortlessly, and track student performance with deep analytics.
            </p>
            <div className="card-footer" onClick={scrollToAbout}>
              <span className="footer-text">Click to explore</span>
              <span className="footer-arrow">→</span>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="hero-bg-elements">
          <div className="bg-element element-1"></div>
          <div className="bg-element element-2"></div>
          <div className="bg-element element-3"></div>
        </div>
      </section>

      {/* Feature Highlights - Horizontal Pills */}
      <section className="features-highlights-section">
        <div className="features-container">
          <div className="feature-pill">
            <span className="pill-icon">🤖</span>
            <span className="pill-text">AI-Powered Generation</span>
          </div>
          <div className="feature-pill">
            <span className="pill-icon">⚡</span>
            <span className="pill-text">Instant Results</span>
          </div>
          <div className="feature-pill">
            <span className="pill-icon">📊</span>
            <span className="pill-text">Deep Analytics</span>
          </div>
          <div className="feature-pill">
            <span className="pill-icon">🏆</span>
            <span className="pill-text">Leaderboards</span>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why Bodhira?</h2>
          <p className="section-subtitle">Everything you need for world-class assessments</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Intelligent Generation</h3>
            <p>Advanced AI creates contextually relevant, high-quality questions in seconds on any topic or subject.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Actionable Analytics</h3>
            <p>Comprehensive insights into student performance with visual trends, strengths, and improvement areas.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Classroom Ready</h3>
            <p>Built for teachers. Manage classes, track progress, and automate grading all in one place.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Engaging Competition</h3>
            <p>Global leaderboards, achievements, and challenges keep students motivated and learning.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Get tests in seconds. Instant grading. Immediate feedback. No delays in the learning process.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Adaptive Learning</h3>
            <p>Personalized learning paths that adapt to each student's pace and proficiency level.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Active Students</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Tests Generated</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Teachers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">Satisfaction</div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="cta-content">
          <h2>Ready to transform your classroom?</h2>
          <p>Join educators worldwide using Bodhira for smarter, faster assessments.</p>
          
          <div className="final-cta-buttons">
            {!user ? (
              <>
                <Link to="/register" className="cta-button cta-primary">
                  <span>Start Free Now</span>
                  <span className="cta-arrow">→</span>
                </Link>
                <Link to="/login" className="cta-button cta-secondary">
                  Already have an account?
                </Link>
              </>
            ) : (
              <>
                <Link to="/generate" className="cta-button cta-primary">
                  <span>Create Your First Test</span>
                  <span className="cta-arrow">→</span>
                </Link>
                <Link to="/dashboard" className="cta-button cta-secondary">
                  Go to Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* About Bodhira Section */}
      <section className="about-section" ref={aboutSectionRef}>
        <div className="about-container">
          <div className="about-header">
            <h2>Teaching isn't just about teaching anymore.</h2>
            <p className="about-intro">
              Teachers lose countless hours every week creating question papers, designing tests, checking difficulty levels, managing classrooms, and tracking student progress. What should take minutes often takes entire evenings. This time never comes back — and it becomes harder to stay focused on what truly matters: helping students learn, grow, and improve.
            </p>
            <p className="about-intro-bold">Bodhira fixes this.</p>
          </div>

          <div className="about-description">
            <p>
              Bodhira is an AI-powered assessment and classroom platform designed to eliminate the stressful, time-consuming parts of teaching.
              It helps educators create high-quality tests in seconds, run instant assessments, manage entire classrooms, and get deep performance insights — all in one place.
            </p>
          </div>

          <div className="about-section-divider">
            <h3>Why teachers love Bodhira</h3>
          </div>

          <div className="about-grid">
            <div className="about-card">
              <h4>🤖 AI-Powered Test Generation</h4>
              <p>Create complete tests instantly - MCQs, subjective questions, chapter-wise tests, difficulty-based questions, and more. No typing, no searching, no manual work.</p>
            </div>

            <div className="about-card">
              <h4>⚡ Instant Test-Taking System</h4>
              <p>Students can take tests immediately, anytime. You don't need PDFs, printing, or distribution.</p>
            </div>

            <div className="about-card">
              <h4>👥 Classroom & Student Management</h4>
              <p>Add students, manage multiple classrooms, assign tests, monitor progress, everything becomes simple and organized.</p>
            </div>

            <div className="about-card">
              <h4>📊 Premium Performance Analytics</h4>
              <p>See exactly where students struggle, chapter-wise strengths and weaknesses, and the overall learning curve of your class.</p>
            </div>

            <div className="about-card">
              <h4>⏱️ Save Hours Every Week</h4>
              <p>What once took 3–4 hours now takes 30 seconds. Teachers finally get time back for real teaching, doubt sessions, and improving student understanding.</p>
            </div>
          </div>

          <div className="about-section-divider">
            <h3>Built for Modern Education</h3>
          </div>

          <div className="about-final-message">
            <p>
              Bodhira isn't just a test generator, it's a complete teaching assistant.
              It automates the repetitive work, gives you clarity through analytics, and makes assessments extremely fast, accurate, and effortless.
            </p>
            <p className="about-tagline">
              <strong>Teach better. Save time. Improve student performance.</strong><br/>
              This is the future of assessments - powered by Bodhira.
            </p>
          </div>

          <div className="about-cta">
            {!user ? (
              <>
                <Link to="/register" className="cta-button cta-primary">
                  <span>Start Creating Tests</span>
                  <span className="cta-arrow">→</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/generate" className="cta-button cta-primary">
                  <span>Create Your First Test</span>
                  <span className="cta-arrow">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;