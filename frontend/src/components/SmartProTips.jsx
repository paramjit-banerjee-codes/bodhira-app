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
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
        setIsTransitioning(false);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="smart-pro-tips-container">
      <div className="tips-card">
        <div className="tips-header">
          <img src="/logo3.png" alt="Bodhira" className="tips-icon-img" />
          <h3 className="tips-title">Smart Pro Tip</h3>
        </div>

        <div className={`tips-content ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
          <p className="tips-text">{TIPS[currentTipIndex]}</p>
        </div>

        <div className="tips-progress">
          {TIPS.map((_, idx) => (
            <div
              key={idx}
              className={`progress-dot ${idx === currentTipIndex ? 'active' : ''}`}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentTipIndex(idx);
                  setIsTransitioning(false);
                }, 500);
              }}
            />
          ))}
        </div>

        <p className="tips-counter">{currentTipIndex + 1} of {TIPS.length}</p>
      </div>
    </div>
  );
}
