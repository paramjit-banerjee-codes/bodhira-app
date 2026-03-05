import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, AlertCircle, Sparkles, Target, Clock, CheckCircle2, 
  Brain, BookOpen, FileText, Shield, Zap 
} from 'lucide-react';
import { testAPI } from '../services/api';
import toast from '../utils/toast';
import './GenerationStatusModal.css';

export default function GenerationStatusModal({
  topic,
  difficulty,
  numberOfQuestions,
  provided_content,
  isOpen,
  onClose,
  onSuccess,
}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('generating');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isBackendComplete, setIsBackendComplete] = useState(false);
  const [backendResult, setBackendResult] = useState(null);
  
  const hasGeneratedRef = useRef(false);
  const isMountedRef = useRef(true);
  const modalStartTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  const MIN_DURATION = 4000; // 4 seconds minimum
  const FINAL_ANIMATION_DURATION = 500; // 0.5s for 95% -> 100%

  // Easing functions
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInCubic = (t) => t * t * t;
  const linear = (t) => t;

  // Get current status message and icon based on displayProgress
  const getStepInfo = () => {
    if (displayProgress < 20) return { text: 'Understanding context...', icon: Brain };
    if (displayProgress < 45) return { text: 'Analyzing topic depth...', icon: BookOpen };
    if (displayProgress < 70) return { text: 'Generating questions...', icon: FileText };
    if (displayProgress < 90) return { text: 'Validating quality...', icon: Shield };
    if (displayProgress < 95) return { text: 'Almost ready...', icon: Sparkles };
    return { text: 'Finalizing test...', icon: CheckCircle2 };
  };

  const currentStep = getStepInfo();
  const StepIcon = currentStep.icon;

  // Intelligent Progress Animation Controller
  useEffect(() => {
    if (status !== 'generating' || !isOpen) return;

    modalStartTimeRef.current = Date.now();
    setDisplayProgress(0);
    
    const animateProgress = () => {
      if (!isMountedRef.current || status !== 'generating') return;

      const now = Date.now();
      const elapsed = now - modalStartTimeRef.current;
      const elapsedSeconds = elapsed / 1000;

      let targetProgress = 0;

      // Stage 1: 0-60% in first 1.5 seconds (ease-out, quick start)
      if (elapsedSeconds < 1.5) {
        const t = elapsedSeconds / 1.5;
        targetProgress = easeOutCubic(t) * 60;
      }
      // Stage 2: 60-85% in next 1.5 seconds (linear, steady work)
      else if (elapsedSeconds < 3.0) {
        const t = (elapsedSeconds - 1.5) / 1.5;
        targetProgress = 60 + linear(t) * 25;
      }
      // Stage 3: 85-95% in next 1 second (ease-out, approaching completion)
      else if (elapsedSeconds < 4.0) {
        const t = (elapsedSeconds - 3.0) / 1.0;
        targetProgress = 85 + easeOutCubic(t) * 10;
      }
      // Stage 4: Hold at ~95% if minimum time not passed OR backend not complete
      else if (!isBackendComplete || elapsed < MIN_DURATION) {
        // Crawl very slowly 95% -> 96% -> 97%
        const crawlTime = elapsedSeconds - 4.0;
        targetProgress = 95 + Math.min(crawlTime * 0.1, 2); // Very slow crawl
      }
      // Stage 5: Final rush 95% -> 100% when BOTH conditions met
      else {
        // Calculate how long we've been in final stage
        const timeSinceReady = elapsedSeconds - 4.0;
        const t = Math.min(timeSinceReady / 0.5, 1); // 0.5 second animation
        targetProgress = 95 + easeInCubic(t) * 5;
      }

      // Smooth interpolation - don't jump instantly
      setDisplayProgress(prev => {
        const diff = targetProgress - prev;
        // Smooth lerp with 15% interpolation
        const newProgress = prev + diff * 0.15;
        return Math.min(Math.max(newProgress, 0), 100);
      });

      // Check if we've reached 100%
      if (targetProgress >= 100) {
        setDisplayProgress(100);
        // Hold at 100% for 300ms, then show success
        setTimeout(() => {
          if (isMountedRef.current) {
            setStatus('success');
            setResult(backendResult);
            
            // Call success callback and auto-close
            if (backendResult) {
              toast.success('✨ Test generated successfully!', 2000);
              onSuccess(backendResult);
              
              setTimeout(() => {
                if (isMountedRef.current) {
                  onClose();
                }
              }, 1500);
            }
          }
        }, 300);
        return; // Stop animation
      }

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(animateProgress);
    };

    animationFrameRef.current = requestAnimationFrame(animateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status, isOpen, isBackendComplete, backendResult]);

  // Reset refs when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      hasGeneratedRef.current = false;
      isMountedRef.current = false;
      setIsBackendComplete(false);
      setBackendResult(null);
      setDisplayProgress(0);
    } else {
      isMountedRef.current = true;
    }
  }, [isOpen]);

  // API call to generate test
  useEffect(() => {
    if (!isOpen) return;
    if (status === 'success' || status === 'failed') return;
    if (hasGeneratedRef.current) {
      console.log('⚠️ [MODAL] Generation already initiated, skipping duplicate call');
      return;
    }

    hasGeneratedRef.current = true;

    const generate = async () => {
      try {
        console.log('🚀 [MODAL] Starting generation...');
        setStatus('generating');
        setError(null);
        
        const response = await testAPI.generateTest({
          topic,
          difficulty,
          numberOfQuestions,
          provided_content: provided_content || undefined,
        });

        console.log('📦 [MODAL] Response received:', response.data);

        if (!isMountedRef.current) {
          console.log('⚠️ [MODAL] Component unmounted, ignoring response');
          return;
        }

        const responseData = response.data;
        
        if (responseData.success && responseData.data) {
          console.log('✅ [MODAL] Backend generation complete');
          // Signal backend completion - animation controller will handle the rest
          setIsBackendComplete(true);
          setBackendResult(responseData.data);
        } else {
          console.log('❌ [MODAL] Response indicates failure:', responseData);
          setStatus('failed');
          setError({ 
            message: responseData.error || 'Generation failed',
            limitReached: responseData.limitReached,
            remaining: responseData.remaining,
            limit: responseData.limit,
            isPaid: responseData.isPaid
          });
        }
      } catch (err) {
        if (!isMountedRef.current) {
          console.log('⚠️ [MODAL] Component unmounted, ignoring error');
          return;
        }
        
        console.error('❌ [MODAL] Generation error:', err);
        setStatus('failed');
        const errorMessage = err.response?.data?.error || err.message || 'Generation failed';
        const limitReached = err.response?.data?.limitReached || false;
        const remaining = err.response?.data?.remaining || 0;
        const limit = err.response?.data?.limit || 5;
        const isPaid = err.response?.data?.isPaid || false;
        
        setError({ 
          message: errorMessage,
          limitReached,
          remaining,
          limit,
          isPaid
        });
      }
    };

    generate();

    return () => {
      console.log('🧹 [MODAL] Cleanup called');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Full-screen backdrop */}
      <div className="generation-skeleton-bg" />
      
      {/* Flexbox centered overlay */}
      <div className="modal-overlay-premium">
        <div className="modal-content-premium">
          {/* Header */}
          <div className="modal-header-premium">
            <div>
              <h2 className="modal-title-premium">Generating Your Test</h2>
              <p className="modal-subtitle-premium">
                <span>{topic}</span>
                <span> • </span>
                <Target className="inline w-3 h-3" />
                <span>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                <span> • </span>
                <span>{numberOfQuestions} questions</span>
              </p>
            </div>
            <button onClick={onClose} className="modal-close-btn-premium" title="Close">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body-premium">
            {status === 'generating' ? (
              <div className="generation-content">
                {/* Animated AI Particle Icon */}
                <div className="ai-particle-container">
                  <div className="ai-particle-core">
                    <div className="ai-particle-glow" />
                    <div className="ai-particle-pulse" />
                    <Sparkles className="ai-particle-icon" size={56} />
                  </div>
                </div>

                {/* Dynamic step text with icon */}
                <h3 className="generation-step-text">
                  <StepIcon className="w-5 h-5" />
                  {currentStep.text}
                </h3>

                {/* Smart Progress Section */}
                <div className="progress-container">
                  <div className="progress-percentage">{Math.round(displayProgress)}%</div>
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${displayProgress}%` }}
                    >
                      <div className="progress-bar-shimmer" />
                    </div>
                  </div>
                </div>

                {/* Step indicators - 5 dots for 20% each */}
                <div className="step-indicators">
                  <div className={`step-dot ${displayProgress >= 20 ? 'completed' : displayProgress > 0 ? 'active' : ''}`} />
                  <div className={`step-dot ${displayProgress >= 40 ? 'completed' : displayProgress >= 20 ? 'active' : ''}`} />
                  <div className={`step-dot ${displayProgress >= 60 ? 'completed' : displayProgress >= 40 ? 'active' : ''}`} />
                  <div className={`step-dot ${displayProgress >= 80 ? 'completed' : displayProgress >= 60 ? 'active' : ''}`} />
                  <div className={`step-dot ${displayProgress >= 95 ? 'completed' : displayProgress >= 80 ? 'active' : ''}`} />
                </div>

                <p className="generation-hint">
                  <Clock className="w-4 h-4" />
                  This usually takes 30-60 seconds
                </p>
              </div>
            ) : status === 'success' ? (
              <div className="success-content">
                <div className="success-animation">
                  <div className="success-circle">
                    <CheckCircle2 className="success-checkmark" size={60} />
                  </div>
                </div>
                <h3 className="success-title">Test Generated! 🎉</h3>
                <p className="success-text">Your AI-powered test is ready to preview and publish.</p>
                
                {result && (
                  <div className="success-details">
                    <div className="detail-row">
                      <span className="detail-label">Questions:</span>
                      <span className="detail-value">{result.totalQuestions}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Difficulty:</span>
                      <span className="detail-value">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{result.duration} minutes</span>
                    </div>
                  </div>
                )}
              </div>
            ) : status === 'failed' ? (
              <div className="error-content">
                <div className="error-icon-container">
                  <AlertCircle size={64} className="error-icon" />
                </div>
                <h3 className="error-title">
                  {error?.limitReached ? 'Test Generation Limit Reached' : 'Generation Failed'}
                </h3>
                <p className="error-message">
                  {error?.message || 'The AI service encountered an error. Please try again.'}
                </p>
                
                {error?.limitReached && (
                  <div style={{
                    background: 'rgba(79, 110, 245, 0.1)',
                    border: '1px solid rgba(79, 110, 245, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    fontSize: '14px',
                    color: '#e2e8f0',
                    width: '100%',
                    maxWidth: '400px'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                      You've used {error?.limit - error?.remaining}/{error?.limit} free tests
                    </p>
                    <p style={{ margin: 0, color: '#cbd5e1' }}>
                      Upgrade to Premium for unlimited test generation
                    </p>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      onClose();
                      toast.info('Please try generating the test again.');
                    }}
                    className="btn-error-close"
                  >
                    Close & Retry
                  </button>
                  {error?.limitReached && (
                    <button
                      onClick={() => navigate('/profile?tab=subscription')}
                      style={{
                        padding: '12px 28px',
                        background: 'linear-gradient(135deg, #4f6ef5 0%, #3b82f6 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(79, 110, 245, 0.3)'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      Upgrade Now
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
