import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, ArrowRight, GraduationCap, Code, Database, Smartphone, Cloud, Server, Brain, Sparkles } from 'lucide-react';
import '../styles/DesignSystem.css';
import './ClassroomCard.css';

export default function ClassroomCard({ classroom, index = 0 }) {
  const navigate = useNavigate();

  const handleViewClassroom = () => {
    const id = classroom._id || classroom.id;
    navigate(`/classrooms/${id}`);
  };

  // Premium subject icon and color mapping
  const subjectConfig = {
    'Programming': { 
      icon: Code, 
      gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      iconColor: '#8B5CF6',
      glowColor: 'rgba(99, 102, 241, 0.3)'
    },
    'Web Development': { 
      icon: Code, 
      gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
      iconColor: '#06B6D4',
      glowColor: 'rgba(6, 182, 212, 0.3)'
    },
    'Data Science': { 
      icon: Database, 
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      iconColor: '#A78BFA',
      glowColor: 'rgba(139, 92, 246, 0.3)'
    },
    'Mobile Development': { 
      icon: Smartphone, 
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      iconColor: '#10B981',
      glowColor: 'rgba(16, 185, 129, 0.3)'
    },
    'Cloud Computing': { 
      icon: Cloud, 
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      iconColor: '#3B82F6',
      glowColor: 'rgba(59, 130, 246, 0.3)'
    },
    'DevOps': { 
      icon: Server, 
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      iconColor: '#F59E0B',
      glowColor: 'rgba(245, 158, 11, 0.3)'
    },
    'Machine Learning': { 
      icon: Brain, 
      gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
      iconColor: '#EC4899',
      glowColor: 'rgba(236, 72, 153, 0.3)'
    },
    'Other': { 
      icon: GraduationCap, 
      gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      iconColor: '#6366F1',
      glowColor: 'rgba(99, 102, 241, 0.3)'
    }
  };

  // Smart subject matching
  const getSubjectConfig = (subject) => {
    if (!subject) return subjectConfig['Other'];
    
    const normalized = subject.trim().toLowerCase();
    
    for (const [key, config] of Object.entries(subjectConfig)) {
      if (key.toLowerCase() === normalized) return config;
    }
    
    if (normalized.includes('program')) return subjectConfig['Programming'];
    if (normalized.includes('web')) return subjectConfig['Web Development'];
    if (normalized.includes('data')) return subjectConfig['Data Science'];
    if (normalized.includes('mobile')) return subjectConfig['Mobile Development'];
    if (normalized.includes('cloud')) return subjectConfig['Cloud Computing'];
    if (normalized.includes('devops') || normalized.includes('ops')) return subjectConfig['DevOps'];
    if (normalized.includes('machine') || normalized.includes('ai') || normalized.includes('learning')) return subjectConfig['Machine Learning'];
    
    return subjectConfig['Other'];
  };

  const config = getSubjectConfig(classroom.subject);
  const SubjectIcon = config.icon;

  return (
    <div 
      className="classroom-card-premium-2025"
      style={{
        '--card-glow': config.glowColor,
        animationDelay: `${index * 100}ms`
      }}
    >
      {/* Floating gradient orb background */}
      <div className="card-orb" style={{ background: config.gradient }} />
      
      {/* Subject Icon Header */}
      <div className="card-icon-container" style={{ background: config.gradient }}>
        <SubjectIcon size={24} color="white" strokeWidth={2.5} />
      </div>

      {/* Classroom Name & Handle */}
      <div className="card-header">
        <h3 className="heading-3" style={{ 
          marginBottom: 'var(--spacing-xs)',
          fontSize: '18px',
          fontWeight: 600
        }}>
          {classroom.name}
        </h3>
        <p className="body-small" style={{ 
          color: 'var(--text-tertiary)',
          fontSize: '12px'
        }}>
          @{classroom.handle || classroom._id?.substring(0, 8)}
        </p>
      </div>

      {/* Description */}
      {classroom.description && (
        <p className="body-medium card-description" style={{ fontSize: '13px' }}>
          {classroom.description.length > 70 
            ? classroom.description.substring(0, 70) + '...' 
            : classroom.description
          }
        </p>
      )}

      {/* Stats Row */}
      <div className="card-stats-row">
        <div className="stat-item">
          <Users size={14} color={config.iconColor} strokeWidth={2} />
          <span className="stat-value">{classroom.totalStudents || 0}</span>
          <span className="stat-label">Students</span>
        </div>
        
        <div className="stat-divider" />
        
        <div className="stat-item">
          <BookOpen size={14} color={config.iconColor} strokeWidth={2} />
          <span className="stat-value">{classroom.totalTests || 0}</span>
          <span className="stat-label">Tests</span>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleViewClassroom}
        className="btn-premium btn-premium-primary card-cta"
        style={{ 
          background: config.gradient,
          width: '100%',
          justifyContent: 'space-between',
          padding: '10px 16px',
          fontSize: '14px'
        }}
      >
        <span>View Classroom</span>
        <ArrowRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}

 
