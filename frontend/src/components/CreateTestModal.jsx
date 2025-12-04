import { useState } from 'react';

export default function CreateTestModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    topic: '',
    difficulty: 'medium',
    duration: 15,
    totalQuestions: 1,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  });

  const [errors, setErrors] = useState(null);

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleQuestionChange = (idx, key, value) => {
    setForm((f) => {
      const q = [...f.questions];
      if (key === 'options') {
        q[idx].options = value;
      } else {
        q[idx][key] = value;
      }
      return { ...f, questions: q };
    });
  };

  const addQuestion = () => {
    setForm((f) => ({ ...f, questions: [...f.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }], totalQuestions: f.totalQuestions + 1 }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!form.topic.trim()) return setErrors('Topic is required');
    if (form.questions.some(q => !q.question.trim() || q.options.some(o => !o.trim()))) return setErrors('All questions and options must be filled');
    setErrors(null);
    onCreate(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Create Test</h3>
          <button onClick={onClose} className="text-white bg-transparent">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Topic</label>
            <input className="w-full p-3 rounded-lg input-group" value={form.topic} onChange={(e) => handleChange('topic', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Difficulty</label>
              <select className="w-full p-3 rounded-lg input-group" value={form.difficulty} onChange={(e) => handleChange('difficulty', e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Duration (min)</label>
              <input type="number" min={1} className="w-full p-3 rounded-lg input-group" value={form.duration} onChange={(e) => handleChange('duration', Number(e.target.value))} />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Questions</h4>
            {form.questions.map((q, i) => (
              <div key={i} className="mb-3 p-3 rounded-lg border border-gray-700">
                <input className="w-full p-2 mb-2 rounded input-group" placeholder={`Question ${i + 1}`} value={q.question} onChange={(e) => handleQuestionChange(i, 'question', e.target.value)} />
                {q.options.map((opt, oi) => (
                  <input key={oi} className="w-full p-2 mb-2 rounded input-group" placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => {
                    const newOptions = [...q.options];
                    newOptions[oi] = e.target.value;
                    handleQuestionChange(i, 'options', newOptions);
                  }} />
                ))}
                <div className="text-sm">Correct Answer: <select value={q.correctAnswer} onChange={(e) => handleQuestionChange(i, 'correctAnswer', Number(e.target.value))}>
                  {[0,1,2,3].map(n => <option key={n} value={n}>Option {n+1}</option>)}
                </select></div>
              </div>
            ))}
            <button onClick={addQuestion} className="btn btn-secondary">Add Question</button>
          </div>

          {errors && <div className="error-message">{errors}</div>}

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2">Cancel</button>
            <button onClick={handleSubmit} className="btn btn-primary">Create Test</button>
          </div>
        </div>
      </div>
    </div>
  );
}
