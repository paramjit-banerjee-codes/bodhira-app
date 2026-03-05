import React from 'react';
import { Users, FileCheck, TrendingUp, Calendar, Shield, Hash } from 'lucide-react';
import StatCard from './StatCard';
import '../styles/DesignSystem.css';
import './OverviewTab.css';

/**
 * ═══════════════════════════════════════════════════════
 * PREMIUM OVERVIEW TAB 2025
 * ═══════════════════════════════════════════════════════
 */

export default function OverviewTab({ classroom, isTeacher }) {
  if (!classroom) {
    return (
      <div className="overview-loading">
        <div className="spinner-premium spinner-premium-lg"></div>
      </div>
    );
  }

  // Calculate average score
  const avgScore = classroom.averageScore || 0;
  const totalStudents = classroom.totalStudents || classroom.students?.length || 0;
  const totalTests = classroom.totalTests || classroom.tests?.length || 0;

  // Format date
  const createdDate = classroom.createdAt 
    ? new Date(classroom.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown';

  return (
    <div className="overview-tab-premium">
      {/* Stats Grid */}
      <div className="stats-grid-premium">
        <StatCard
          icon={Users}
          label="Total Students"
          value={totalStudents}
          color="primary"
          badge="Active"
        />
        
        <StatCard
          icon={FileCheck}
          label="Tests Created"
          value={totalTests}
          color="success"
          badge="Ready"
        />
        
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={avgScore.toFixed(1)}
          unit="%"
          color="warning"
          trend={avgScore >= 75 ? { direction: 'up', value: 'Excellent' } : null}
          badge={avgScore >= 75 ? 'Excellent' : avgScore >= 60 ? 'Good' : 'Needs Improvement'}
        />
      </div>

      {/* About Section */}
      <div className="about-section-premium">
        <h3 className="heading-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
          About This Classroom
        </h3>
        
        <div className="about-grid">
          <div className="about-item">
            <div className="about-icon-container" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
              <Calendar size={20} color="#6366F1" />
            </div>
            <div>
              <p className="body-small" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                Created
              </p>
              <p className="body-large" style={{ fontWeight: 'var(--font-semibold)' }}>
                {createdDate}
              </p>
            </div>
          </div>

          <div className="about-item">
            <div className="about-icon-container" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <Hash size={20} color="#10B981" />
            </div>
            <div>
              <p className="body-small" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                Classroom ID
              </p>
              <p className="body-medium" style={{ 
                fontFamily: 'monospace',
                color: 'var(--text-secondary)'
              }}>
                {classroom._id?.substring(0, 16)}...
              </p>
            </div>
          </div>

          <div className="about-item">
            <div className="about-icon-container" style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
              <Shield size={20} color="#06B6D4" />
            </div>
            <div>
              <p className="body-small" style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                Status
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)'
                }}></div>
                <p className="body-large" style={{ 
                  fontWeight: 'var(--font-semibold)',
                  color: '#10B981'
                }}>
                  Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {classroom.description && (
          <div className="description-card">
            <h4 className="heading-4" style={{ marginBottom: 'var(--spacing-md)' }}>
              Description
            </h4>
            <p className="body-medium" style={{ 
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-relaxed)'
            }}>
              {classroom.description}
            </p>
          </div>
        )}

        {/* Subject Badge */}
        {classroom.subject && (
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <p className="body-small" style={{ 
              color: 'var(--text-tertiary)', 
              marginBottom: 'var(--spacing-sm)'
            }}>
              Subject
            </p>
            <span className="badge-premium badge-primary" style={{
              fontSize: 'var(--font-sm)',
              padding: '8px 16px'
            }}>
              {classroom.subject}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
