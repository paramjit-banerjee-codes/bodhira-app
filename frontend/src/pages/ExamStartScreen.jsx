import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, X, Sparkles, Clock, FileText, Award, BarChart,
  BookOpen, Calculator, Zap, Microscope, Target, CheckCircle, 
  XCircle, Minus, Info, Check, TrendingUp, Loader2
} from 'lucide-react';
import { getExamById } from '../data/mockExamData';
import LoadingScreen from '../components/LoadingScreen';
import './ExamStartScreen.css';

const ExamStartScreen = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = getExamById(examId);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!exam) {
    return (
      <div className="exam-not-found">
        <h2>Exam not found</h2>
        <button onClick={() => navigate('/mock-tests')}>Back to Exams</button>
      </div>
    );
  }

  const IconComponent = exam.icon;

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation - replace with actual API call
    setTimeout(() => {
      setIsGenerating(false);
      // Navigate to test interface
      // navigate(`/test/${generatedTestId}`);
      alert('Test generated! (In production, this would navigate to the test interface)');
    }, 12000);
  };

  const getSectionIcon = (iconName) => {
    const icons = {
      FileText: FileText,
      Calculator: Calculator,
      Brain: Sparkles,
      Zap: Zap,
      Microscope: Microscope
    };
    return icons[iconName] || FileText;
  };

  return (
    <>
      <div className="exam-start-screen">
        {/* Header Bar */}
        <div className="exam-header-bar">
          <div className="header-back" onClick={() => navigate('/mock-tests')}>
            <ArrowLeft size={20} />
            <span>Back to Exams</span>
          </div>
          <button className="header-close" onClick={() => navigate('/mock-tests')}>
            <X size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="exam-main-content">
          {/* Hero Section */}
          <div className="exam-hero">
            <div className="exam-icon-container" style={{ background: exam.gradient }}>
              <IconComponent size={64} className="exam-central-icon" />
              <div className="exam-floating-badge">
                <Sparkles size={20} />
              </div>
            </div>

            <h1 className="exam-name">{exam.fullName}</h1>
            <p className="exam-subtitle">{exam.description}</p>

            {/* Quick Stats Grid */}
            <div className="quick-stats-grid">
              <div className="quick-stat-card">
                <div className="stat-icon-container stat-blue">
                  <Clock size={28} />
                </div>
                <div className="stat-value">{exam.duration}</div>
                <div className="stat-label">Duration</div>
              </div>

              <div className="quick-stat-card">
                <div className="stat-icon-container stat-purple">
                  <FileText size={28} />
                </div>
                <div className="stat-value">{exam.questions}</div>
                <div className="stat-label">Questions</div>
              </div>

              <div className="quick-stat-card">
                <div className="stat-icon-container stat-green">
                  <Award size={28} />
                </div>
                <div className="stat-value">{exam.totalMarks}</div>
                <div className="stat-label">Total Marks</div>
              </div>

              <div className="quick-stat-card">
                <div className="stat-icon-container stat-orange">
                  <BarChart size={28} />
                </div>
                <div className="stat-value">{exam.difficulty}</div>
                <div className="stat-label">Difficulty</div>
              </div>
            </div>
          </div>

          {/* Exam Format Section */}
          <div className="exam-section">
            <h2 className="section-title">
              <BookOpen size={32} className="title-icon-purple" />
              <span>Exam Format</span>
            </h2>

            <div className="sections-card">
              <div className="sections-header">
                <div>Section</div>
                <div>Questions</div>
                <div>Marks</div>
              </div>
              {exam.sections.map((section, index) => {
                const SectionIcon = getSectionIcon(section.icon);
                return (
                  <div key={index} className="section-row">
                    <div className="section-name">
                      <SectionIcon size={20} style={{ color: section.iconColor }} />
                      <span>{section.name}</span>
                    </div>
                    <div className="section-questions">{section.questions} questions</div>
                    <div className="section-marks">{section.marks} marks</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Marking Scheme Section */}
          <div className="exam-section">
            <h2 className="section-title">
              <Target size={32} className="title-icon-purple" />
              <span>Marking Scheme</span>
            </h2>

            <div className="marking-card">
              <div className="marking-item">
                <div className="marking-icon-container marking-correct">
                  <CheckCircle size={32} />
                </div>
                <div className="marking-text">Correct Answer</div>
                <div className="marking-value marking-value-green">
                  +{exam.markingScheme.correct} marks
                </div>
              </div>

              <div className="marking-item">
                <div className="marking-icon-container marking-wrong">
                  <XCircle size={32} />
                </div>
                <div className="marking-text">Wrong Answer</div>
                <div className="marking-value marking-value-red">
                  {exam.markingScheme.wrong} mark
                </div>
              </div>

              <div className="marking-item">
                <div className="marking-icon-container marking-unattempted">
                  <Minus size={32} />
                </div>
                <div className="marking-text">Unattempted</div>
                <div className="marking-value marking-value-gray">
                  {exam.markingScheme.unattempted} marks
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Distribution Section */}
          <div className="exam-section">
            <h2 className="section-title">
              <TrendingUp size={32} className="title-icon-purple" />
              <span>Question Difficulty</span>
            </h2>

            <div className="difficulty-card">
              <div className="difficulty-bar-wrapper">
                <div className="difficulty-bar-header">
                  <div className="difficulty-label">
                    <Award size={18} className="difficulty-icon-green" />
                    <span>Easy</span>
                  </div>
                  <div className="difficulty-percentage">{exam.difficultyDistribution.easy}%</div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill progress-fill-green"
                    style={{ width: `${exam.difficultyDistribution.easy}%` }}
                  ></div>
                </div>
              </div>

              <div className="difficulty-bar-wrapper">
                <div className="difficulty-bar-header">
                  <div className="difficulty-label">
                    <Award size={18} className="difficulty-icon-orange" />
                    <span>Medium</span>
                  </div>
                  <div className="difficulty-percentage">{exam.difficultyDistribution.medium}%</div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill progress-fill-orange"
                    style={{ width: `${exam.difficultyDistribution.medium}%` }}
                  ></div>
                </div>
              </div>

              <div className="difficulty-bar-wrapper">
                <div className="difficulty-bar-header">
                  <div className="difficulty-label">
                    <Award size={18} className="difficulty-icon-red" />
                    <span>Hard</span>
                  </div>
                  <div className="difficulty-percentage">{exam.difficultyDistribution.hard}%</div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill progress-fill-red"
                    style={{ width: `${exam.difficultyDistribution.hard}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="instructions-card">
            <div className="instructions-header">
              <Info size={28} className="instructions-icon" />
              <h3>Before You Start</h3>
            </div>
            <div className="instructions-list">
              {exam.instructions.map((instruction, index) => (
                <div key={index} className="instruction-item">
                  <Check size={20} className="instruction-check" />
                  <span>{instruction}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button (Sticky) */}
        <div className="generate-button-container">
          <button 
            className="generate-button"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 size={24} className="button-spinner" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={24} />
                <span>Generate AI Mock Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Screen Overlay */}
      {isGenerating && <LoadingScreen examName={exam.name} />}
    </>
  );
};

export default ExamStartScreen;
