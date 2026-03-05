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
  const animationFrameRef = useRef(null);
  const completionStartTimeRef = useRef(null);
  const progressAtCompletionRef = useRef(null);

  const COMPLETION_ANIMATION_DURATION = 2000; // 2 seconds to complete remaining progress

  // Get current status message and icon based on displayProgress
  const getStepInfo = () => {
    if (displayProgress < 20) return { text: 'Understanding context...', icon: Brain };
    if (displayProgress < 40) return { text: 'Analyzing topic depth...', icon: BookOpen };
    if (displayProgress < 60) return { text: 'Generating questions...', icon: FileText };
    if (displayProgress < 80) return { text: 'Validating quality...', icon: Shield };
    if (displayProgress < 95) return { text: 'Almost ready...', icon: Sparkles };
    return { text: 'Finalizing test...', icon: CheckCircle2 };
  };

  const currentStep = getStepInfo();
  const StepIcon = currentStep.icon;

  // Progress Animation Controller
  useEffect(() => {
    if (status !== 'generating' || !isOpen) return;

    setDisplayProgress(0);
    completionStartTimeRef.current = null;
    progressAtCompletionRef.current = null;
    
    const startTime = Date.now();
    let hasTriggeredSuccess = false;
    
    const animateProgress = () => {
      if (!isMountedRef.current || status !== 'generating') return;

      const now = Date.now();
      const elapsed = now - startTime;
      const elapsedSeconds = elapsed / 1000;

      let targetProgress = 0;

      // Backend has completed - animate remaining distance to 100%
      if (isBackendComplete) {
        if (!completionStartTimeRef.current) {
          // First frame after backend completion
          completionStartTimeRef.current = now;
          progressAtCompletionRef.current = displayProgress;
          console.log(`🎯 Backend complete at ${progressAtCompletionRef.current.toFixed(1)}% - animating to 100%`);
        }

        // Calculate how far into the completion animation we are
        const completionElapsed = now - completionStartTimeRef.current;
        const completionProgress = Math.min(completionElapsed / COMPLETION_ANIMATION_DURATION, 1);
        
        // Smooth linear animation from current progress to 100%
        const remainingDistance = 100 - progressAtCompletionRef.current;
        targetProgress = progressAtCompletionRef.current + (completionProgress * remainingDistance);

        // Update progress
        setDisplayProgress(targetProgress);

        // Check if animation is complete
        if (completionProgress >= 1 && !hasTriggeredSuccess) {
          hasTriggeredSuccess = true;
          setDisplayProgress(100);
          console.log('✅ Progress animation complete at 100%');
          
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
      }
      // Backend still working - normal progress
      else {
        // Progress up to 99% over 25 seconds
        const maxDuration = 25;
        const progressPercent = Math.min(elapsedSeconds / maxDuration, 0.99);
        targetProgress = progressPercent * 100;

        // Update progress
        setDisplayProgress(targetProgress);
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

  // Reset ref when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      // Only reset when closing
      hasGeneratedRef.current = false;
      isMountedRef.current = false;
      setIsBackendComplete(false);
      setBackendResult(null);
      completionStartTimeRef.current = null;
      progressAtCompletionRef.current = null;
    } else {
      // When opening, reset UI state but NOT hasGeneratedRef (it gets set in generation effect)
      isMountedRef.current = true;
      setStatus('generating');
      setError(null);
      setResult(null);
      setDisplayProgress(0);
      setIsBackendComplete(false);
      setBackendResult(null);
      completionStartTimeRef.current = null;
      progressAtCompletionRef.current = null;
    }
  }, [isOpen]);

  // Call API to generate test
  useEffect(() => {
    if (!isOpen) return;
    if (status === 'success' || status === 'failed') return;
    if (hasGeneratedRef.current) {
      console.log('⚠️ [MODAL] Generation already initiated, skipping duplicate call');
      return;
    }

    // Set immediately to prevent duplicate calls
    hasGeneratedRef.current = true;
    console.log('🚀 [MODAL] Starting generation...');
    setStatus('generating');
    setError(null);

    const generate = async () => {
      try {
        const response = await testAPI.generateTest({
          topic,
          difficulty,
          numberOfQuestions,
          provided_content: provided_content || undefined,
        });

        console.log('📦 [MODAL] Response received');

        if (!isMountedRef.current) {
          console.log('⚠️ [MODAL] Component unmounted, ignoring response');
          return;
        }

        const responseData = response.data;
        
        if (responseData.success && responseData.data) {
          console.log('✅ [MODAL] Generation successful - signaling backend completion');
          
          // Signal that backend is complete, but DON'T close modal yet
          // Let the animation controller smoothly animate to 100%
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

        if (err.name === 'AbortError' || err.code === 'ECONNABORTED') {
          console.log('⚠️ [MODAL] Generation request was aborted');
          return;
        }
        
        console.error('❌ [MODAL] Generation error:', err);
        setStatus('failed');
        setError({
          message: err.response?.data?.error || err.message || 'Failed to generate test'
        });
      }
    };

    generate();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (status === 'generating') {
      const confirmed = window.confirm('Generation in progress. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    onClose();
  };

  const handleViewTest = () => {
    if (result?.testId) {
      navigate(`/test/${result.testId}`);
      onClose();
    }
  };

  const handleUpgrade = () => {
    navigate('/payment');
    onClose();
  };

  return (
    <div 
      className="modal-overlay-premium"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 14, 39, 0.95)',
        visibility: 'visible',
        opacity: 1
      }}
    >
      <div 
        className="modal-content-premium"
        style={{
          position: 'relative',
          zIndex: 1000000,
          visibility: 'visible',
          opacity: 1
        }}
      >
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="modal-close-btn"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* GENERATING STATE */}
        {status === 'generating' && (
          <div className="modal-body-generating">
            {/* Animated sparkles */}
            <div className="sparkles-container">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="sparkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>

            {/* Main icon with glow */}
            <div className="icon-container-large">
              <div className="icon-glow" />
              <Sparkles className="main-icon" size={64} />
            </div>

            {/* Title */}
            <h2 className="modal-title-premium">
              Crafting Your Test
            </h2>

            {/* Current step with icon */}
            <div className="current-step">
              <StepIcon className="step-icon" size={20} />
              <span>{currentStep.text}</span>
            </div>

            {/* Progress bar */}
            <div className="progress-container-premium">
              <div className="progress-bar-track">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${displayProgress}%` }}
                >
                  <div className="progress-bar-shimmer" />
                </div>
              </div>
              <div className="progress-percentage">
                {Math.round(displayProgress)}%
              </div>
            </div>

            {/* Processing steps */}
            <div className="processing-steps">
              <div className={`step-item ${displayProgress >= 20 ? 'completed' : displayProgress >= 0 ? 'active' : ''}`}>
                <Brain size={16} />
                <span>Understanding context</span>
                {displayProgress >= 20 && <CheckCircle2 size={16} className="check-icon" />}
              </div>
              <div className={`step-item ${displayProgress >= 40 ? 'completed' : displayProgress >= 20 ? 'active' : ''}`}>
                <BookOpen size={16} />
                <span>Analyzing depth</span>
                {displayProgress >= 40 && <CheckCircle2 size={16} className="check-icon" />}
              </div>
              <div className={`step-item ${displayProgress >= 60 ? 'completed' : displayProgress >= 40 ? 'active' : ''}`}>
                <FileText size={16} />
                <span>Generating questions</span>
                {displayProgress >= 60 && <CheckCircle2 size={16} className="check-icon" />}
              </div>
              <div className={`step-item ${displayProgress >= 80 ? 'completed' : displayProgress >= 60 ? 'active' : ''}`}>
                <Shield size={16} />
                <span>Validating quality</span>
                {displayProgress >= 80 && <CheckCircle2 size={16} className="check-icon" />}
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && result && (
          <div className="modal-body-success">
            <div className="success-icon-container">
              <CheckCircle2 className="success-icon" size={64} />
            </div>
            <h2 className="modal-title-premium success-title">
              Test Created Successfully!
            </h2>
            <p className="success-message">
              Your {numberOfQuestions}-question {difficulty} test on "{topic}" is ready.
            </p>
            <button onClick={handleViewTest} className="btn-primary-premium">
              <Target size={20} />
              View Test
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'failed' && (
          <div className="modal-body-error">
            <div className="error-icon-container">
              <AlertCircle className="error-icon" size={64} />
            </div>
            <h2 className="modal-title-premium error-title">
              {error?.limitReached ? 'Generation Limit Reached' : 'Generation Failed'}
            </h2>
            
            {error?.limitReached ? (
              <div className="error-limit-info">
                <p className="error-message">
                  You've reached your {error.isPaid ? 'premium' : 'free'} test generation limit.
                </p>
                <div className="limit-stats">
                  <div className="stat-item">
                    <span className="stat-label">Used:</span>
                    <span className="stat-value">{error.limit - error.remaining} / {error.limit}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Remaining:</span>
                    <span className="stat-value">{error.remaining}</span>
                  </div>
                </div>
                {!error.isPaid && (
                  <button onClick={handleUpgrade} className="btn-upgrade">
                    <Zap size={20} />
                    Upgrade to Premium
                  </button>
                )}
              </div>
            ) : (
              <p className="error-message">
                {error?.message || 'An unexpected error occurred. Please try again.'}
              </p>
            )}
            
            <button onClick={handleClose} className="btn-secondary-premium">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
