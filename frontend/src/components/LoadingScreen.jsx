import React, { useState, useEffect } from 'react';
import { Loader2, Check, CheckCircle, ArrowRight } from 'lucide-react';
import './LoadingScreen.css';

const LoadingScreen = ({ examName, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { id: 0, label: 'Analyzing exam pattern', duration: 4000 },
    { id: 1, label: 'Generating questions', duration: 6000 },
    { id: 2, label: 'Finalizing test paper', duration: 2000 }
  ];

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / 120); // 12 seconds total
      });
    }, 100);

    // Step progression
    let stepTimeouts = [];
    let accumulatedTime = 0;

    steps.forEach((step, index) => {
      accumulatedTime += step.duration;
      const timeout = setTimeout(() => {
        setCurrentStep(index + 1);
      }, accumulatedTime);
      stepTimeouts.push(timeout);
    });

    // Show complete state
    const completeTimeout = setTimeout(() => {
      setIsComplete(true);
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }, 12000);

    return () => {
      clearInterval(progressInterval);
      stepTimeouts.forEach(timeout => clearTimeout(timeout));
      clearTimeout(completeTimeout);
    };
  }, []);

  const getStepState = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  if (isComplete) {
    return (
      <div className="loading-screen-overlay">
        <div className="loading-card">
          <CheckCircle size={80} className="success-icon" />
          <h2 className="loading-heading">Test Ready!</h2>
          <p className="loading-message">
            Your AI-generated mock test is ready. Good luck!
          </p>
          <button className="start-test-button">
            <span>Start Test Now</span>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-screen-overlay">
      <div className="loading-card">
        <div className="loader-container">
          <Loader2 size={80} className="rotating-loader" />
        </div>

        <h2 className="loading-heading">Generating Your Mock Test...</h2>
        <p className="loading-message">
          AI is analyzing 20+ past papers to create a custom test that matches real exam patterns
        </p>

        <div className="progress-steps">
          {steps.map((step) => {
            const state = getStepState(step.id);
            return (
              <div key={step.id} className={`progress-step progress-step-${state}`}>
                <div className="step-icon-wrapper">
                  {state === 'completed' && (
                    <div className="step-icon-completed">
                      <Check size={14} />
                    </div>
                  )}
                  {state === 'active' && (
                    <div className="step-icon-active">
                      <Loader2 size={14} className="step-spinner" />
                    </div>
                  )}
                  {state === 'pending' && (
                    <div className="step-icon-pending"></div>
                  )}
                </div>
                <div className="step-text">{step.label}</div>
              </div>
            );
          })}
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar-track">
            <div 
              className="progress-bar-fill-loading"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
