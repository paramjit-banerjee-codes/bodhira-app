import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ 
  icon: Icon, 
  value, 
  label, 
  gradient, 
  change, 
  isPositive = true 
}) => {
  return (
    <div className="stats-card">
      <div 
        className="stats-card-decoration"
        style={{ background: gradient }}
      >
        <Icon size={120} strokeWidth={1} />
      </div>

      <div 
        className="stats-card-icon-container"
        style={{ background: gradient }}
      >
        <Icon size={28} strokeWidth={2} />
      </div>

      <div className="stats-card-value">{value}</div>
      <div className="stats-card-label">{label}</div>

      {change && (
        <div className={`stats-card-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? (
            <TrendingUp size={14} strokeWidth={2.5} />
          ) : (
            <TrendingDown size={14} strokeWidth={2.5} />
          )}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
