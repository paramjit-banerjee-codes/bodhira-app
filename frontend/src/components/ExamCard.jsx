import React from 'react';
import { Clock, FileText, Star, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ExamCard.css';

const ExamCard = ({ exam }) => {
  const navigate = useNavigate();
  const IconComponent = exam.icon;

  const handleClick = () => {
    navigate(`/mock-tests/${exam.id}`);
  };

  return (
    <div 
      className="exam-card" 
      onClick={handleClick}
      aria-label={`View details for ${exam.name}`}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
      style={{
        '--exam-color': exam.color,
        '--exam-shadow': `rgba(${parseInt(exam.color.slice(1,3), 16)}, ${parseInt(exam.color.slice(3,5), 16)}, ${parseInt(exam.color.slice(5,7), 16)}, 0.35)`,
        '--exam-bg': `linear-gradient(135deg, ${exam.color}0D 0%, #18181B 100%)`,
        '--exam-gradient': exam.gradient,
        '--exam-button-shadow': `rgba(${parseInt(exam.color.slice(1,3), 16)}, ${parseInt(exam.color.slice(3,5), 16)}, ${parseInt(exam.color.slice(5,7), 16)}, 0.4)`
      }}
    >
      {/* Top Gradient Section */}
      <div 
        className="exam-card-gradient" 
        style={{ background: exam.gradient }}
      >
        <IconComponent className="card-icon" size={96} strokeWidth={1.5} />
        
        <div className="exam-card-badge">
          <Sparkles size={16} className="badge-icon" />
          <span>AI-Powered</span>
        </div>
      </div>

      {/* Bottom Content Section */}
      <div className="exam-card-content">
        <div className="exam-name-row">
          <IconComponent size={24} style={{ color: exam.color }} strokeWidth={2} />
          <h3 className="exam-card-name">{exam.name}</h3>
        </div>

        <p className="exam-card-description">{exam.description}</p>

        <div className="exam-card-stats">
          <div className="exam-stat">
            <Clock size={18} className="stat-icon clock-icon" strokeWidth={2} />
            <span>{exam.duration}</span>
          </div>
          <div className="exam-stat">
            <FileText size={18} className="stat-icon file-icon" strokeWidth={2} />
            <span>{exam.questions} Qs</span>
          </div>
          <div className="exam-stat">
            <Star size={18} className="stat-icon star-icon" fill="currentColor" strokeWidth={2} />
            <span>{exam.rating}</span>
          </div>
        </div>

        <button 
          className="exam-card-button"
          style={{ '--exam-color': exam.color, '--exam-gradient': exam.gradient }}
        >
          <span>View Details</span>
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default ExamCard;
