import { Eye, Check, MoreVertical } from 'lucide-react';

const statusColors = {
  published: { bg: 'bg-gradient-to-br from-slate-800/60 to-slate-900/40', border: 'border-emerald-500/30', text: 'text-emerald-200', badge: 'bg-emerald-600/30', borderL: 'border-l-emerald-500' },
  draft: { bg: 'bg-gradient-to-br from-slate-800/60 to-slate-900/40', border: 'border-yellow-500/30', text: 'text-yellow-200', badge: 'bg-yellow-600/30', borderL: 'border-l-yellow-500' }
};

export default function LessonPlanCard({ plan }) {
  const colors = statusColors[plan.status] || statusColors.draft;

  return (
    <div className={`rounded-xl shadow-lg p-6 border border-l-4 ${colors.bg} ${colors.border} ${colors.borderL} transition hover:shadow-xl hover:scale-105 group`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-white mb-1 group-hover:text-blue-200 transition-colors">{plan.title}</h3>
          <p className="text-sm text-slate-400">{plan.topic}</p>
        </div>
        <span className={`${colors.badge} ${colors.text} text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ml-2 border ${colors.border}`}>
          {plan.status === 'published' ? '✓' : '✎'} {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
        </span>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-slate-700/30">
        <div>
          <span className="text-xs text-slate-400 font-medium">Duration</span>
          <div className="font-semibold text-slate-200 mt-1">{plan.duration} <span className="text-xs text-slate-400">min</span></div>
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium">Sections</span>
          <div className="font-semibold text-slate-200 mt-1">{plan.sections}</div>
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium">Created</span>
          <div className="font-semibold text-slate-200 text-sm mt-1">{new Date(plan.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Students */}
      {plan.status === 'published' && (
        <div className="mb-4 pb-4 border-b border-slate-700/30">
          <span className="text-xs text-slate-400 font-medium">Students Enrolled</span>
          <div className="font-bold text-slate-200 mt-1">{plan.estimatedStudents}</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 font-semibold py-2 px-3 rounded-lg transition text-sm inline-flex items-center justify-center gap-1 border border-blue-500/30 hover:border-blue-500/50">
          <Eye className="w-4 h-4" />
          Preview
        </button>
        {/* TODO: Open lesson plan preview/editor
            GET /api/lesson-plans/:id */}

        {plan.status === 'draft' && (
          <button className="flex-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 font-semibold py-2 px-3 rounded-lg transition text-sm inline-flex items-center justify-center gap-1 border border-emerald-500/30 hover:border-emerald-500/50">
            <Check className="w-4 h-4" />
            Publish
          </button>
          /* TODO: Publish lesson plan
              PUT /api/lesson-plans/:id/publish */
        )}

        <button className="bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 font-semibold py-2 px-3 rounded-lg transition text-sm border border-slate-700/30 hover:border-slate-700/50">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
