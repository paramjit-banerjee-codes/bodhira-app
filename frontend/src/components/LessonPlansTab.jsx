import { useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import LessonPlanCard from './LessonPlanCard';
import '../pages/GenerateTest.css';

export default function LessonPlansTab({ classroom }) {
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // TODO: Replace with API call
  // GET /api/classrooms/:id/lesson-plans
  const [lessonPlans] = useState([
    {
      id: 1,
      title: 'Understanding Closures',
      topic: 'JavaScript Closures',
      duration: 45,
      status: 'published',
      createdAt: '2024-10-15',
      sections: 5,
      estimatedStudents: 20
    },
    {
      id: 2,
      title: 'Async Programming Fundamentals',
      topic: 'Async/Await',
      duration: 60,
      status: 'published',
      createdAt: '2024-10-20',
      sections: 7,
      estimatedStudents: 18
    },
    {
      id: 3,
      title: 'Promise Resolution Patterns',
      topic: 'Promises',
      duration: 50,
      status: 'draft',
      createdAt: '2024-11-10',
      sections: 4,
      estimatedStudents: 0
    },
    {
      id: 4,
      title: 'Event Loop Visualization',
      topic: 'Event Loop',
      duration: 55,
      status: 'published',
      createdAt: '2024-10-25',
      sections: 6,
      estimatedStudents: 16
    }
  ]);

  const stats = {
    total: lessonPlans.length,
    published: lessonPlans.filter(p => p.status === 'published').length,
    draft: lessonPlans.filter(p => p.status === 'draft').length,
    totalStudents: lessonPlans.reduce((sum, p) => sum + p.estimatedStudents, 0)
  };

  return (
    <div className="generate-form-card card space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 rounded-xl p-5 transition-all">
          <div className="text-xs text-blue-300/70 font-bold uppercase tracking-wider">Total Plans</div>
          <div className="text-3xl font-bold text-blue-300 mt-2">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/50 rounded-xl p-5 transition-all">
          <div className="text-xs text-emerald-300/70 font-bold uppercase tracking-wider">Published</div>
          <div className="text-3xl font-bold text-emerald-300 mt-2">{stats.published}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 border border-yellow-500/30 hover:border-yellow-500/50 rounded-xl p-5 transition-all">
          <div className="text-xs text-yellow-300/70 font-bold uppercase tracking-wider">Draft</div>
          <div className="text-3xl font-bold text-yellow-300 mt-2">{stats.draft}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 border border-purple-500/30 hover:border-purple-500/50 rounded-xl p-5 transition-all">
          <div className="text-xs text-purple-300/70 font-bold uppercase tracking-wider">Total Students</div>
          <div className="text-3xl font-bold text-purple-300 mt-2">{stats.totalStudents}</div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={() => setShowGenerateModal(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 px-6 rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Generate New Lesson Plan with AI
      </button>
      {/* TODO: Open modal to generate lesson plan
          POST /api/classrooms/:id/generate-lesson-plan
          Uses Google Generative AI to create structured lesson plans */}

      {/* Lesson Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lessonPlans.map((plan) => (
          <LessonPlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {lessonPlans.length === 0 && (
        <div className="text-center py-12 bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl border border-slate-700/30">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No lesson plans yet</h3>
          <p className="text-slate-400 mb-6">Generate your first lesson plan to get started</p>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg shadow-blue-500/20 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Generate Lesson Plan
          </button>
        </div>
      )}

      {/* Generate Lesson Plan Modal */}
      {showGenerateModal && (
        <GenerateLessonPlanModal
          classroom={classroom}
          onClose={() => setShowGenerateModal(false)}
        />
      )}
    </div>
  );
}

function GenerateLessonPlanModal({ classroom, onClose }) {
  const [formData, setFormData] = useState({
    topic: '',
    duration: '45',
    difficulty: 'Intermediate',
    numberOfSections: '5'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = () => {
    // TODO: API call to generate lesson plan
    // POST /api/classrooms/:id/generate-lesson-plan
    // Body: { topic, duration, difficulty, numberOfSections }
    // This will use Google Generative AI to create the lesson plan
    console.log('Generating lesson plan:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-xl shadow-2xl max-w-md w-full border border-slate-700/50 backdrop-blur-xl">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-700/30 flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 via-blue-300 to-indigo-300 bg-clip-text text-transparent">Generate Lesson Plan</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Topic *
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., Advanced Closures in JavaScript"
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Duration (minutes) *
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Difficulty Level *
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Number of Sections */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Number of Sections *
            </label>
            <select
              name="numberOfSections"
              value={formData.numberOfSections}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="3">3 sections</option>
              <option value="4">4 sections</option>
              <option value="5">5 sections</option>
              <option value="6">6 sections</option>
              <option value="7">7 sections</option>
            </select>
          </div>

          {/* Info */}
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              AI will generate a structured lesson plan with learning objectives, content outlines, and assessment suggestions.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-800/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-700/30">
          <button
            onClick={onClose}
            className="px-6 py-2.5 font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-700/30 rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
