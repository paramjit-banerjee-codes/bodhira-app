import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertCircle } from 'lucide-react';
import { testAPI } from '../services/api';
import toast from '../utils/toast';
import '../pages/GenerateTest.css';

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
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('Analyzing content…');
  const [startTime, setStartTime] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  // Smooth progress bar animation from 0-90% during generation
  useEffect(() => {
    if (status !== 'generating' || isComplete) return;

    if (!startTime) {
      setStartTime(Date.now());
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const elapsed = Date.now() - startTime;
        
        // Instant start with linear progression to 90%
        // Reaches 90% in about 40-45 seconds
        const maxTime = 42000; // 42 seconds total to reach ~90%
        const normalizedTime = Math.min(elapsed / maxTime, 1);
        
        // Use linear easing for consistent, predictable speed
        const newProgress = normalizedTime * 90;
        
        return Math.max(prev, newProgress);
      });
    }, 100); // Update every 100ms for very smooth animation

    return () => clearInterval(interval);
  }, [status, startTime, isComplete]);

  // Smooth completion animation when generation finishes
  const completeProgressBar = () => {
    setIsComplete(true);
    setStepText('Finalizing test…');
    
    // Animate from 90% to 100% over 400ms with ease-out
    const startProgress = 90;
    const startTime = Date.now();
    const duration = 400; // 400ms for quick, satisfying completion
    
    const animateToComplete = () => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      
      // Cubic ease-out function for smooth deceleration
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const easedProgress = startProgress + (100 - startProgress) * easeOut(t);
      
      setProgress(Math.min(easedProgress, 100));
      
      if (elapsed < duration) {
        requestAnimationFrame(animateToComplete);
      } else {
        setProgress(100);
      }
    };
    
    requestAnimationFrame(animateToComplete);
  };

  // Update step text based on progress with smoother transitions
  useEffect(() => {
    if (progress <= 10) setStepText('Analyzing content…');
    else if (progress <= 20) setStepText('Extracting key points…');
    else if (progress <= 35) setStepText('Understanding context…');
    else if (progress <= 50) setStepText('Generating questions…');
    else if (progress <= 65) setStepText('Optimizing difficulty…');
    else if (progress <= 80) setStepText('Formatting test…');
    else if (progress < 100) setStepText('Finalizing test…');
  }, [progress]);

  // Call API to generate test
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true; // Prevent state updates on unmounted component
    const abortController = new AbortController(); // Cancel pending requests if effect re-runs

    const generate = async () => {
      try {
        console.log('🚀 [MODAL] Starting generation...');
        setStatus('generating');
        setError(null);
        
        console.log('📡 [MODAL] Calling API with:', { topic, difficulty, numberOfQuestions, provided_content: provided_content ? `${provided_content.length} chars` : 'none' });
        const response = await testAPI.generateTest({
          topic,
          difficulty,
          numberOfQuestions,
          provided_content: provided_content || undefined,
          signal: abortController.signal, // Pass abort signal to axios
        });

        if (!isMounted) {
          console.log('⚠️ [MODAL] Component unmounted, ignoring response');
          return;
        }

        // Response from axios includes data wrapper
        const responseData = response.data;
        console.log('✅ [MODAL] Got response:', responseData);
        
        if (responseData.success && responseData.data) {
          console.log('✅ [MODAL] Generation successful, showing success state');
          
          // Smoothly animate progress to 100%
          completeProgressBar();
          
          // Wait 400ms for progress animation, then show success
          setTimeout(() => {
            if (isMounted) {
              // Show success toast immediately
              toast.success('✨ Test generated successfully!', 2000);
              
              setStatus('success');
              setResult(responseData.data);
              
              // Call success callback immediately
              console.log('📢 [MODAL] Calling onSuccess callback');
              onSuccess(responseData.data);
              
              // Auto-close modal after 1.5 seconds to show success message
              console.log('⏱️ [MODAL] Scheduling auto-close in 1.5s');
              setTimeout(() => {
                if (isMounted) {
                  console.log('🔴 [MODAL] Calling onClose');
                  onClose();
                }
              }, 1500);
            }
          }, 400);
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
        if (!isMounted) {
          console.log('⚠️ [MODAL] Component unmounted, ignoring error');
          return;
        }

        // Ignore abort errors (request cancelled)
        if (err.name === 'AbortError' || err.code === 'ECONNABORTED') {
          console.log('⚠️ [MODAL] Generation request was aborted');
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

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort(); // Cancel pending request if component unmounts or effect re-runs
      console.log('🧹 [MODAL] Cleanup: cancelling pending request and setting isMounted to false');
    };
  }, [isOpen]);

  return (
    isOpen && (
      <>
        {/* Skeleton preview behind modal */}
        <div className="generation-skeleton-bg" />
        
        <div className="modal-overlay-premium" style={{ zIndex: 1000 }}>
          <div className="modal-content-premium">
            {/* Header */}
            <div className="modal-header-premium">
              <div>
                <h2 className="modal-title-premium">Generating Your Test</h2>
                <p className="modal-subtitle-premium">{topic} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} • {numberOfQuestions} questions</p>
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
                      <span className="ai-particle-icon">✨</span>
                    </div>
                  </div>

                  {/* Dynamic step text */}
                  <h3 className="generation-step-text">{stepText}</h3>

                  {/* Smart Progress Bar */}
                  <div className="progress-container">
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="progress-bar-shimmer" />
                      </div>
                    </div>
                    <p className="progress-percentage">{Math.round(progress)}%</p>
                  </div>

                  {/* Step indicators */}
                  <div className="step-indicators">
                    <div className={`step-dot ${progress > 12 ? 'completed' : progress > 0 ? 'active' : ''}`} />
                    <div className={`step-dot ${progress > 25 ? 'completed' : progress > 12 ? 'active' : ''}`} />
                    <div className={`step-dot ${progress > 45 ? 'completed' : progress > 25 ? 'active' : ''}`} />
                    <div className={`step-dot ${progress > 55 ? 'completed' : progress > 45 ? 'active' : ''}`} />
                    <div className={`step-dot ${progress > 70 ? 'completed' : progress > 55 ? 'active' : ''}`} />
                    <div className={`step-dot ${progress > 90 ? 'completed' : progress > 70 ? 'active' : ''}`} />
                  </div>

                  <p className="generation-hint">This usually takes 30-60 seconds</p>
                </div>
              ) : status === 'success' ? (
                <div className="success-content">
                  <div className="success-animation">
                    <div className="success-circle">
                      <span className="success-checkmark">✓</span>
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
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '16px',
                      fontSize: '14px',
                      color: '#e2e8f0'
                    }}>
                      <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                        You've used {error?.limit - error?.remaining}/{error?.limit} free tests
                      </p>
                      <p style={{ margin: 0, color: '#cbd5e1' }}>
                        Upgrade to Premium for unlimited test generation
                      </p>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
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
                          padding: '11px 24px',
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '14px',
                          transition: 'all 0.3s ease'
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

            {/* Premium animations and styles */}
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }

              @keyframes pulse-glow {
                0%, 100% { transform: scale(1); opacity: 0.4; }
                50% { transform: scale(1.2); opacity: 0.8; }
              }

              @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
              }

              @keyframes particle-float {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-8px) scale(1.05); }
              }

              @keyframes success-scale {
                0% { transform: scale(0); }
                70% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }

              @keyframes success-checkmark {
                0% { transform: scale(0) rotate(-90deg); }
                50% { transform: scale(1.15); }
                100% { transform: scale(1) rotate(0deg); }
              }

              @keyframes step-pulse {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
              }

              .generation-skeleton-bg {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
                pointer-events: none;
                z-index: 999;
              }

              .modal-overlay-premium {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1001;
              }

              .modal-content-premium {
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 16px;
                box-shadow: 
                  0 25px 50px rgba(0, 0, 0, 0.5),
                  0 0 60px rgba(59, 130, 246, 0.1);
                overflow: hidden;
                max-width: 520px;
                width: 90%;
                animation: modal-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
              }

              @keyframes modal-slide-in {
                from {
                  opacity: 0;
                  transform: translateY(20px) scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }

              .modal-header-premium {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 28px 28px 20px;
                border-bottom: 1px solid rgba(59, 130, 246, 0.1);
              }

              .modal-title-premium {
                margin: 0;
                color: #f1f5f9;
                font-size: 22px;
                font-weight: 700;
                letter-spacing: -0.5px;
              }

              .modal-subtitle-premium {
                margin: 8px 0 0 0;
                color: #94a3b8;
                font-size: 13px;
                font-weight: 500;
              }

              .modal-close-btn-premium {
                background: none;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: all 0.2s;
              }

              .modal-close-btn-premium:hover {
                color: #e2e8f0;
                background: rgba(59, 130, 246, 0.1);
              }

              .modal-body-premium {
                padding: 40px 32px;
                display: flex;
                flex-direction: column;
                gap: 0;
              }

              /* Generation State */
              .generation-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 24px;
              }

              .ai-particle-container {
                position: relative;
                width: 100px;
                height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .ai-particle-core {
                position: relative;
                width: 80px;
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .ai-particle-glow {
                position: absolute;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
                animation: pulse-glow 2s ease-in-out infinite;
              }

              .ai-particle-pulse {
                position: absolute;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 2px solid rgba(59, 130, 246, 0.3);
                animation: particle-float 3s ease-in-out infinite;
              }

              .ai-particle-icon {
                position: relative;
                font-size: 40px;
                animation: spin 4s linear infinite;
                z-index: 10;
              }

              .generation-step-text {
                margin: 0;
                color: #e2e8f0;
                font-size: 18px;
                font-weight: 600;
                text-align: center;
                min-height: 24px;
              }

              .progress-container {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 12px;
              }

              .progress-bar-bg {
                width: 100%;
                height: 6px;
                background: rgba(51, 65, 85, 0.8);
                border-radius: 10px;
                overflow: hidden;
                position: relative;
                border: 1px solid rgba(59, 130, 246, 0.2);
              }

              .progress-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%);
                border-radius: 10px;
                transition: width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                position: relative;
                box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
              }

              .progress-bar-shimmer {
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                animation: shimmer 2s infinite;
              }

              .progress-percentage {
                text-align: right;
                color: #94a3b8;
                font-size: 12px;
                font-weight: 600;
                margin: 0;
              }

              .step-indicators {
                display: flex;
                gap: 8px;
                justify-content: center;
                margin-top: 8px;
              }

              .step-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: rgba(51, 65, 85, 0.8);
                border: 1px solid rgba(59, 130, 246, 0.2);
                transition: all 0.3s ease;
              }

              .step-dot.active {
                background: #3b82f6;
                animation: step-pulse 1s ease-in-out infinite;
              }

              .step-dot.completed {
                background: #10b981;
                border-color: #10b981;
              }

              .generation-hint {
                color: #64748b;
                font-size: 12px;
                text-align: center;
                margin: 8px 0 0 0;
              }

              /* Success State */
              .success-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                animation: fadeIn 0.5s ease-out;
              }

              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }

              .success-animation {
                position: relative;
                width: 100px;
                height: 100px;
              }

              .success-circle {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
                animation: success-scale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
              }

              .success-checkmark {
                font-size: 48px;
                animation: success-checkmark 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
              }

              .success-title {
                margin: 8px 0 0 0;
                color: #10b981;
                font-size: 20px;
                font-weight: 700;
              }

              .success-text {
                color: #cbd5e1;
                font-size: 14px;
                text-align: center;
                margin: 0;
              }

              .success-details {
                width: 100%;
                background: rgba(16, 185, 129, 0.08);
                border: 1px solid rgba(16, 185, 129, 0.2);
                border-radius: 8px;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 10px;
              }

              .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
              }

              .detail-label {
                color: #94a3b8;
                font-size: 13px;
                font-weight: 500;
              }

              .detail-value {
                color: #a7f3d0;
                font-size: 13px;
                font-weight: 600;
              }

              /* Error State */
              .error-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
              }

              .error-icon-container {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.2);
              }

              .error-icon {
                color: #ef4444;
              }

              .error-title {
                margin: 0;
                color: #e2e8f0;
                font-size: 18px;
                font-weight: 700;
              }

              .error-message {
                color: #cbd5e1;
                font-size: 14px;
                text-align: center;
                margin: 0;
              }

              .btn-error-close {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                border: none;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
                margin-top: 8px;
              }

              .btn-error-close:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
              }

              /* Responsive */
              @media (max-width: 600px) {
                .modal-content-premium {
                  max-width: 95%;
                }

                .modal-body-premium {
                  padding: 32px 24px;
                }

                .modal-title-premium {
                  font-size: 18px;
                }

                .generation-step-text {
                  font-size: 16px;
                }
              }
            `}</style>
          </div>
        </div>
      </>
    )
  );
}
