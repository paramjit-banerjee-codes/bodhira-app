import { Eye, Trash2 } from 'lucide-react';

export default function StudentCard({ student, onViewProgress, onRemove, loading, isTeacher }) {
  if (!student) return null;

  const name = student.name || 'Unknown';
  const handle = student.handle || student.username || 'unknown';
  const testsCompleted = student.testsCompleted || student.testsTaken || 0;
  const avgScore = student.avgScore || 0;
  const enrolledDate = student.enrolledDate 
    ? new Date(student.enrolledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'N/A';

  const isRemoving = loading;
  
  // Determine progress bar color and status
  let progressClass = 'high';
  let statusColor = 'text-emerald-400';
  if (avgScore < 60) {
    progressClass = 'low';
    statusColor = 'text-red-400';
  } else if (avgScore < 80) {
    progressClass = 'medium';
    statusColor = 'text-yellow-400';
  }

  return (
    <div className="student-card">
      {/* Card Top - Avatar and Name */}
      <div className="student-card-top">
        <div className="student-avatar">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="student-info">
          <h3 className="student-name">{name}</h3>
          <p className="student-handle">@{handle}</p>
          <span className="student-enrollment-badge">
            📅 {enrolledDate}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="student-stats">
        <div className="stat-box">
          <span className="stat-label">Tests Completed</span>
          <span className="stat-value">{testsCompleted}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Avg Score</span>
          <span className={`stat-value ${statusColor}`}>{avgScore}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-label">
          <span>Performance</span>
          <span className="progress-percentage">{avgScore}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-fill ${progressClass}`}
            style={{ width: `${avgScore}%` }}
          ></div>
        </div>
      </div>

      {/* Action Buttons - Remove only for teachers */}
      <div className="student-card-actions">
        <button
          onClick={() => onViewProgress && onViewProgress(student)}
          disabled={isRemoving}
          className="btn-student-action btn-student-progress"
          title="View student progress"
        >
          <Eye size={14} />
          Progress
        </button>
        {isTeacher && onRemove && (
          <button
            onClick={() => onRemove && onRemove(student)}
            disabled={isRemoving}
            className="btn-student-action btn-student-remove"
            title="Remove student from classroom"
          >
            <Trash2 size={14} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
