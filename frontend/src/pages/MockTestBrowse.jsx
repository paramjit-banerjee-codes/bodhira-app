import React, { useState, useEffect } from 'react';
import { 
  Target, Sparkles, Users, Trophy, Search, Filter, 
  GraduationCap 
} from 'lucide-react';
import ExamCard from '../components/ExamCard';
import { mockExams } from '../data/mockExamData';
import './MockTestBrowse.css';

const MockTestBrowse = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExams, setFilteredExams] = useState(mockExams);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredExams(mockExams);
    } else {
      const filtered = mockExams.filter(exam => 
        exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExams(filtered);
    }
  }, [searchQuery]);

  return (
    <div className="mock-test-browse">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background-effects">
          <div className="grid-pattern"></div>
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <Target size={18} className="badge-icon-purple" />
            <span>AI-POWERED MOCK EXAMS</span>
          </div>

          <h1 className="hero-heading">
            <span className="gradient-text">Master Your Exam</span>
            <br />
            <span className="gradient-text">with AI Mock Tests</span>
          </h1>

          <p className="hero-subheading">
            Experience real exam conditions with AI-generated tests that adapt to actual exam patterns. 
            Train with intelligence, not just memory.
          </p>

          <div className="feature-pills">
            <div className="feature-pill">
              <Sparkles size={22} className="pill-icon-purple" />
              <span>AI-Generated Tests</span>
            </div>
            <div className="feature-pill">
              <Users size={22} className="pill-icon-blue" />
              <span>10,000+ Students</span>
            </div>
            <div className="feature-pill">
              <Trophy size={22} className="pill-icon-yellow" />
              <span>Real Exam Patterns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input 
            type="text"
            placeholder="Search for exams (GATE, JEE, NEET, SSC...)"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="filter-button">
          <Filter size={20} />
          <span>Filter</span>
        </button>
      </div>

      {/* Exam Categories Section */}
      <div className="exam-categories-section">
        <h2 className="section-header">
          <GraduationCap size={36} className="header-icon-purple" />
          <span>Choose Your Exam</span>
        </h2>

        {filteredExams.length === 0 ? (
          <div className="no-results">
            <Search size={64} className="no-results-icon" />
            <h3>No exams found</h3>
            <p>Try searching with different keywords</p>
          </div>
        ) : (
          <div className="exam-cards-grid">
            {filteredExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTestBrowse;
