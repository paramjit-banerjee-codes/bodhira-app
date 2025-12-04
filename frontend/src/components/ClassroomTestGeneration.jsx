import { useState } from 'react';
import { X } from 'lucide-react';
import { testAPI, classroomAPI } from '../services/api';
// import GenerationStatusModal from './GenerationStatusModal';
import toast from '../utils/toast';
import '../pages/GenerateTest.css';

export default function ClassroomTestGeneration({ classroom, onClose, onTestCreated }) {
  const [step, setStep] = useState('mode'); // mode | aiForm | manualForm | preview
  const [mode, setMode] = useState(null); // 'ai' | 'manual'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [test, setTest] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  // AI Form state
  const [aiForm, setAiForm] = useState({
    topic: '',
    numberOfQuestions: 10,
    difficulty: 'medium',
  });

  // Manual Form state
  const [manualForm, setManualForm] = useState({
    title: '',
    topic: '',
    difficulty: 'medium',
    duration: 30,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  });

  const handleAiFormChange = (e) => {
    const { name, value } = e.target;
    setAiForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleManualFormChange = (field, value) => {
    setManualForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleQuestionChange = (idx, key, value) => {
    setManualForm(prev => {
      const questions = [...prev.questions];
      if (key === 'options') {
        questions[idx].options = value;
      } else {
        questions[idx][key] = value;
      }
      return { ...prev, questions };
    });
    setError('');
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setManualForm(prev => {
      const questions = [...prev.questions];
      questions[qIdx].options[oIdx] = value;
      return { ...prev, questions };
    });
    setError('');
  };

  const addQuestion = () => {
    setManualForm(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    }));
  };

  const removeQuestion = (idx) => {
    if (manualForm.questions.length > 1) {
      setManualForm(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== idx)
      }));
    }
  };

  const handleGenerateAI = async () => {
    if (!aiForm.topic.trim()) {
      setError('Please enter a test topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call new async generation endpoint from classroom context
      const response = await classroomAPI.generateClassroomTest(
        classroom._id || classroom.id,
        aiForm
      );
      
      // The endpoint should return the test data in response.data.data or response.data
      const testData = response?.data?.data || response?.data;
      
      // Attach classroom info
      const testWithClassroom = {
        ...testData,
        classroomId: classroom._id || classroom.id
      };
      
      setTest(testWithClassroom);
      setStep('preview');
      toast.success('Test generated successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to generate test';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManual = () => {
    if (!manualForm.title.trim()) {
      setError('Please enter a test title');
      return;
    }
    if (manualForm.questions.some(q => !q.question.trim() || q.options.some(o => !o.trim()))) {
      setError('All questions and options must be filled');
      return;
    }

    const testData = {
      ...manualForm,
      classroomId: classroom._id || classroom.id,
      topic: manualForm.topic || manualForm.title,
      totalQuestions: manualForm.questions.length,
      testCode: `MAN-${Date.now()}`
    };

    setTest(testData);
    setStep('preview');
    setError('');
  };

  const handleSaveToDraft = async () => {
    if (!test) return;

    setLoading(true);
    try {
      // Post to classroom tests
      const response = await classroomAPI.createClassroomTest(
        classroom._id || classroom.id,
        {
          ...test,
          status: 'draft',
          isPublished: false
        }
      );

      const savedTest = response?.data?.data || response?.data;
      toast.success('Test saved as draft!');
      if (onTestCreated) onTestCreated(savedTest);
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save test';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!test) return;

    setLoading(true);
    try {
      // Post to classroom tests as published
      const response = await classroomAPI.createClassroomTest(
        classroom._id || classroom.id,
        {
          ...test,
          status: 'published',
          isPublished: true
        }
      );

      const savedTest = response?.data?.data || response?.data;
      toast.success('Test published! Students can now take it.');
      if (onTestCreated) onTestCreated(savedTest);
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to publish test';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (step === 'preview') {
      setTest(null);
      setStep('mode');
      setMode(null);
    } else if (step !== 'mode') {
      setStep('mode');
      setMode(null);
    } else {
      onClose();
    }
  };

  // ===== RENDER: Mode Selection =====
  if (step === 'mode') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-700 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Create New Test</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <p className="text-slate-300 mb-8">Choose how you want to create this test:</p>

          <div className="grid grid-cols-2 gap-6">
            {/* AI Generation Option */}
            <div
              onClick={() => { setMode('ai'); setStep('aiForm'); }}
              className="cursor-pointer p-6 bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-lg hover:border-blue-500 transition-all hover:shadow-lg"
            >
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-bold text-white mb-2">AI Generated</h3>
              <p className="text-slate-300 text-sm">
                Instantly create questions using AI. Fast and easy.
              </p>
            </div>

            {/* Manual Creation Option */}
            <div
              onClick={() => { setMode('manual'); setStep('manualForm'); }}
              className="cursor-pointer p-6 bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-lg hover:border-purple-500 transition-all hover:shadow-lg"
            >
              <div className="text-4xl mb-4">✏️</div>
              <h3 className="text-lg font-bold text-white mb-2">Manual Creation</h3>
              <p className="text-slate-300 text-sm">
                Create and customize every question yourself.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: AI Form =====
  if (step === 'aiForm') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-700 p-8 my-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">AI Test Generation</h2>
            <button onClick={handleCancel} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleGenerateAI(); }}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Test Topic *
                </label>
                <input
                  type="text"
                  name="topic"
                  value={aiForm.topic}
                  onChange={handleAiFormChange}
                  placeholder="Paste your topic or concept here"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  required
                />
                <small className="text-slate-400 mt-1 block">Enter any topic you want to test on</small>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Number of Questions
                  </label>
                  <select
                    name="numberOfQuestions"
                    value={aiForm.numberOfQuestions}
                    onChange={handleAiFormChange}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="5">5 Questions</option>
                    <option value="10">10 Questions</option>
                    <option value="15">15 Questions</option>
                    <option value="20">20 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty"
                    value={aiForm.difficulty}
                    onChange={handleAiFormChange}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? '⏳ Generating...' : '✨ Generate Test'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ===== RENDER: Manual Form =====
  if (step === 'manualForm') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full border border-slate-700 p-8 my-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Create Test Manually</h2>
            <button onClick={handleCancel} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
            {/* Test Details */}
            <div className="bg-slate-700/50 p-5 rounded-lg border border-slate-600">
              <h3 className="font-semibold text-white mb-4">Test Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Test Title *"
                  value={manualForm.title}
                  onChange={(e) => handleManualFormChange('title', e.target.value)}
                  className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Topic (optional)"
                  value={manualForm.topic}
                  onChange={(e) => handleManualFormChange('topic', e.target.value)}
                  className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={manualForm.difficulty}
                  onChange={(e) => handleManualFormChange('difficulty', e.target.value)}
                  className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <input
                  type="number"
                  placeholder="Duration (min)"
                  value={manualForm.duration}
                  onChange={(e) => handleManualFormChange('duration', parseInt(e.target.value))}
                  className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Questions */}
            {manualForm.questions.map((question, qIdx) => (
              <div key={qIdx} className="bg-slate-700/50 p-5 rounded-lg border border-slate-600">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-white">Question {qIdx + 1}</h4>
                  {manualForm.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <textarea
                  placeholder="Enter question text *"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none mb-3"
                  rows="2"
                />

                <div className="space-y-2">
                  {question.options.map((option, oIdx) => (
                    <div key={oIdx} className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={question.correctAnswer === oIdx}
                        onChange={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                        className="w-4 h-4"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${oIdx + 1} *`}
                        value={option}
                        onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              ➕ Add Question
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateManual}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
            >
              ✅ Preview Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER: Preview =====
  if (step === 'preview' && test) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full border border-slate-700 p-8 my-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Test Preview</h2>
            <button onClick={handleCancel} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Test Summary */}
          <div className="bg-slate-700/50 p-5 rounded-lg border border-slate-600 mb-6">
            <h3 className="text-xl font-bold text-white mb-3">{test.title || test.topic}</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Questions:</span>
                <p className="text-white font-semibold">{test.questions?.length || test.totalQuestions || 0}</p>
              </div>
              <div>
                <span className="text-slate-400">Difficulty:</span>
                <p className="text-white font-semibold capitalize">{test.difficulty}</p>
              </div>
              <div>
                <span className="text-slate-400">Duration:</span>
                <p className="text-white font-semibold">{test.duration || 30} min</p>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <p className="text-white font-semibold">Draft</p>
              </div>
            </div>
          </div>

          {/* Toggle Show Answers */}
          <div className="mb-6 flex items-center gap-2">
            <input
              type="checkbox"
              id="showAnswers"
              checked={showAnswers}
              onChange={(e) => setShowAnswers(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="showAnswers" className="text-slate-300">Show correct answers</label>
          </div>

          {/* Questions Preview */}
          <div className="space-y-5 max-h-96 overflow-y-auto pr-2 mb-6">
            {(test.questions || []).map((q, qIdx) => (
              <div key={qIdx} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <p className="font-semibold text-white mb-3">
                  Q{qIdx + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {(q.options || []).map((option, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded border ${
                        showAnswers && q.correctAnswer === oIdx
                          ? 'bg-green-500/20 border-green-500/50'
                          : 'bg-slate-600/50 border-slate-600'
                      }`}
                    >
                      <span className="text-slate-300">
                        {String.fromCharCode(65 + oIdx)}) {option}
                      </span>
                      {showAnswers && q.correctAnswer === oIdx && (
                        <span className="ml-2 text-green-400 text-sm">✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm mb-6">
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
              disabled={loading}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSaveToDraft}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '⏳ Saving...' : '💾 Save as Draft'}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '⏳ Publishing...' : '🎉 Publish'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
