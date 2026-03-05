import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, School, Search, Filter, Sparkles } from 'lucide-react';
import ClassroomCard from '../components/ClassroomCard';
import CreateClassroomModal from '../components/CreateClassroomModal';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { classroomAPI } from '../services/api';
import '../styles/DesignSystem.css';
import './ClassroomList.css';

export default function ClassroomList() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fetch classrooms on component mount (only if authenticated)
  useEffect(() => {
    if (user && !authLoading) {
      fetchClassrooms();
    }
  }, [user, authLoading]);

  // Handle parallax mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Filter classrooms based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClassrooms(classrooms);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredClassrooms(
        classrooms.filter(classroom =>
          classroom.name.toLowerCase().includes(query) ||
          classroom.subject?.toLowerCase().includes(query) ||
          classroom.handle?.toLowerCase().includes(query) ||
          classroom.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, classrooms]);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await classroomAPI.getClassrooms();
      const data = response?.data?.data || [];
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="container-premium section-premium">
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner-premium spinner-premium-lg"></div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="classroom-list-premium-2025" ref={containerRef}>
      {/* Animated Background */}
      <div className="classroom-bg-animated">
        <div 
          className="bg-orb bg-orb-primary" 
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="bg-orb bg-orb-secondary" 
          style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="classroom-hero-premium">
        <div className="container-premium">
          <div className="hero-content">
            <div className="hero-icon-badge">
              <School size={20} strokeWidth={2.5} />
            </div>
            
            <h1 className="heading-1" style={{ 
              marginBottom: 'var(--spacing-sm)',
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.5px'
            }}>
              My Classrooms
            </h1>
            
            <p className="body-small" style={{ 
              color: 'var(--text-secondary)', 
              maxWidth: '500px',
              margin: '0 auto var(--spacing-lg)',
              fontSize: '14px'
            }}>
              Create, manage, and scale your teaching experience
            </p>

            <div className="hero-actions">
              <button 
                className="btn-premium btn-premium-primary"
                onClick={() => setShowModal(true)}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>New Classroom</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-premium" style={{ paddingTop: 0 }}>
        {/* Search Bar - Premium Design */}
        {classrooms.length > 0 && (
          <div className="classroom-toolbar">
            <div className="search-container-premium">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input-premium"
                placeholder="Search classrooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="toolbar-stats">
              <span className="body-small" style={{ 
                color: 'var(--text-tertiary)',
                fontSize: '13px'
              }}>
                {filteredClassrooms.length} {filteredClassrooms.length === 1 ? 'classroom' : 'classrooms'}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="classroom-grid-premium">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-premium" style={{ 
                height: '340px',
                background: 'var(--surface-elevated)',
                animation: 'pulse 2s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`
              }}>
                <div className="spinner-premium"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card-premium" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <p className="body-large" style={{ color: 'var(--accent-danger)', marginBottom: 'var(--spacing-lg)' }}>
              {error}
            </p>
            <button 
              className="btn-premium btn-premium-secondary"
              onClick={fetchClassrooms}
            >
              Try Again
            </button>
          </div>
        ) : filteredClassrooms.length === 0 ? (
          searchQuery ? (
            <EmptyState
              icon={Search}
              title="No classrooms found"
              description={`No classrooms match "${searchQuery}". Try a different search term.`}
              iconColor="var(--accent-warning)"
            />
          ) : (
            <EmptyState
              icon={Sparkles}
              title="Create your first classroom"
              description="Start building your teaching community by creating your first classroom. Add students, share materials, and track progress."
              actionLabel="Create Classroom"
              onAction={() => setShowModal(true)}
              iconColor="var(--accent-primary)"
            />
          )
        ) : (
          <div className="classroom-grid-premium">
            {filteredClassrooms.map((classroom, index) => (
              <ClassroomCard 
                key={classroom._id || classroom.id} 
                classroom={classroom}
                index={index}
              />
            ))}
          </div>
        )}
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
