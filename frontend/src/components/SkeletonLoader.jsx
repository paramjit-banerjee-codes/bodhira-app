import React from 'react';
import './SkeletonLoader.css';

/**
 * SkeletonLoader Component
 * 
 * Provides smooth skeleton loading with shimmer animation.
 * Features:
 * - No fade-out animation (instant replacement)
 * - No shrinking effects
 * - Consistent layout heights
 * - Configurable width/height
 */

export const Skeleton = ({ width = '100%', height = '16px', variant = 'text' }) => {
  const getStyle = () => {
    let baseHeight = height;
    if (variant === 'circular') {
      return {
        width: height,
        height: height,
        borderRadius: '50%',
      };
    }
    if (variant === 'rectangular') {
      return {
        width,
        height: baseHeight,
        borderRadius: '4px',
      };
    }
    // Default text variant
    return {
      width,
      height: baseHeight,
      borderRadius: '4px',
    };
  };

  return <div className="skeleton" style={getStyle()}></div>;
};

export const DashboardSkeleton = () => {
  return (
    <div className="skeleton-dashboard">
      {/* Header */}
      <div className="skeleton-header-section">
        <Skeleton width="40%" height="44px" variant="rectangular" />
        <Skeleton width="70%" height="16px" variant="rectangular" />
      </div>

      {/* Quick Stats */}
      <div className="skeleton-stats-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-stat-card">
            <Skeleton width="60%" height="14px" variant="text" />
            <Skeleton width="40%" height="32px" variant="rectangular" />
            <Skeleton width="50%" height="12px" variant="text" />
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <Skeleton width="200px" height="48px" variant="rectangular" />

      {/* Tests List */}
      <div className="skeleton-tests-list">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton-test-item">
            <div className="skeleton-test-header">
              <Skeleton width="50%" height="20px" variant="text" />
              <Skeleton width="12%" height="24px" variant="rectangular" />
            </div>
            <div className="skeleton-test-meta">
              <Skeleton width="15%" height="14px" variant="text" />
              <Skeleton width="15%" height="14px" variant="text" />
              <Skeleton width="15%" height="14px" variant="text" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HistorySkeleton = () => {
  return (
    <div className="skeleton-history">
      {/* Header */}
      <div className="skeleton-header-section">
        <Skeleton width="25%" height="44px" variant="rectangular" />
      </div>

      {/* Created Tests Section */}
      <div className="skeleton-section">
        <Skeleton width="30%" height="24px" variant="text" />
        <div className="skeleton-table">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-table-row">
              <Skeleton width="25%" height="14px" variant="text" />
              <Skeleton width="15%" height="14px" variant="text" />
              <Skeleton width="15%" height="14px" variant="text" />
              <Skeleton width="15%" height="14px" variant="text" />
              <Skeleton width="20%" height="14px" variant="text" />
            </div>
          ))}
        </div>
      </div>

      {/* Attempted Tests Section */}
      <div className="skeleton-section">
        <Skeleton width="30%" height="24px" variant="text" />
        <div className="skeleton-table">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-table-row">
              <Skeleton width="15%" height="14px" variant="text" />
              <Skeleton width="20%" height="14px" variant="text" />
              <Skeleton width="15%" height="14px" variant="text" />
              <Skeleton width="15%" height="14px" variant="text" />
              <Skeleton width="15%" height="14px" variant="text" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
