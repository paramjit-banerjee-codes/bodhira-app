import React, { useState, useEffect } from 'react';
import './SmartProTips.css';

const TIPS = [
  'Shorter tests often give deeper insights into gaps.',
  'Track weekly progress — small trends reveal big patterns.',
  'Small daily practice beats long weekly study sessions.',
  'Review mistakes — that\'s where the learning happens.',
  'Give personalized feedback within 24 hours for maximum retention.',
  'Mix difficulty levels to challenge without overwhelming.',
  'Maintain your streak; momentum builds intelligence.',
  'Students improve faster with chapter-specific quizzes.',
  'Start sessions with a 5-minute recap for better engagement.',
  'Monitor trends — slow, steady progress matters more than spikes.',
  'High performers thrive with timed challenges.',
  'Low scores aren\'t failures — they\'re data points for improvement.',
  'Analyze mistakes; don\'t ignore them.',
  'Regular quizzes build long-term confidence.',
  'Track weak areas — improvement begins there.',
  'Aim for progress, not perfection.',
  'Frequent micro-tests outperform long monthly tests.',
  'Balanced difficulty keeps motivation stable.',
  'Visual progress charts motivate more than raw numbers.',
  'Improve 1% every day — that\'s enough.',
];

export default function SmartProTips() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Rotate tips every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextTip();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleNextTip = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
      setIsTransitioning(false);
    }, 300);
  };

  const progressPercentage = ((currentTipIndex + 1) / TIPS.length) * 100;

  return (
    <div className="smart-pro-tips-container">
      <div className="tips-card">
        {/* Icon and Title */}
        <div className="tips-header">
          <img src="/logo3.png" alt="Bodhira" className="tips-icon-img" />
          <div className="tips-title-section">
            <h3 className="tips-title">Smart Pro Tip</h3>
            <p className="tips-counter">{currentTipIndex + 1} of {TIPS.length}</p>
          </div>
        </div>

        {/* Tip Content */}
        <div className={`tips-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
          <p className="tips-text">{TIPS[currentTipIndex]}</p>
        </div>

        {/* Bottom Section: Progress Bar + Next Button */}
        <div className="tips-footer">
          <div className="tips-progress-bar">
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <button className="next-tip-btn" onClick={handleNextTip} title="Next tip">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
