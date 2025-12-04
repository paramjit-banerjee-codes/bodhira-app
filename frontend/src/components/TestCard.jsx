import { Eye, Play, BarChart3 } from 'lucide-react';

const statusColors = {
  published: { bg: 'bg-gradient-to-br from-slate-800/60 to-slate-900/40', border: 'border-emerald-500/20', text: 'text-emerald-300', badge: 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/30', borderL: 'border-l-emerald-500', hoverBorder: 'hover:border-emerald-500/40', shadowColor: 'hover:shadow-emerald-500/10' },
  draft: { bg: 'bg-gradient-to-br from-slate-800/60 to-slate-900/40', border: 'border-yellow-500/20', text: 'text-yellow-300', badge: 'bg-gradient-to-r from-yellow-600/30 to-yellow-500/30', borderL: 'border-l-yellow-500', hoverBorder: 'hover:border-yellow-500/40', shadowColor: 'hover:shadow-yellow-500/10' },
  archived: { bg: 'bg-gradient-to-br from-slate-800/40 to-slate-900/20', border: 'border-slate-700/30', text: 'text-slate-400', badge: 'bg-slate-700/30', borderL: 'border-l-slate-600', hoverBorder: 'hover:border-slate-700/50', shadowColor: 'hover:shadow-slate-500/10' }
};

export default function TestCard({ test }) {
  if (!test) return null;

  const colors = statusColors[test.status] || statusColors.draft;

  return (
    <div className={`rounded-xl shadow-lg p-6 border border-l-4 ${colors.bg} ${colors.border} ${colors.borderL} ${colors.hoverBorder} transition-all hover:shadow-2xl hover:scale-105 group ${colors.shadowColor}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-white mb-1 group-hover:text-blue-200 transition-colors">{test.title}</h3>
          <p className="text-sm text-slate-400">{test.topic}</p>
        </div>
        <span className={`${colors.badge} ${colors.text} text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap ml-2 border ${
          test.status === 'published' ? 'border-emerald-500/30' : test.status === 'draft' ? 'border-yellow-500/30' : 'border-slate-600/30'
        } transition-all group-hover:scale-110`}>
          {test.status === 'published' ? '✓' : test.status === 'draft' ? '✎' : '✕'} {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
        </span>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-slate-700/30">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Difficulty</span>
          <div className="font-bold text-slate-200 mt-1">
            <span className={`text-sm font-black px-2 py-1 rounded ${
              test.difficulty === 'easy' ? 'bg-emerald-600/30 text-emerald-300' :
              test.difficulty === 'medium' ? 'bg-orange-600/30 text-orange-300' :
              'bg-red-600/30 text-red-300'
            }`}>
              {test.difficulty}
            </span>
          </div>
        </div>
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Duration</span>
          <div className="font-bold text-slate-200 mt-1">{test.duration} <span className="text-xs text-slate-400">min</span></div>
        </div>
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Questions</span>
          <div className="font-bold text-blue-300 text-lg mt-1">{test.totalQuestions}</div>
        </div>
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Test Code</span>
          <div className="font-mono font-bold text-indigo-300 text-sm mt-1 bg-slate-900/50 px-2 py-1 rounded border border-indigo-500/30">{test.testCode}</div>
        </div>
      </div>

      {/* Stats */}
      {test.status === 'published' && (
        <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-slate-700/30">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Submissions</span>
            <div className="font-bold text-emerald-300 text-2xl mt-1">{test.submissions}</div>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Avg Score</span>
            <div className="font-bold text-emerald-400 text-2xl mt-1">{test.avgScore}%</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 bg-gradient-to-r from-blue-600/30 to-blue-500/20 hover:from-blue-600/50 hover:to-blue-500/40 text-blue-300 font-bold py-2 px-3 rounded-lg transition-all text-sm inline-flex items-center justify-center gap-2 border border-blue-500/30 hover:border-blue-500/60 transform hover:scale-105">
          <Eye className="w-4 h-4" />
          View
        </button>
        {/* TODO: Navigate to test details page
            GET /api/tests/:id */}

        {test.status === 'draft' && (
          <button className="flex-1 bg-gradient-to-r from-emerald-600/30 to-emerald-500/20 hover:from-emerald-600/50 hover:to-emerald-500/40 text-emerald-300 font-bold py-2 px-3 rounded-lg transition-all text-sm inline-flex items-center justify-center gap-2 border border-emerald-500/30 hover:border-emerald-500/60 transform hover:scale-105">
            <Play className="w-4 h-4" />
            Publish
          </button>
          /* TODO: Publish test
              PUT /api/tests/:id/publish */
        )}

        {test.status === 'published' && (
          <button className="flex-1 bg-gradient-to-r from-purple-600/30 to-purple-500/20 hover:from-purple-600/50 hover:to-purple-500/40 text-purple-300 font-bold py-2 px-3 rounded-lg transition-all text-sm inline-flex items-center justify-center gap-2 border border-purple-500/30 hover:border-purple-500/60 transform hover:scale-105">
            <BarChart3 className="w-4 h-4" />
            Results
          </button>
          /* TODO: Navigate to test results
              GET /api/tests/:id/results */
        )}

        <button className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-3 rounded-lg transition text-sm">
          ⋯
        </button>
      </div>
    </div>
  );
}
