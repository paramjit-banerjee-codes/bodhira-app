import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Sparkles, Zap, Crown, BookOpen, FileText, Settings2, Target, 
  TrendingUp, Users, Clock, Check, ChevronDown, ChevronRight,
  Lightbulb, Upload, BarChart3, AlertCircle, Loader2, Copy,
  ArrowRight, PieChart, CheckCircle2, X
} from 'lucide-react';
import { testAPI, classroomAPI, profileAPI } from '../services/api';
import GenerationStatusModal from '../components/GenerationStatusModal';
import './GenerateTest.css';

const GenerateTest = ({ classroomId: propClassroomId } = {}) => {
  const navigate = useNavigate();
  const params = useParams();
  const classroomId = propClassroomId || params.classroomId;

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: '',
    numberOfQuestions: 10,
    difficulty: 'medium',
    provided_content: '',
  });

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generatedTest, setGeneratedTest] = useState(null);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Classroom state
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [linkingClassroom, setLinkingClassroom] = useState(false);
  
  // Publishing state
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Quota state
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState(null);
  const [quotaData, setQuotaData] = useState(null);
  const [checkingLimits, setCheckingLimits] = useState(false);

  // Quick topic suggestions
  const quickTopics = [
    'Database Management Systems',
    'Data Structures & Algorithms',
    'Operating Systems',
    'Computer Networks',
    'Machine Learning Basics',
    'Web Development'
  ];

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        setCheckingLimits(true);
        const quotaResponse = await testAPI.getQuotaStatus();
        const quota = quotaResponse.data?.data;
        setQuotaData(quota);
        
        const response = await profileAPI.getProfile();
        const profile = response.data?.data || {};
        setUserSubscriptionStatus({
          ...profile.subscription,
          isPaid: quota?.isPaid || false,
          remaining: quota?.remaining || 5
        });
      } catch (err) {
        console.error('Error checking subscription/quota status:', err);
        setQuotaData({
          canGenerate: true,
          remaining: 5,
          limit: 5,
          isPaid: false,
          message: 'Unable to fetch quota info'
        });
      } finally {
        setCheckingLimits(false);
      }
    };
    checkSubscriptionStatus();
  }, []);

  // Load classrooms when test is generated
  useEffect(() => {
    if (generatedTest && !showClassroomModal) {
      loadClassrooms();
      setShowClassroomModal(true);
    }
  }, [generatedTest]);

  const loadClassrooms = async () => {
    try {
      const response = await classroomAPI.getClassrooms();
      const classroomsList = response.data?.data || [];
      setClassrooms(classroomsList);
      if (classroomsList.length > 0) {
        setSelectedClassroom(classroomsList[0]._id);
      }
    } catch (err) {
      console.error('Error loading classrooms:', err);
      setClassrooms([]);
    }
  };

  const handleTopicChange = (value) => {
    setFormData({ ...formData, topic: value });
    if (value.trim() && currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 300);
    }
  };

  const handleQuickTopic = (topic) => {
    handleTopicChange(topic);
  };

  const handleContentChange = (value) => {
    setFormData({ ...formData, provided_content: value });
    if (currentStep === 2 && formData.topic.trim()) {
      setTimeout(() => setCurrentStep(3), 300);
    }
  };

  const handleQuestionsSelect = (num) => {
    setFormData({ ...formData, numberOfQuestions: num });
    if (currentStep === 3) {
      setTimeout(() => setCurrentStep(4), 200);
    }
  };

  const handleDifficultySelect = (level) => {
    setFormData({ ...formData, difficulty: level });
  };

  const handleGenerationSuccess = async (testData) => {
    console.log('Generation completed successfully:', testData);
    setShowGenerationModal(false);
    setGeneratedTest(testData);
    
    try {
      const quotaResponse = await testAPI.getQuotaStatus();
      const quota = quotaResponse.data?.data;
      setQuotaData(quota);
      console.log('✅ Quota refreshed after generation:', quota);
    } catch (err) {
      console.error('Error refreshing quota:', err);
    }
  };

  const handleLinkToClassroom = async () => {
    if (!selectedClassroom || !generatedTest) return;

    setLinkingClassroom(true);
    try {
      await testAPI.linkTestToClassroom(generatedTest.testId, selectedClassroom);
      console.log('✅ Test linked to classroom:', selectedClassroom);
      setShowClassroomModal(false);
    } catch (err) {
      console.error('Error linking test to classroom:', err);
      alert('Failed to link test to classroom. You can still publish it without linking.');
    } finally {
      setLinkingClassroom(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedTest) return;
    
    setPublishing(true);
    try {
      const publishData = {};
      if (selectedClassroom) {
        publishData.classroomId = selectedClassroom;
      }
      
      await testAPI.publishTest(generatedTest.testId, publishData);
      console.log('✅ Test published successfully');
      setPublishSuccess(true);
    } catch (err) {
      console.error('Error publishing test:', err);
      alert('Failed to publish test. Please try again.');
      setPublishing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      setCurrentStep(1);
      return;
    }

    if (!quotaData?.canGenerate && !(quotaData?.isPaid || userSubscriptionStatus?.isPaid)) {
      setError('You have reached your test generation limit. Please upgrade to continue.');
      return;
    }

    try {
      console.log('Generating test with:', formData);
      setShowGenerationModal(true);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to start test generation. Please try again.');
    }
  };

  const handleCopyCode = () => {
    const code = generatedTest?.testCode || generatedTest?.testId;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleCreateAnother = () => {
    setGeneratedTest(null);
    setPublishSuccess(false);
    setCurrentStep(1);
    setFormData({
      topic: '',
      numberOfQuestions: 10,
      difficulty: 'medium',
      provided_content: '',
    });
  };

  const getDifficultyConfig = (level) => {
    const configs = {
      easy: {
        color: '#00e676',
        icon: <Target className="w-6 h-6" />,
        title: 'Easy',
        subtitle: 'Basic concepts & fundamentals',
        rings: 1
      },
      medium: {
        color: '#4f6ef5',
        icon: <Target className="w-6 h-6" />,
        title: 'Medium',
        subtitle: 'Intermediate level questions',
        rings: 2
      },
      hard: {
        color: '#ff5252',
        icon: <Target className="w-6 h-6" />,
        title: 'Hard',
        subtitle: 'Advanced & challenging',
        rings: 3
      }
    };
    return configs[level];
  };

  // Success state rendering
  if (publishSuccess) {
    return (
      <div className="generate-success-page">
        {/* Confetti animation */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="confetti-emoji"
            style={{
              left: Math.random() * 100 + '%',
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          >
            {['🎉', '✨', '🎊', '⭐', '🚀', '🏆'][Math.floor(Math.random() * 6)]}
          </div>
        ))}

        <div className="success-card">
          <div className="success-icon">
            <CheckCircle2 className="w-20 h-20" />
          </div>

          <h2 className="success-title">Test Published!</h2>
          <p className="success-subtitle">Your test is live and students can now take it.</p>

          <div className="test-details-grid">
            <div className="detail-item">
              <div className="detail-label">TOPIC</div>
              <div className="detail-value">{generatedTest?.topic}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">QUESTIONS</div>
              <div className="detail-value">{generatedTest?.totalQuestions}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">DIFFICULTY</div>
              <div className="detail-value">{generatedTest?.difficulty}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">DURATION</div>
              <div className="detail-value">{generatedTest?.duration} min</div>
            </div>
          </div>

          <div className="test-code-box">
            <div className="code-label">SHARE THIS CODE</div>
            <div className="code-content">
              <code className="test-code">{generatedTest?.testCode || generatedTest?.testId}</code>
              <button type="button" onClick={handleCopyCode} className="copy-btn">
                {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="success-actions">
            <button onClick={handleCreateAnother} className="btn-primary">
              <Sparkles className="w-5 h-5" />
              Create Another Test
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="generate-test-container">
      {/* Hero Header */}
      <div className="hero-header">
        <div className="hero-content">
          <div className="hero-icon">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="hero-title">Generate New Test</h1>
          <p className="hero-subtitle">Create AI-powered MCQ tests in seconds</p>
        </div>

        {/* Quota Card */}
        {quotaData && (
          <div className={`quota-card ${quotaData.isPaid ? 'premium' : ''}`}>
            <div className="quota-icon">
              <Zap className="w-5 h-5" />
            </div>
            <div className="quota-info">
              {quotaData.isPaid ? (
                <>
                  <span className="quota-premium">
                    <Crown className="w-4 h-4" />
                    Unlimited
                  </span>
                </>
              ) : (
                <>
                  <span className="quota-text">
                    Tests used: {quotaData.limit - quotaData.remaining}/{quotaData.limit} • {quotaData.remaining} remaining
                  </span>
                  {quotaData.remaining <= 0 && (
                    <button 
                      onClick={() => navigate('/profile?tab=subscription')}
                      className="upgrade-badge"
                    >
                      <Crown className="w-3 h-3" />
                      Upgrade
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="generate-layout">
        {/* Left Column - Generation Wizard */}
        <div className="wizard-column">
          {/* Progress Stepper */}
          <div className="progress-stepper">
            {[
              { num: 1, icon: <BookOpen className="w-4 h-4" />, label: 'Topic' },
              { num: 2, icon: <FileText className="w-4 h-4" />, label: 'Content' },
              { num: 3, icon: <Settings2 className="w-4 h-4" />, label: 'Configure' },
              { num: 4, icon: <Sparkles className="w-4 h-4" />, label: 'Generate' }
            ].map((step, idx) => (
              <div key={step.num} className="step-group">
                <div className={`step-circle ${currentStep >= step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}>
                  {currentStep > step.num ? <Check className="w-4 h-4" /> : step.icon}
                </div>
                <span className="step-label">{step.label}</span>
                {idx < 3 && <div className={`step-line ${currentStep > step.num ? 'completed' : ''}`} />}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Limit Reached Banner */}
          {quotaData && !quotaData.isPaid && quotaData.remaining <= 0 && (
            <div className="limit-banner">
              <AlertCircle className="w-5 h-5" />
              <div className="limit-content">
                <p className="limit-title">Test Generation Limit Reached</p>
                <p className="limit-text">
                  You've reached your free limit of {quotaData.limit} tests. Upgrade to Premium for unlimited generation.
                </p>
              </div>
              <button onClick={() => navigate('/profile?tab=subscription')} className="limit-upgrade-btn">
                Upgrade
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="wizard-form">
            {/* Step 1: Topic Input */}
            <div className={`wizard-card ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="card-header">
                <Target className="w-5 h-5 text-accent" />
                <h3>What's your test topic?</h3>
              </div>

              <input
                type="text"
                value={formData.topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                placeholder="e.g., Database Management Systems"
                className="topic-input"
                disabled={generatedTest}
              />
              <div className="char-counter">{formData.topic.length} / 200</div>
              <p className="helper-text">Be specific for better questions</p>

              {/* Quick Topics */}
              {!formData.topic && (
                <div className="quick-topics">
                  <div className="quick-label">
                    <Zap className="w-4 h-4" />
                    <span>Quick starts</span>
                  </div>
                  <div className="topic-pills">
                    {quickTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleQuickTopic(topic)}
                        className="topic-pill"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Content Input */}
            {currentStep >= 2 && (
              <div className={`wizard-card fade-in ${currentStep >= 2 ? 'active' : ''}`}>
                <div className="card-header">
                  <FileText className="w-5 h-5 text-accent" />
                  <h3>Add study material</h3>
                  <span className="optional-badge">Optional</span>
                </div>

                <textarea
                  value={formData.provided_content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Paste your textbook excerpt, lecture notes, or study material here. AI will generate questions based on this content."
                  className="content-textarea"
                  rows="8"
                  disabled={generatedTest}
                />
                <div className="char-counter">{formData.provided_content.length} / 5000</div>
                <p className="helper-text">
                  <Lightbulb className="w-4 h-4" />
                  Minimum 150 characters for best results
                </p>
                
                {/* Skip Button */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="skip-content-btn"
                  disabled={generatedTest}
                >
                  Skip this step
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 3: Configuration */}
            {currentStep >= 3 && (
              <div className={`wizard-card fade-in ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="card-header">
                  <Settings2 className="w-5 h-5 text-accent" />
                  <h3>Test Configuration</h3>
                </div>

                {/* Number of Questions */}
                <div className="config-section">
                  <label className="config-label">
                    <BarChart3 className="w-4 h-4" />
                    Number of Questions
                  </label>
                  <div className="question-selector">
                    {[5, 10, 15, 20, 25].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleQuestionsSelect(num)}
                        className={`question-btn ${formData.numberOfQuestions === num ? 'active' : ''}`}
                        disabled={generatedTest}
                      >
                        {num}
                        {formData.numberOfQuestions === num && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Level */}
                <div className="config-section">
                  <label className="config-label">
                    <TrendingUp className="w-4 h-4" />
                    Difficulty Level
                  </label>
                  <div className="difficulty-selector">
                    {['easy', 'medium', 'hard'].map((level) => {
                      const config = getDifficultyConfig(level);
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleDifficultySelect(level)}
                          className={`difficulty-card ${formData.difficulty === level ? 'active' : ''}`}
                          style={{ '--difficulty-color': config.color }}
                          disabled={generatedTest}
                        >
                          <div className="difficulty-icon">{config.icon}</div>
                          <div className="difficulty-title">{config.title}</div>
                          <div className="difficulty-subtitle">{config.subtitle}</div>
                          {formData.difficulty === level && (
                            <div className="difficulty-check">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Generate Button */}
            {currentStep >= 4 && !generatedTest && (
              <div className="generate-section fade-in">
                <button
                  type="submit"
                  className="generate-btn"
                  disabled={showGenerationModal || (quotaData && !quotaData.isPaid && quotaData.remaining <= 0)}
                >
                  {showGenerationModal ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Test
                    </>
                  )}
                </button>

                <div className="optional-actions">
                  <button type="button" className="action-btn" disabled>
                    <Users className="w-4 h-4" />
                    Link to Classroom
                  </button>
                  <button type="button" className="action-btn" disabled>
                    <Clock className="w-4 h-4" />
                    Schedule for Later
                  </button>
                </div>
              </div>
            )}

            {/* Generated Test Success */}
            {generatedTest && (
              <div className="generated-card fade-in">
                <div className="generated-header">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                  <h3>Test Created Successfully!</h3>
                </div>

                <div className="test-code-display">
                  <span className="code-label">Test Code:</span>
                  <div className="code-box">
                    <code>{generatedTest.testCode || generatedTest.testId}</code>
                    <button type="button" onClick={handleCopyCode} className="copy-icon-btn">
                      {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="test-meta">
                  <div className="meta-item">
                    <span className="meta-label">Topic:</span>
                    <span className="meta-value">{generatedTest.topic}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Questions:</span>
                    <span className="meta-value">{generatedTest.totalQuestions}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Duration:</span>
                    <span className="meta-value">{generatedTest.duration} min</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Difficulty:</span>
                    <span className="meta-value">{generatedTest.difficulty}</span>
                  </div>
                </div>

                <div className="test-actions">
                  <button onClick={handlePublish} disabled={publishing} className="btn-publish">
                    {publishing ? 'Publishing...' : 'Publish Test'}
                  </button>
                  <button onClick={handleCreateAnother} className="btn-create-another">
                    Create Another
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Column - Guidance */}
        <div className="guidance-column">
          {/* How It Works */}
          <div className="guide-card">
            <div className="guide-header">
              <Sparkles className="w-5 h-5" />
              <h3>How it works</h3>
            </div>
            <div className="guide-steps">
              {[
                'Enter a topic you want to create a test about',
                'Choose number of questions and difficulty',
                'AI generates high-quality MCQ questions instantly',
                'Link to classroom to assign tests (optional)',
                'Publish & share the test code with students',
                'Track results on the leaderboard'
              ].map((step, idx) => (
                <div key={idx} className="guide-step">
                  <div className="guide-check">
                    <Check className="w-4 h-4" />
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tips */}
          <div className="guide-card">
            <div className="guide-header">
              <Lightbulb className="w-5 h-5" />
              <h3>Pro Tips</h3>
            </div>
            <div className="tips-list">
              {[
                'Be specific with topics for better questions',
                'Start with medium difficulty',
                'Link tests to classrooms for better tracking',
                'Save the test code for future reference',
                'Add study material for context-specific questions'
              ].map((tip, idx) => (
                <div key={idx} className="tip-item">
                  <ArrowRight className="w-4 h-4" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Quality Badge */}
          <div className="quality-card">
            <div className="quality-badge">
              <Sparkles className="w-4 h-4" />
              AI Powered
            </div>
            <div className="quality-meter">
              <div className="quality-circle">98%</div>
              <span className="quality-label">accuracy</span>
            </div>
            <p className="quality-text">
              Our AI generates exam-quality questions verified by educators
            </p>
            <div className="premium-badge">
              <Crown className="w-3 h-3" />
              Premium
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showGenerationModal && (
        <GenerationStatusModal
          topic={formData.topic}
          difficulty={formData.difficulty}
          numberOfQuestions={formData.numberOfQuestions}
          provided_content={formData.provided_content}
          isOpen={showGenerationModal}
          onClose={() => setShowGenerationModal(false)}
          onSuccess={handleGenerationSuccess}
        />
      )}

      {showClassroomModal && generatedTest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Assign to Classroom</h3>
              <button onClick={() => setShowClassroomModal(false)} className="modal-close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              {classrooms.length > 0 ? (
                <>
                  <p>Link this test to a classroom for better tracking:</p>
                  <select
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                    className="classroom-select"
                  >
                    <option value="">Select a classroom</option>
                    {classrooms.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  <div className="modal-actions">
                    <button onClick={handleLinkToClassroom} disabled={linkingClassroom || !selectedClassroom} className="btn-primary">
                      {linkingClassroom ? 'Linking...' : 'Link to Classroom'}
                    </button>
                    <button onClick={() => setShowClassroomModal(false)} className="btn-secondary">
                      Skip for Now
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>No classrooms found. Create one first!</p>
                  <button onClick={() => setShowClassroomModal(false)} className="btn-primary">
                    Got It
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateTest;
