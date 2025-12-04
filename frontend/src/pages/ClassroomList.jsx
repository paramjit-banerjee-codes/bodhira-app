import { useState, useEffect, useRef } from 'react';
import ClassroomCard from '../components/ClassroomCard';
import CreateClassroomModal from '../components/CreateClassroomModal';
import { classroomAPI } from '../services/api';
import './ClassroomList.css';

export default function ClassroomList() {
  const [showModal, setShowModal] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Fetch classrooms on component mount
  useEffect(() => {
    fetchClassrooms();
  }, []);

  // Handle parallax mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await classroomAPI.getClassrooms();
      const data = response?.data?.data || [];
      // Use backend data (empty array allowed)
      setClassrooms(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroom = async (classroomData) => {
    try {
      const response = await classroomAPI.createClassroom(classroomData);
      setClassrooms([...classrooms, response.data.data]);
      setShowModal(false);
    } catch (err) {
      console.error('Error creating classroom:', err);
      alert('Failed to create classroom: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container classroom-container" ref={containerRef}>
      {/* Premium Background with Parallax */}
      <div className="classroom-bg-premium">
        <div className="classroom-bg-glow" style={{
          transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`
        }}></div>
        <div className="classroom-bg-glow-secondary" style={{
          transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.03}px)`
        }}></div>
      </div>

      {/* Hero Section with Glow */}
      <div className="classroom-hero">
        <div className="hero-icon-wrapper">
          <div className="hero-icon-glow"></div>
          <div className="hero-icon">✨</div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">My Classrooms</h1>
          <p className="hero-subtitle">Create, manage, and scale your teaching experience</p>
        </div>
      </div>

      <div className="classroom-content">
        {/* Classrooms Grid */}
        {!loading && classrooms.length > 0 && (
          <div className="classrooms-grid">
            {classrooms.map((classroom, idx) => (
              <div key={classroom._id || classroom.id} className="classroom-card-wrapper" style={{
                animationDelay: `${idx * 50}ms`
              }}>
                <ClassroomCard 
                  classroom={classroom}
                  index={idx}
                />
              </div>
            ))}
          </div>
        )}

        {/* Loading State - Premium Skeleton */}
        {loading && (
          <div className="skeleton-classrooms-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card" style={{
                animationDelay: `${i * 50}ms`
              }}>
                <div className="skeleton-card-header">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-badge"></div>
                </div>
                <div className="skeleton-description"></div>
                <div className="skeleton-stats">
                  <div className="skeleton-stat"></div>
                  <div className="skeleton-stat"></div>
                </div>
                <div className="skeleton-button"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state-premium">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Oops! Something went wrong</h3>
            <p className="error-description">{error}</p>
            <button
              onClick={fetchClassrooms}
              className="btn-error-retry"
            >
              <span>🔄 Try Again</span>
            </button>
          </div>
        )}

        {/* Empty State - Futuristic */}
        {!loading && classrooms.length === 0 && (
          <div className="empty-state-premium">
            <div className="empty-hologram-container">
              <div className="empty-hologram-icon">🏫</div>
              <div className="empty-hologram-glow"></div>
            </div>
            <h2 className="empty-title">No Classrooms Yet</h2>
            <p className="empty-description">Your teaching journey starts here. Create your first classroom to engage with students and manage assessments.</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-create-first"
            >
              <span className="btn-content">🚀 Create First Classroom</span>
              <span className="btn-ripple"></span>
            </button>
          </div>
        )}
      </div>

      {/* Create Button - Floating FAB with Neon Glow */}
      <div className="create-fab-container">
        <button
          onClick={() => setShowModal(true)}
          className="btn-fab-neon"
          title="Create new classroom"
        >
          <span className="fab-icon">+</span>
          <span className="fab-glow"></span>
          <span className="fab-particles">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="particle"></span>
            ))}
          </span>
        </button>
      </div>

      {/* Create Classroom Modal */}
      {showModal && (
        <CreateClassroomModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onCreate={handleCreateClassroom}
        />
      )}
    </div>
  );
}
