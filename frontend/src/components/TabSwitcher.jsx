export default function TabSwitcher({ tabs, activeTab, onTabChange }) {
  return (
    <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/40 rounded-xl shadow-lg overflow-hidden border border-slate-700/30 backdrop-blur-sm">
      <div className="flex overflow-x-auto border-b border-slate-700/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-6 py-4 font-bold whitespace-nowrap transition-all duration-300 flex items-center justify-center gap-2 border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-300 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
