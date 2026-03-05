import React from 'react';
import { Zap } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon, 
  heading, 
  description, 
  ctaText, 
  onCtaClick 
}) => {
  return (
    <div className="empty-state">
      <Icon size={64} strokeWidth={1.5} className="empty-state-icon" />
      <h3 className="empty-state-heading">{heading}</h3>
      <p className="empty-state-description">{description}</p>
      
      {ctaText && onCtaClick && (
        <button className="empty-state-cta" onClick={onCtaClick}>
          <Zap size={18} strokeWidth={2} />
          <span>{ctaText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
