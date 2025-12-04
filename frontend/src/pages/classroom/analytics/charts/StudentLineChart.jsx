import React from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function StudentLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#111827" strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fill: '#9ca3af' }} />
        <YAxis tick={{ fill: '#9ca3af' }} />
        <Tooltip wrapperStyle={{ background: '#0b1220', borderRadius: 8 }} />
        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
