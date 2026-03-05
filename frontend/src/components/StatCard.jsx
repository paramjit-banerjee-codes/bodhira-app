import React from 'react';
import '../styles/DesignSystem.css';

/**
 * ═══════════════════════════════════════════════════════
 * PREMIUM STAT CARD COMPONENT
 * ═══════════════════════════════════════════════════════
 */

export default function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  unit = '',
  trend = null, // { direction: 'up' | 'down', value: '+5.2%' }
  color = 'primary', // primary | success | warning | danger | info
  badge = null // Optional badge text
}) {
  
  const colorMap = {
    primary: {
      iconBg: 'rgba(99, 102, 241, 0.15)',
      iconColor: '#6366F1',
      textColor: '#6366F1',
      hoverShadow: '0 12px 32px rgba(99, 102, 241, 0.3)'
    },
    success: {
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#10B981',
      textColor: '#10B981',
      hoverShadow: '0 12px 32px rgba(16, 185, 129, 0.3)'
    },
    warning: {
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#F59E0B',
      textColor: '#F59E0B',
      hoverShadow: '0 12px 32px rgba(245, 158, 11, 0.3)'
    },
    danger: {
      iconBg: 'rgba(239, 68, 68, 0.15)',
      iconColor: '#EF4444',
      textColor: '#EF4444',
      hoverShadow: '0 12px 32px rgba(239, 68, 68, 0.3)'
    },
    info: {
      iconBg: 'rgba(6, 182, 212, 0.15)',
      iconColor: '#06B6D4',
      textColor: '#06B6D4',
      hoverShadow: '0 12px 32px rgba(6, 182, 212, 0.3)'
    }
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <div 
      className="card-premium card-premium-gradient"
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'all var(--transition-base)',
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = colors.hoverShadow;
        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
      }}
    >
      {/* Icon Container */}
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: 'var(--radius-lg)',
        background: colors.iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'var(--spacing-lg)'
      }}>
        {Icon && <Icon size={24} color={colors.iconColor} strokeWidth={2} />}
      </div>

      {/* Label */}
      <div className="body-small" style={{
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--text-secondary)',
        marginBottom: 'var(--spacing-sm)'
      }}>
        {label}
      </div>

      {/* Value Container */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'baseline',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-md)'
      }}>
        <span style={{
          fontSize: 'var(--font-3xl)',
          fontWeight: 'var(--font-black)',
          color: colors.textColor,
          lineHeight: '1'
        }}>
          {value}
        </span>
        {unit && (
          <span style={{
            fontSize: 'var(--font-lg)',
            fontWeight: 'var(--font-semibold)',
            color: colors.textColor,
            opacity: 0.75
          }}>
            {unit}
          </span>
        )}
      </div>

      {/* Trend or Badge */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)'
      }}>
        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            fontSize: 'var(--font-xs)',
            fontWeight: 'var(--font-semibold)',
            color: trend.direction === 'up' ? 'var(--accent-success)' : 'var(--accent-danger)'
          }}>
            <span>{trend.direction === 'up' ? '↗' : '↘'}</span>
            <span>{trend.value}</span>
          </div>
        )}
        {badge && (
          <span className={`badge-premium badge-${color}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Background Gradient Circle */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-20%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.iconColor}20 0%, transparent 70%)`,
        pointerEvents: 'none',
        opacity: 0.5
      }} />
    </div>
  );
}
