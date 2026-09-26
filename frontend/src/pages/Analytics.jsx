import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const MONTHLY_INCIDENTS = [
  { month: 'Jan', count: 18, deaths: 4 },
  { month: 'Feb', count: 12, deaths: 2 },
  { month: 'Mar', count: 24, deaths: 6 },
  { month: 'Apr', count: 32, deaths: 11 },
  { month: 'May', count: 48, deaths: 19 },
  { month: 'Jun', count: 76, deaths: 35 },
  { month: 'Jul', count: 112, deaths: 54 },
  { month: 'Aug', count: 98, deaths: 42 },
  { month: 'Sep', count: 64, deaths: 23 },
];

const STATE_VULNERABILITY = [
  { state: 'Odisha', score: 88, color: '#ef4444' },
  { state: 'Assam', score: 84, color: '#ef4444' },
  { state: 'Kerala', score: 79, color: '#f97316' },
  { state: 'Uttarakhand', score: 76, color: '#f97316' },
  { state: 'Maharashtra', score: 71, color: '#f97316' },
  { state: 'Himachal', score: 68, color: '#06b6d4' },
  { state: 'Gujarat', score: 62, color: '#06b6d4' },
];

export default function Analytics() {
  return (
    <div className="page-wrapper">

      {/* Top Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Historical Disaster Frequency (2024 Monsoon Season)</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_INCIDENTS}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                <Area type="monotone" dataKey="count" stroke="#f97316" fillOpacity={1} fill="url(#colorInc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>State Vulnerability Index</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STATE_VULNERABILITY.map((s) => (
              <div key={s.state}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>{s.state}</span>
                  <strong style={{ color: s.color }}>{s.score}/100</strong>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${s.score}%`, height: '100%', background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
