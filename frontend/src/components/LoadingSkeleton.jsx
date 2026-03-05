import React from 'react';

const LoadingSkeleton = ({ rows = 5, columns = 7 }) => {
  return (
    <div className="loading-skeleton-container">
      <div className="loading-skeleton-header">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton-header-cell shimmer" />
        ))}
      </div>
      
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="loading-skeleton-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="skeleton-cell shimmer" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
