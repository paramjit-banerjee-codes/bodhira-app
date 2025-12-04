import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testAPI } from '../services/api';
import './Dashboard.css';

// Confetti animation component
const Confetti = ({ duration = 3000 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const createConfetti = () => {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 1,
        color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)]
      }));
      setParticles(newParticles);
    };

    createConfetti();
    const timer = setTimeout(() => setParticles([]), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-10px',
            width: '8px',
            height: '8px',
            background: p.color,
            borderRadius: '50%',
            animation: `fall ${p.duration}s linear ${p.delay}s forwards`,
            opacity: 0.8
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default function PublishedTestDashboard() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log('🔄 PublishedTestDashboard mounted with testId:', testId);
    
    if (!testId) {
      console.error('❌ No testId in URL params');
      setError('Test ID not found in URL');
      setLoading(false);
      return;
    }
    
    fetchTest();
  }, [testId, retryCount]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching test preview for testId:', testId);
      const response = await testAPI.getTestPreview(testId);
      console.log('📦 Raw API response:', response);
      
      const testData = response.data?.data || response.data;
      console.log('🔍 Extracted test data:', testData);
      
      if (!testData) {
        console.warn('⚠️ No test data returned from API');
        throw new Error('No test data received from server');
      }
      
      console.log('✅ Test data loaded successfully:', testData);
      setTest(testData);
      setLoading(false);
    } catch (err) {
      console.error('❌ Full error object:', err);
      console.error('❌ Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load test details';
      console.error('Error message set to:', errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(c => c + 1);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      // Show temporary success message
      const msg = document.createElement('div');
      msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
      `;
      msg.textContent = '✅ Test code copied!';
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 2000);
    }).catch(() => {
      alert('Failed to copy. Try again!');
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        flexDirection: 'column'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(16, 185, 129, 0.2)',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#94a3b8', fontSize: '16px', margin: '0 0 10px 0' }}>📡 Loading your published test...</p>
          <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>testId: {testId}</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: '#1e293b',
          border: '2px solid #ef4444',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: '#ef4444', marginTop: 0 }}>Unable to Load Test</h2>
          <p style={{ color: '#cbd5e1', marginBottom: '30px' }}>
            {error || 'The test details could not be loaded. This may be a temporary issue.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleRetry}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#059669'}
              onMouseOut={(e) => e.target.style.background = '#10b981'}
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: '#475569',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#334155'}
              onMouseOut={(e) => e.target.style.background = '#475569'}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Define displayTest for fallback when loading
  const displayTest = test || { 
    testCode: 'Loading...', 
    title: 'Your Test', 
    topic: 'Loading...', 
    difficulty: 'medium',
    duration: 0,
    totalQuestions: 0,
    questions: []
  };

  return (
    <>
      <Confetti />
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '20px' }}>
          {/* Show error alert if there's an error */}
          {error && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#fca5a5'
            }}>
              <strong>⚠️ Warning:</strong> {error}
            </div>
          )}
          
          {/* Animated Success Header */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '40px 30px',
              borderRadius: '12px',
              marginBottom: '30px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)',
              animation: 'slideDown 0.6s ease'
            }}
          >
            <div style={{
              fontSize: '64px',
              marginBottom: '15px',
              animation: 'bounce 1s ease infinite',
              animationDelay: '0.2s'
            }}>
              ✅
            </div>
            <h1 style={{ fontSize: '32px', margin: '10px 0', fontWeight: 'bold' }}>
              Test Published Successfully!
            </h1>
            <p style={{ fontSize: '16px', opacity: 0.95, margin: 0 }}>
              Your test is now live and ready for students
            </p>
          </div>

          {/* Main Info Card */}
          <div style={{
            background: '#1e293b',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
              <div>
                <h2 style={{ fontSize: '28px', margin: '0 0 8px 0', color: 'white' }}>
                  {displayTest?.title || 'Test'}
                </h2>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
                  {displayTest?.topic || 'Unknown Topic'}
                </p>
              </div>
              <div style={{ fontSize: '56px' }}>🎉</div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '15px',
              padding: '20px',
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '8px',
              marginBottom: '30px'
            }}>
              {/* Test Code - Most Important */}
              <div style={{
                textAlign: 'center',
                padding: '20px',
                background: 'rgba(59, 130, 246, 0.15)',
                borderRadius: '8px',
                border: '2px solid #3b82f6',
                gridColumn: 'span 1'
              }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  🔗 Test Code
                </p>
                <p style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  color: '#3b82f6',
                  margin: 0,
                  letterSpacing: '2px'
                }}>
                  {displayTest?.testCode || 'N/A'}
                </p>
              </div>

              {/* Questions */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  📝 Questions
                </p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
                  {displayTest?.totalQuestions || displayTest?.questions?.length || 0}
                </p>
              </div>

              {/* Difficulty */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  ⚡ Difficulty
                </p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
                  {displayTest?.difficulty === 'easy' ? '🟢 Easy' : displayTest?.difficulty === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                </p>
              </div>

              {/* Duration */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: '600' }}>
                  ⏱️ Duration
                </p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
                  {displayTest?.duration ? `${displayTest.duration}m` : '∞'}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '30px'
            }}>
              <p style={{ color: '#6ee7b7', margin: 0, fontSize: '14px', fontWeight: '600' }}>
                ✨ <strong>Share the test code</strong> with your students. They can access it via the "Take Test" page!
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px'
            }}>
              <button
                onClick={() => copyToClipboard(displayTest?.testCode)}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#2563eb';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📋 Copy Test Code
              </button>

              <button
                onClick={() => navigate(`/leaderboard?code=${displayTest?.testCode}`)}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#d97706';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f59e0b';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🏆 View Leaderboard
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: '#475569',
                  color: 'white',
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#334155';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#475569';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ← Back to Classroom
              </button>

              <button
                onClick={() => navigate('/generate')}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '14px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#059669';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#10b981';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ✨ Create Another
              </button>
            </div>
          </div>

          {/* Instructions Card */}
          <div style={{
            background: '#1e293b',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#e2e8f0', fontSize: '18px' }}>
              📋 How to Share with Students
            </h3>
            <ol style={{ color: '#cbd5e1', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '10px' }}>
                Copy the test code: <code style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#3b82f6',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold'
                }}>{displayTest?.testCode}</code>
              </li>
              <li style={{ marginBottom: '10px' }}>Share it via email, message, or announcement board</li>
              <li style={{ marginBottom: '10px' }}>Students go to "Take Test" → Enter the code</li>
              <li style={{ marginBottom: '10px' }}>They'll have {displayTest?.duration ? `${displayTest.duration} minutes` : 'unlimited time'} to complete the test</li>
              <li>Results appear automatically on the leaderboard</li>
            </ol>
          </div>

          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes slideIn {
              from { transform: translateX(100px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      </div>
    </>
  );
}
