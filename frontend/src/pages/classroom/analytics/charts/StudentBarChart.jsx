import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StudentBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
        <XAxis dataKey="topic" tick={{ fill: '#9ca3af' }} />
        <YAxis tick={{ fill: '#9ca3af' }} />
        <Tooltip wrapperStyle={{ background: '#0b1220', borderRadius: 8 }} />
        <Bar dataKey="avg" fill="#10b981" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
