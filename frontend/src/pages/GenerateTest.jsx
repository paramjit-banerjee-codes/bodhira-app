import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { testAPI, classroomAPI, profileAPI } from '../services/api';
import GenerationStatusModal from '../components/GenerationStatusModal';
import './GenerateTest.css';

const GenerateTest = ({ classroomId: propClassroomId } = {}) => {
  const navigate = useNavigate();
  const params = useParams();
  // classroomId comes as prop when used in classroom context, otherwise from URL params
  const classroomId = propClassroomId || params.classroomId;
  const [formData, setFormData] = useState({
    topic: '',
    numberOfQuestions: 10,
    difficulty: 'medium',
    provided_content: '',
  });
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generationRequestId, setGenerationRequestId] = useState(null);
  const [error, setError] = useState('');
  const [generatedTest, setGeneratedTest] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [linkingClassroom, setLinkingClassroom] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState(null);
  const [checkingLimits, setCheckingLimits] = useState(false);
  const [quotaData, setQuotaData] = useState(null);

  // Check subscription status and quota on mount
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        setCheckingLimits(true);
        // Fetch quota data from new endpoint
        const quotaResponse = await testAPI.getQuotaStatus();
        const quota = quotaResponse.data?.data;
        setQuotaData(quota);
        
        // Also fetch profile for subscription details
        const response = await profileAPI.getProfile();
        const profile = response.data?.data || {};
        setUserSubscriptionStatus({
          ...profile.subscription,
          isPaid: quota?.isPaid || false,
          remaining: quota?.remaining || 5
        });
      } catch (err) {
        console.error('Error checking subscription/quota status:', err);
        // Set default quota data on error
        setQuotaData({
          canGenerate: true,
          remaining: 5,
          limit: 5,
          isPaid: false,
          message: 'Unable to fetch quota info'
        });
      } finally {
        setCheckingLimits(false);
      }
    };
    checkSubscriptionStatus();
  }, []);

  // Fetch teacher's classrooms when generated test is ready
  useEffect(() => {
    if (generatedTest && !showClassroomModal) {
      loadClassrooms();
      setShowClassroomModal(true);
    }
  }, [generatedTest]);

  const loadClassrooms = async () => {
    try {
      const response = await classroomAPI.getClassrooms();
      const classroomsList = response.data?.data || [];
      setClassrooms(classroomsList);
      if (classroomsList.length > 0) {
        setSelectedClassroom(classroomsList[0]._id);
      }
    } catch (err) {
      console.error('Error loading classrooms:', err);
      setClassrooms([]);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCopyCode = () => {
    const code = generatedTest?.testCode || generatedTest?.testId;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleGenerationSuccess = async (testData) => {
    console.log('Generation completed successfully:', testData);
    setShowGenerationModal(false);
    setGeneratedTest(testData);
    
    // Refresh quota data after successful generation
    try {
      const quotaResponse = await testAPI.getQuotaStatus();
      const quota = quotaResponse.data?.data;
      setQuotaData(quota);
      console.log('✅ Quota refreshed after generation:', quota);
    } catch (err) {
      console.error('Error refreshing quota:', err);
    }
  };

  const handleLinkToClassroom = async () => {
    if (!selectedClassroom || !generatedTest) return;

    setLinkingClassroom(true);
    try {
      await testAPI.linkTestToClassroom(generatedTest.testId, selectedClassroom);
      console.log('✅ Test linked to classroom:', selectedClassroom);
      setShowClassroomModal(false);
    } catch (err) {
      console.error('Error linking test to classroom:', err);
      alert('Failed to link test to classroom. You can still publish it without linking.');
    } finally {
      setLinkingClassroom(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedTest) return;
    
    setPublishing(true);
    try {
      const publishData = {};
      if (selectedClassroom) {
        publishData.classroomId = selectedClassroom;
      }
      
      await testAPI.publishTest(generatedTest.testId, publishData);
      console.log('✅ Test published successfully');
      
      // Navigate to published test dashboard immediately
      setTimeout(() => {
        navigate(`/test/${generatedTest.testId}/published`);
      }, 500);
    } catch (err) {
      console.error('Error publishing test:', err);
      alert('Failed to publish test. Please try again.');
      setPublishing(false);
    }
  };

  const handleSkipClassroom = () => {
    setShowClassroomModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGeneratedTest(null);
    setCopySuccess(false);

    try {
      console.log('Generating test with:', formData);
      setShowGenerationModal(true);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to start test generation. Please try again.');
    }
  };

  const handleViewTest = () => {
    if (generatedTest?.testId) {
      setShowPreview(true);
    }
  };

  const handleCreateAnother = () => {
    setGeneratedTest(null);
    setPublishSuccess(false);
    setFormData({
      topic: '',
      numberOfQuestions: 10,
      difficulty: 'medium',
      provided_content: '',
    });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (publishSuccess) {
    return (
      <div className="container generate-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`
          @keyframes confetti {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(600px) rotate(360deg); opacity: 0; }
          }
          @keyframes bounce {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.1) translateY(-20px); }
          }
          @keyframes pulse-glow {
            0%, 100% { boxShadow: 0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.3); }
            50% { boxShadow: 0 0 40px rgba(34, 197, 94, 0.8), 0 0 80px rgba(34, 197, 94, 0.5); }
          }
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .confetti { position: fixed; pointer-events: none; }
          .emoji-confetti {
            font-size: 24px;
            animation: confetti 3s ease-out forwards;
          }
        `}</style>

        {/* Animated Confetti */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="confetti emoji-confetti"
            style={{
              left: Math.random() * 100 + '%',
              top: '-20px',
              animationDelay: `${Math.random() * 0.5}s`,
              zIndex: 10,
            }}
          >
            {['🎉', '✨', '🎊', '⭐', '🚀', '🏆'][Math.floor(Math.random() * 6)]}
          </div>
        ))}

        {/* Success Card */}
        <div style={{
          position: 'relative',
          zIndex: 20,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px 40px',
          border: '2px solid rgba(34, 197, 94, 0.5)',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(34, 197, 94, 0.3)',
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}>
          {/* Checkmark Circle */}
          <div style={{
            fontSize: '80px',
            marginBottom: '24px',
            animation: 'bounce 1s ease-in-out infinite',
            filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.6))',
          }}>
            ✅
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '32px',
            fontWeight: '900',
            color: '#22c55e',
            marginBottom: '12px',
            margin: '0 0 12px 0',
            animation: 'slide-up 0.6s ease-out 0.1s both',
          }}>
            Test Published!
          </h2>

          {/* Subtitle */}
          <p style={{
            fontSize: '18px',
            color: '#cbd5e1',
            marginBottom: '32px',
            margin: '0 0 24px 0',
            animation: 'slide-up 0.6s ease-out 0.2s both',
          }}>
            Your test is live and students can now take it.
          </p>

          {/* Test Details Card */}
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '32px',
            animation: 'slide-up 0.6s ease-out 0.3s both',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              textAlign: 'left',
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px' }}>TOPIC</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>{generatedTest?.topic}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px' }}>QUESTIONS</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>{generatedTest?.totalQuestions}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px' }}>DIFFICULTY</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9', textTransform: 'capitalize' }}>{generatedTest?.difficulty}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px' }}>DURATION</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#f1f5f9' }}>{generatedTest?.duration} min</div>
              </div>
            </div>
          </div>

          {/* Test Code */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px dashed rgba(59, 130, 246, 0.5)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '32px',
            animation: 'slide-up 0.6s ease-out 0.4s both',
          }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', marginBottom: '8px' }}>SHARE THIS CODE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <code style={{
                fontSize: '20px',
                fontWeight: '900',
                color: '#60a5fa',
                letterSpacing: '2px',
                flex: 1,
              }}>
                {generatedTest?.testCode || generatedTest?.testId}
              </code>
              <button
                onClick={handleCopyCode}
                style={{
                  padding: '8px 16px',
                  background: '#60a5fa',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#3b82f6';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#60a5fa';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {copySuccess ? '✓' : '📋'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'slide-up 0.6s ease-out 0.5s both',
          }}>
            <button
              onClick={handleCreateAnother}
              style={{
                padding: '14px 24px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(34, 197, 94, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(34, 197, 94, 0.3)';
              }}
            >
              ✨ Create Another Test
            </button>
            <button
              onClick={handleGoHome}
              style={{
                padding: '14px 24px',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '2px solid rgba(59, 130, 246, 0.5)',
                borderRadius: '12px',
                color: '#60a5fa',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              }}
            >
              🏠 Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container generate-container">
      <div className="generate-header">
        <h1>🎯 Generate New Test</h1>
        <p>Create AI-powered MCQ tests instantly</p>
      </div>

      <div className="generate-content">
        {/* Test Generation Quota Display - More Prominent */}
        {(userSubscriptionStatus || quotaData) && (
          <div style={{
            background: (quotaData?.isPaid || userSubscriptionStatus?.isPaid)
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)',
            border: (quotaData?.isPaid || userSubscriptionStatus?.isPaid)
              ? '1px solid rgba(16, 185, 129, 0.4)'
              : '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: (quotaData?.isPaid || userSubscriptionStatus?.isPaid)
              ? '0 4px 12px rgba(16, 185, 129, 0.1)'
              : '0 4px 12px rgba(59, 130, 246, 0.15)'
          }}>
            <div>
              <p style={{ margin: 0, color: '#f1f5f9', fontWeight: '700', marginBottom: '6px', fontSize: '15px' }}>
                {quotaData?.isPaid || userSubscriptionStatus?.isPaid ? '⭐ Premium Member' : '📊 Test Generation Quota'}
              </p>
              {!(quotaData?.isPaid || userSubscriptionStatus?.isPaid) ? (
                <div>
                  <p style={{ margin: '4px 0 0 0', color: '#e2e8f0', fontSize: '14px' }}>
                    Tests used: <span style={{ fontWeight: '700', color: '#60a5fa' }}>
                      {quotaData ? (quotaData.limit - quotaData.remaining) : 0}/{quotaData?.limit || 5}
                    </span> 
                    {' '} • Remaining: <span style={{ fontWeight: '700', color: (quotaData?.remaining || 5) > 0 ? '#10b981' : '#ef4444' }}>
                      {quotaData?.remaining !== undefined ? quotaData.remaining : 5}
                    </span>
                  </p>
                  <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>
                    Upgrade to Premium for unlimited test generation
                  </p>
                </div>
              ) : (
                <p style={{ margin: '4px 0 0 0', color: '#10b981', fontSize: '14px', fontWeight: '600' }}>
                  ✓ Unlimited test generation
                </p>
              )}
            </div>
            {!(quotaData?.isPaid || userSubscriptionStatus?.isPaid) && (
              <button
                onClick={() => navigate('/profile?tab=subscription')}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  marginLeft: '20px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                Upgrade Now
              </button>
            )}
          </div>
        )}

        {/* Progress Bar for Free Users */}
        {(quotaData || userSubscriptionStatus) && !(quotaData?.isPaid || userSubscriptionStatus?.isPaid) && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '600' }}>Test Generation Progress</label>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                {quotaData ? quotaData.limit - quotaData.remaining : 5} / {quotaData?.limit || 5} used
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(51, 65, 85, 0.8)',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{
                height: '100%',
                width: `${quotaData ? ((quotaData.limit - quotaData.remaining) / quotaData.limit) * 100 : 0}%`,
                background: (quotaData?.remaining || 5) > 0
                  ? 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
                  : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                transition: 'width 0.3s ease',
                borderRadius: '10px'
              }} />
            </div>
          </div>
        )}

        {/* Test Generation Limit Banner */}
        {(quotaData || userSubscriptionStatus) && !(quotaData?.isPaid || userSubscriptionStatus?.isPaid) && (quotaData?.remaining || 5) <= 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ fontSize: '24px' }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#e2e8f0', fontWeight: '600', marginBottom: '4px' }}>
                Test Generation Limit Reached
              </p>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px' }}>
                You've reached your free limit of {quotaData?.limit || 5} tests. Upgrade to Premium for unlimited generation.
              </p>
            </div>
            <button
              onClick={() => navigate('/profile?tab=subscription')}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
                whiteSpace: 'nowrap'
              }}
            >
              Upgrade
            </button>
          </div>
        )}

        <div className="generate-form-card card">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Test Topic *</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Paste your topic or concept here"
                required
                disabled={showGenerationModal || generatedTest}
              />
              <small>Enter any topic you want to create a test about</small>
            </div>

            <div className="input-group paste-content-group">
              <div className="label-wrapper">
                <label>📝 Paste Content <span className="label-badge">(Optional)</span></label>
                <span className="char-count" style={{
                  color: formData.provided_content.length === 0 ? '#94a3b8' :
                         formData.provided_content.length < 150 ? '#f59e0b' :
                         formData.provided_content.length > 10000 ? '#ef4444' : '#10b981'
                }}>
                  {formData.provided_content.length > 0 && `${formData.provided_content.length}/10,000`}
                </span>
              </div>
              <textarea
                name="provided_content"
                value={formData.provided_content}
                onChange={handleChange}
                placeholder="Paste your study material, textbook excerpt, or notes here. Ai will generate questions based on this content."
                rows="6"
                disabled={showGenerationModal || generatedTest}
                className="premium-textarea"
              />
              <div className="char-indicator">
                <div className="indicator-bar">
                  <div 
                    className="indicator-fill"
                    style={{
                      width: formData.provided_content.length === 0 ? '0%' : 
                             Math.min((formData.provided_content.length / 10000) * 100, 100) + '%',
                      backgroundColor: formData.provided_content.length < 150 ? '#f59e0b' :
                                     formData.provided_content.length > 10000 ? '#ef4444' : '#10b981'
                    }}
                  ></div>
                </div>
                <small className="char-hint">
                  {formData.provided_content.length === 0 
                    ? '✨ Optional: Paste content to generate questions from it. Minimum 150 characters.'
                    : formData.provided_content.length < 150
                    ? `⚠️ ${formData.provided_content.length}/150 characters (minimum 150 required)`
                    : formData.provided_content.length > 10000
                    ? `❌ Content exceeds limit (max 10,000 characters)`
                    : `✅ Perfect! Ready to generate questions from your content`
                  }
                </small>
              </div>
            </div>

            <div className="input-group">
              <label>Number of Questions</label>
              <select
                name="numberOfQuestions"
                value={formData.numberOfQuestions}
                onChange={handleChange}
                disabled={showGenerationModal || generatedTest}
              >
                <option value="5">5 Questions (Quick test)</option>
                <option value="10">10 Questions (Standard)</option>
                <option value="15">15 Questions (Comprehensive)</option>
                <option value="20">20 Questions (Extended)</option>
                <option value="30">30 Questions (Full Assessment)</option>
              </select>
            </div>

            <div className="input-group">
              <label>Difficulty Level</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                disabled={showGenerationModal || generatedTest}
              >
                <option value="easy">Easy - Beginner friendly</option>
                <option value="medium">Medium - Intermediate level</option>
                <option value="hard">Hard - Advanced concepts</option>
              </select>
            </div>

            {error && (
              <div className="error-message">
                <strong>⚠️ Error:</strong> {error}
              </div>
            )}

            {generatedTest && (
              <div className="success-message">
                <strong>✅ Test Created Successfully!</strong>
                <div className="test-code-display">
                  <div className="test-code-label">Test Code:</div>
                  <div className="test-code-value">
                    <code>{generatedTest.testCode || generatedTest.testId}</code>
                    <button 
                      type="button"
                      onClick={handleCopyCode}
                      className="btn-copy"
                      title="Copy test code"
                    >
                      {copySuccess ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>
                <div className="test-details">
                  <p><strong>Topic:</strong> {generatedTest.topic}</p>
                  <p><strong>Questions:</strong> {generatedTest.totalQuestions}</p>
                  <p><strong>Duration:</strong> {generatedTest.duration} minutes</p>
                  <p><strong>Difficulty:</strong> {generatedTest.difficulty}</p>
                </div>
                <p className="share-instruction">
                  📤 Share this code with your students to let them take the test.
                </p>
                <div className="action-buttons">
                  <button 
                    type="button"
                    onClick={handleViewTest}
                    className="btn btn-secondary"
                  >
                    👁️ Preview Test
                  </button>
                  <button 
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing}
                    className="btn btn-primary"
                  >
                    {publishing ? '⏳ Publishing...' : '🚀 Publish Test'}
                  </button>
                  <button 
                    type="button"
                    onClick={handleCreateAnother}
                    className="btn btn-secondary"
                  >
                    ➕ Create Another
                  </button>
                </div>
              </div>
            )}

            {!generatedTest && (
              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={showGenerationModal}
              >
                {showGenerationModal ? (
                  <>
                    <span className="loading-spinner"></span>
                    Generating Test...
                  </>
                ) : (
                  '✨ Generate Test'
                )}
              </button>
            )}
          </form>
        </div>

        <div className="info-card card">
          <h3>📚 How it works</h3>
          <ol className="info-list">
            <li>
              <strong>Enter a topic</strong> you want to create a test about
            </li>
            <li>
              <strong>Choose number</strong> of questions and difficulty
            </li>
            <li>
              <strong>AI generates</strong> high-quality MCQ questions instantly
            </li>
            <li>
              <strong>Link to classroom</strong> to assign tests to students (optional)
            </li>
            <li>
              <strong>Publish & share</strong> the test code with students
            </li>
            <li>
              <strong>Track results</strong> on the leaderboard
            </li>
          </ol>

          <div className="tips">
            <h4>💡 Pro Tips</h4>
            <ul>
              <li>Be specific with topics for better questions</li>
              <li>Start with medium difficulty</li>
              <li>Link tests to classrooms for better student tracking</li>
              <li>Save the test code for future reference</li>
            </ul>
          </div>
        </div>
      </div>

      {showGenerationModal && (
        <GenerationStatusModal
          topic={formData.topic}
          difficulty={formData.difficulty}
          numberOfQuestions={formData.numberOfQuestions}
          provided_content={formData.provided_content}
          isOpen={showGenerationModal}
          onClose={() => setShowGenerationModal(false)}
          onSuccess={handleGenerationSuccess}
        />
      )}

      {/* Classroom Linking Modal */}
      {showClassroomModal && generatedTest && (
        <div className="modal-overlay" style={{ zIndex: 1000, background: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="modal-content" style={{ 
            maxWidth: '480px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden'
          }}>
            <div className="modal-header" style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              padding: '20px 24px',
              borderBottom: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>📚</span>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '700' }}>
                  {classrooms.length > 0 ? 'Assign to Classroom' : 'Create a Classroom'}
                </h2>
              </div>
              <button 
                onClick={handleSkipClassroom}
                className="modal-close-btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'all 0.2s ease'
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body" style={{ padding: '28px 24px' }}>
              {classrooms.length > 0 ? (
                <>
                  <p style={{ 
                    color: '#cbd5e1', 
                    marginBottom: '20px',
                    fontSize: '15px',
                    lineHeight: '1.6'
                  }}>
                    ✨ Your test "{generatedTest?.title}" is ready! Assign it to a classroom to track student progress.
                  </p>
                  
                  <div className="input-group" style={{ marginBottom: '24px' }}>
                    <label style={{ 
                      color: '#e2e8f0', 
                      marginBottom: '10px',
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}>
                      Select Classroom
                    </label>
                    <select
                      value={selectedClassroom}
                      onChange={(e) => setSelectedClassroom(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: '#1e293b',
                        border: '2px solid #475569',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: '500'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#475569'}
                    >
                      <option value="">-- Choose a classroom --</option>
                      {classrooms.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleLinkToClassroom}
                      disabled={linkingClassroom || !selectedClassroom}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        background: linkingClassroom || !selectedClassroom ? '#64748b' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: linkingClassroom || !selectedClassroom ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '700',
                        transition: 'all 0.3s ease',
                        letterSpacing: '0.5px',
                        boxShadow: linkingClassroom || !selectedClassroom ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)',
                        opacity: linkingClassroom || !selectedClassroom ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!linkingClassroom && selectedClassroom) {
                          e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                          e.target.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!linkingClassroom && selectedClassroom) {
                          e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {linkingClassroom ? '⏳ Linking...' : '🔗 Link to Classroom'}
                    </button>
                    <button
                      onClick={handleSkipClassroom}
                      disabled={linkingClassroom}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        background: '#334155',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        opacity: linkingClassroom ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!linkingClassroom) {
                          e.target.style.background = '#475569';
                          e.target.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!linkingClassroom) {
                          e.target.style.background = '#334155';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      ⏭️ Skip for Now
                    </button>
                  </div>

                  <div style={{
                    marginTop: '20px',
                    padding: '12px 14px',
                    background: 'rgba(148, 163, 184, 0.1)',
                    borderLeft: '3px solid #3b82f6',
                    borderRadius: '6px'
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#94a3b8',
                      lineHeight: '1.5'
                    }}>
                      💡 Tip: Linking tests to classrooms helps you track student performance automatically!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    textAlign: 'center',
                    paddingTop: '12px'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                    <p style={{ 
                      color: '#e2e8f0', 
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      No Classrooms Yet
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                      Create a classroom first to link tests and track student progress effortlessly.
                    </p>
                  </div>
                  <button
                    onClick={handleSkipClassroom}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '700',
                      transition: 'all 0.3s ease',
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    ✓ Got It
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && generatedTest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            maxHeight: '90vh',
            overflowY: 'auto',
            maxWidth: '800px',
            width: '100%',
            padding: '30px',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>Test Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ✕
              </button>
            </div>

            {/* Test Info */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <p style={{ color: '#e2e8f0', margin: '8px 0' }}>
                <strong>Topic:</strong> {generatedTest?.topic}
              </p>
              <p style={{ color: '#e2e8f0', margin: '8px 0' }}>
                <strong>Difficulty:</strong> {generatedTest?.difficulty}
              </p>
              <p style={{ color: '#e2e8f0', margin: '8px 0' }}>
                <strong>Questions:</strong> {generatedTest?.totalQuestions}
              </p>
              <p style={{ color: '#e2e8f0', margin: '8px 0' }}>
                <strong>Duration:</strong> {generatedTest?.duration} minutes
              </p>
            </div>

            {/* Questions */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#e2e8f0', marginTop: 0 }}>Questions</h3>
              {generatedTest?.questions?.map((question, index) => (
                <div key={index} style={{
                  background: '#0f172a',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px'
                }}>
                  <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
                    Question {index + 1}
                  </p>
                  <p style={{ color: '#e2e8f0', margin: '0 0 12px 0', fontWeight: '600' }}>
                    {question.question}
                  </p>
                  <div style={{ marginLeft: '12px' }}>
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} style={{
                        color: String(optIndex) === String(question.correctAnswer) ? '#10b981' : '#cbd5e1',
                        padding: '6px 0',
                        fontSize: '14px'
                      }}>
                        {String(optIndex) === String(question.correctAnswer) ? '✓ ' : '○ '}
                        {option}
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <p style={{ color: '#64748b', fontSize: '12px', margin: '10px 0 0 0', fontStyle: 'italic' }}>
                      Explanation: {question.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: '10px 20px',
                  background: '#475569',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateTest;