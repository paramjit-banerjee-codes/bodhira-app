import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, ArrowRight } from 'lucide-react';
import './ClassroomCard.css';

export default function ClassroomCard({ classroom, index = 0 }) {
  const navigate = useNavigate();

  const handleViewClassroom = () => {
    const id = classroom._id || classroom.id;
    navigate(`/classrooms/${id}`);
  };

  // Color mapping for subjects - all blue theme
  const subjectColors = {
    'Programming': { primary: '#3b82f6', accent: '#60a5fa', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)' },
    'Web Development': { primary: '#3b82f6', accent: '#60a5fa', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)' },
    'Data Science': { primary: '#3b82f6', accent: '#60a5fa', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)' },
    'Mobile Development': { primary: '#3b82f6', accent: '#60a5fa', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)' },
    'Cloud Computing': { primary: '#3b82f6', accent: '#60a5fa', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)' },
    'DevOps': { primary: '#3b82f6', accent: '#60a5fa', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)' },
    'Machine Learning': { primary: '#3b82f6', accent: '#60a5fa', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)' },
    'Other': { primary: '#3b82f6', accent: '#60a5fa', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)' }
  };

  // Function to get colors with fuzzy matching
  const getSubjectColors = (subject) => {
    if (!subject) return subjectColors['Other'];
    
    const normalizedSubject = subject.trim().toLowerCase();
    
    // Try exact match first (case-insensitive)
    for (const [key, colors] of Object.entries(subjectColors)) {
      if (key.toLowerCase() === normalizedSubject) {
        return colors;
      }
    }
    
    // Try partial matches
    if (normalizedSubject.includes('program')) return subjectColors['Programming'];
    if (normalizedSubject.includes('web')) return subjectColors['Web Development'];
    if (normalizedSubject.includes('data')) return subjectColors['Data Science'];
    if (normalizedSubject.includes('mobile')) return subjectColors['Mobile Development'];
    if (normalizedSubject.includes('cloud')) return subjectColors['Cloud Computing'];
    if (normalizedSubject.includes('devops') || normalizedSubject.includes('ops')) return subjectColors['DevOps'];
    if (normalizedSubject.includes('machine') || normalizedSubject.includes('learning')) return subjectColors['Machine Learning'];
    
    // Return a vibrant default color if no match
    return subjectColors['Other'];
  };

  const colors = getSubjectColors(classroom.subject);

  return (
    <div className="classroom-card-premium">
      {/* Header Section */}
      <div className="card-header-premium">
        <div className="header-title-premium">
          <h3 className="classroom-name-premium">{classroom.name}</h3>
          <p className="classroom-id-premium">@{classroom.handle || classroom._id?.substring(0, 8)}</p>
        </div>
        <div className="subject-tag-premium" style={{ 
          background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}dd 100%)`,
          borderColor: colors.accent
        }}>
          {classroom.subject}
        </div>
      </div>

      {/* Description */}
      {classroom.description && (
        <p className="card-description-premium">{classroom.description}</p>
      )}

      {/* Stats Section with Glow */}
      <div className="card-stats-premium">
        <div className="stat-premium">
          <div className="stat-icon-glow" style={{ borderColor: colors.border, background: colors.bg }}>
            <Users size={20} style={{ color: colors.accent }} />
          </div>
          <div className="stat-info-premium">
            <span className="stat-number-premium" style={{ color: colors.accent }}>{classroom.totalStudents || 0}</span>
            <span className="stat-label-premium">Students</span>
          </div>
        </div>
        <div className="stat-divider-premium"></div>
        <div className="stat-premium">
          <div className="stat-icon-glow" style={{ borderColor: colors.border, background: colors.bg }}>
            <BookOpen size={20} style={{ color: colors.accent }} />
          </div>
          <div className="stat-info-premium">
            <span className="stat-number-premium" style={{ color: colors.accent }}>{classroom.totalTests || 0}</span>
            <span className="stat-label-premium">Tests</span>
          </div>
        </div>
      </div>

      {/* CTA Button with Neon Border Reveal */}
      <button
        onClick={handleViewClassroom}
        className="card-button-premium"
        style={{ 
          background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}dd 100%)`
        }}
      >
        <span className="btn-text-premium">View Classroom</span>
        <ArrowRight size={18} className="btn-icon-premium" />
      </button>
    </div>
  );
}
 
