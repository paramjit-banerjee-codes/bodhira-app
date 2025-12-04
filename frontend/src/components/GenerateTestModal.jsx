import { useState } from 'react';
import { testAPI, classroomAPI } from '../services/api';
import '../pages/GenerateTest.css';

export default function GenerateTestModal({ onClose, onCreate, classroomId }) {
  const [formData, setFormData] = useState({
    topic: '',
    numberOfQuestions: 10,
    difficulty: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedTest, setGeneratedTest] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCopyCode = () => {
    const code = generatedTest?.testCode || generatedTest?.testId;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setGeneratedTest(null);
    setCopySuccess(false);

    try {
      console.log('Generating test:', formData);
      const response = await testAPI.generateTest(formData);
      
      let testData;
      if (response?.data?.data) {
        testData = response.data.data;
      } else if (response?.data) {
        testData = response.data;
      } else {
        testData = response;
      }
      
      console.log('Generated test:', testData);
      setGeneratedTest(testData);
    } catch (err) {
      console.error('Generation error:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.details ||
        'Failed to generate test. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToClassroom = async () => {
    if (!generatedTest || !classroomId) return;
    
    try {
      setLoading(true);
      // Call classroom API to create test linked to classroom
      const response = await classroomAPI.createClassroomTest(classroomId, {
        topic: generatedTest.topic,
        difficulty: generatedTest.difficulty,
        duration: generatedTest.duration,
        totalQuestions: generatedTest.totalQuestions,
        questions: generatedTest.questions,
      });
      
      const created = response?.data?.data;
      if (created) {
        onCreate(created);
        onClose();
      }
    } catch (err) {
      console.error('Failed to save test to classroom:', err);
      setError(err.response?.data?.error || 'Failed to save test to classroom');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setGeneratedTest(null);
    setFormData({
      topic: '',
      numberOfQuestions: 10,
      difficulty: 'medium',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="generate-form-card card w-full max-w-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">✨ Generate AI Test</h3>
          <button 
            onClick={onClose} 
            className="text-white text-2xl font-bold hover:text-slate-300 transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Test Topic *</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="Paste your topic or concept here"
              required
              disabled={loading || generatedTest}
            />
            <small>Enter any topic you want to create a test about</small>
          </div>

          <div className="input-group">
            <label>Number of Questions</label>
            <select
              name="numberOfQuestions"
              value={formData.numberOfQuestions}
              onChange={handleChange}
              disabled={loading || generatedTest}
            >
              <option value="5">5 Questions (Quick test)</option>
              <option value="10">10 Questions (Standard)</option>
              <option value="15">15 Questions (Comprehensive)</option>
              <option value="20">20 Questions (Extended)</option>
            </select>
          </div>

          <div className="input-group">
            <label>Difficulty Level</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              disabled={loading || generatedTest}
            >
              <option value="easy">Easy - Beginner friendly</option>
              <option value="medium">Medium - Intermediate level</option>
              <option value="hard">Hard - Advanced concepts</option>
            </select>
          </div>

          {error && (
            <div className="error-message">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          {generatedTest && (
            <div className="success-message">
              <strong>✅ Test Generated Successfully!</strong>
              <div className="test-code-display">
                <div className="test-code-label">Test Code:</div>
                <div className="test-code-value">
                  <code>{generatedTest.testCode || generatedTest.testId}</code>
                  <button 
                    type="button"
                    onClick={handleCopyCode}
                    className="btn-copy"
                    title="Copy test code"
                  >
                    {copySuccess ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>
              <div className="test-details">
                <p><strong>Topic:</strong> {generatedTest.topic}</p>
                <p><strong>Questions:</strong> {generatedTest.totalQuestions}</p>
                <p><strong>Duration:</strong> {generatedTest.duration} minutes</p>
                <p><strong>Difficulty:</strong> {generatedTest.difficulty}</p>
              </div>
            </div>
          )}

          {!generatedTest && (
            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Generating Test...
                </>
              ) : (
                '✨ Generate Test'
              )}
            </button>
          )}

          {generatedTest && (
            <div className="flex gap-3 mt-6">
              <button 
                type="button"
                onClick={handleCreateAnother}
                className="btn btn-secondary flex-1"
              >
                ➕ Create Another
              </button>
              <button 
                type="button"
                onClick={handleSaveToClassroom}
                className="btn btn-primary flex-1"
                disabled={loading}
              >
                {loading ? '⏳ Saving...' : '✓ Save to Classroom'}
              </button>
            </div>
          )}

          {!generatedTest && (
            <div className="flex gap-3 mt-6">
              <button 
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
