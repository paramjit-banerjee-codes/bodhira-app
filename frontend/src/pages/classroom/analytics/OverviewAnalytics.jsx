import { useEffect, useState, useMemo } from 'react';
import api from '../../../services/api';
import '../../../pages/GenerateTest.css';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

function MetricCard({ label, value }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl shadow-lg p-6 border border-slate-700/30">
      <div className="text-sm text-slate-400 uppercase tracking-wider mb-2">{label}</div>
      <div className="text-3xl font-extrabold text-white">{value}</div>
    </div>
  );
}

function ScoreBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="label" tick={{ fill: '#9ca3af' }} />
        <YAxis tick={{ fill: '#9ca3af' }} />
        <Tooltip wrapperStyle={{ background: '#0b1220', borderRadius: 8 }} />
        <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ScoreLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#111827" strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fill: '#9ca3af' }} />
        <YAxis tick={{ fill: '#9ca3af' }} />
        <Tooltip wrapperStyle={{ background: '#0b1220', borderRadius: 8 }} />
        <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-6 animate-pulse">
      <div className="h-6 bg-slate-700 rounded mb-4" style={{ width: '40%' }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-slate-700 rounded mb-3" />
      ))}
    </div>
  );
}

export default function OverviewAnalytics({ classroom }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!classroom) return;
      setLoading(true);
      setError(null);
      try {
        const classroomId = classroom.id || classroom._id;
        const resp = await api.get(`/classrooms/${classroomId}/analytics/overview`);
        if (!mounted) return;
        setData(resp?.data?.data || resp?.data || null);
      } catch (err) {
        console.error('OverviewAnalytics.load error', err);
        setError(err.response?.data?.error || err.message || 'Failed to load analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [classroom]);

  const distributionData = useMemo(() => {
    if (!data?.distribution) return [];
    return data.distribution.map((d) => ({ label: d.label, count: d.count }));
  }, [data]);

  const trendData = useMemo(() => data?.performanceTrend || [], [data]);

  return (
    <div className="generate-content" style={{ gridTemplateColumns: '1fr', gap: 20 }}>
      <div className="generate-form-card card" style={{ padding: 20 }}>
        <div className="generate-header" style={{ textAlign: 'left', marginBottom: 12 }}>
          <h2 style={{ fontSize: 22 }}>Classroom Analytics — Overview</h2>
          <p style={{ color: '#94a3b8' }}>High level performance metrics and trends</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SkeletonCard lines={6} />
              <SkeletonCard lines={6} />
            </div>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard label="Average" value={`${data.avgScore}%`} />
              <MetricCard label="Median" value={`${data.medianScore}%`} />
              <MetricCard label="Min" value={`${data.minScore}%`} />
              <MetricCard label="Max" value={`${data.maxScore}%`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl shadow-lg p-5 border border-slate-700/30">
                <h4 className="text-lg font-semibold text-white mb-3">Score Distribution</h4>
                <ScoreBarChart data={distributionData} />
              </div>

              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl shadow-lg p-5 border border-slate-700/30">
                <h4 className="text-lg font-semibold text-white mb-3">Performance Trend</h4>
                <ScoreLineChart data={trendData} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-xl shadow-lg p-5 border border-slate-700/30">
              <h4 className="text-lg font-semibold text-white mb-4">Topic Performance</h4>
              <div className="space-y-4">
                {(data.topicStats || []).map((t, idx) => (
                  <div key={idx} className="pb-4 border-b border-slate-700/30 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-slate-200">{t.topic}</div>
                      <div className="text-sm text-slate-400 font-medium">Avg: {t.avgScore}%</div>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-3 border border-slate-700/50">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg"
                        style={{ width: `${t.avgScore}%` }}
                      />
                    </div>
                  </div>
                ))}
                {(!data.topicStats || data.topicStats.length === 0) && (
                  <div className="text-slate-400">No topic data available</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
