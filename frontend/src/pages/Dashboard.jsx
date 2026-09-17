import React, { useEffect, useState } from 'react';
import Topbar from '../components/Topbar';
import {
  AlertTriangle, Users, Package, Clock,
  TrendingUp, TrendingDown, Activity, Zap,
  MapPin, Shield, Flame, Waves
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// ─── Mock data (replace with API calls) ─────────────────────
const KPI_DATA = [
  {
    label: 'Active Incidents',
    value: '47',
    icon: AlertTriangle,
    change: '+3',
    changeDir: 'up',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    accent: '#ef4444',
  },
  {
    label: 'People Affected',
    value: '1.2L',
    icon: Users,
    change: '+8.4K',
    changeDir: 'up',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
    accent: '#f97316',
  },
  {
    label: 'Resources Deployed',
    value: '328',
    icon: Package,
    change: '+24',
    changeDir: 'up',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    accent: '#06b6d4',
  },
  {
    label: 'Avg Response Time',
    value: '23 min',
    icon: Clock,
    change: '-4 min',
    changeDir: 'down',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    accent: '#22c55e',
  },
];

const TREND_DATA = [
  { time: '00:00', incidents: 12, sos: 5 },
  { time: '04:00', incidents: 8,  sos: 3 },
  { time: '08:00', incidents: 22, sos: 11 },
  { time: '12:00', incidents: 35, sos: 18 },
  { time: '16:00', incidents: 47, sos: 24 },
  { time: '20:00', incidents: 31, sos: 14 },
  { time: 'Now',   incidents: 47, sos: 9 },
];

const DISASTER_MIX = [
  { name: 'Flood',      value: 38, color: '#06b6d4' },
  { name: 'Wildfire',   value: 22, color: '#f97316' },
  { name: 'Earthquake', value: 15, color: '#8b5cf6' },
  { name: 'Cyclone',    value: 12, color: '#ef4444' },
  { name: 'Landslide',  value: 8,  color: '#22c55e' },
  { name: 'Other',      value: 5,  color: '#64748b' },
];

const LIVE_FEED = [
  { id: 1, type: 'red',    icon: '🆘', title: 'SOS — 43 people trapped, Assam', time: '2 min ago', state: 'Assam' },
  { id: 2, type: 'red',    icon: '🌊', title: 'Flash flood — Brahmaputra rising', time: '5 min ago', state: 'Assam' },
  { id: 3, type: 'orange', icon: '🔥', title: 'Wildfire spreading — Uttarakhand', time: '11 min ago', state: 'Uttarakhand' },
  { id: 4, type: 'orange', icon: '📦', title: 'Resource deployed — 500 food kits', time: '18 min ago', state: 'Odisha' },
  { id: 5, type: 'green',  icon: '✅', title: 'Incident resolved — Bihar Flood #31', time: '24 min ago', state: 'Bihar' },
  { id: 6, type: 'orange', icon: '👥', title: '12 volunteers assigned — NDRF team', time: '31 min ago', state: 'Kerala' },
];

const STATE_ALERTS = [
  { state: 'Assam',       level: 'red',    count: 14 },
  { state: 'Odisha',      level: 'red',    count: 9 },
  { state: 'Uttarakhand', level: 'orange', count: 7 },
  { state: 'Kerala',      level: 'orange', count: 6 },
  { state: 'Bihar',       level: 'orange', count: 5 },
  { state: 'Gujarat',     level: 'green',  count: 2 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: 12,
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="page-enter">
      <Topbar
        title="Command Dashboard"
        breadcrumb={`India Emergency Operations Center • ${time.toLocaleTimeString('en-IN')}`}
        isLive={true}
      />

      <div className="page-body">

        {/* ── Red Alert Banner ───────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.10))',
          border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 24,
          animation: 'pulse-border 3s infinite',
        }}>
          <div className="alert-dot red" />
          <Shield size={16} color="#fca5a5" />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#fca5a5' }}>
            ACTIVE ALERT: Severe floods reported across Assam &amp; Odisha — 14 districts on Red alert
          </span>
          <button className="btn btn-sm" style={{
            marginLeft: 'auto', background: 'rgba(239,68,68,0.2)',
            color: '#fca5a5', border: '1px solid rgba(239,68,68,0.4)',
          }}>
            View All →
          </button>
        </div>

        {/* ── KPI Cards ──────────────────────────────────── */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {KPI_DATA.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="stat-card" style={{ '--card-accent': kpi.accent }}>
                <div className="stat-icon" style={{ background: kpi.bg }}>
                  <Icon size={22} color={kpi.color} />
                </div>
                <div className="stat-body">
                  <div className="stat-value">{kpi.value}</div>
                  <div className="stat-label">{kpi.label}</div>
                  <div className={`stat-change ${kpi.changeDir === 'down' && kpi.label.includes('Time') ? 'up' : kpi.changeDir}`}>
                    {kpi.changeDir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {kpi.change} today
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main Grid ──────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20 }}>

          {/* Incident Trend Chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Incident Activity — Today</span>
              <div className="flex items-center gap-2">
                <span className="badge badge-red"><span className="alert-dot red" /> Incidents</span>
                <span className="badge badge-orange">SOS Reports</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="incidentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sosGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="incidents" name="Incidents" stroke="#ef4444" strokeWidth={2} fill="url(#incidentGrad)" />
                <Area type="monotone" dataKey="sos" name="SOS" stroke="#f97316" strokeWidth={2} fill="url(#sosGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Disaster Type Mix */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Disaster Types</span>
              <span className="text-sm text-muted">Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={DISASTER_MIX} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {DISASTER_MIX.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DISASTER_MIX.map((d) => (
                  <div key={d.name} className="flex items-center gap-2" style={{ fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Grid ─────────────────────────────────── */}
        <div className="grid-2">

          {/* Live Activity Feed */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Live Activity Feed</span>
              <div className="flex items-center gap-2">
                <span className="alert-dot red" />
                <span className="text-sm text-muted">Real-time</span>
              </div>
            </div>
            <div>
              {LIVE_FEED.map((item) => (
                <div key={item.id} className="feed-item">
                  <div className="feed-icon" style={{
                    background: item.type === 'red' ? 'rgba(239,68,68,0.12)' :
                                item.type === 'orange' ? 'rgba(249,115,22,0.12)' :
                                'rgba(34,197,94,0.12)',
                  }}>
                    {item.icon}
                  </div>
                  <div className="feed-body">
                    <div className="feed-title">{item.title}</div>
                    <div className="feed-meta">
                      <MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />
                      {item.state} • {item.time}
                    </div>
                  </div>
                  <span className={`badge badge-${item.type}`}>
                    <span className={`alert-dot ${item.type}`} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* State-wise Alert Status */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">State-wise Alert Status</span>
              <button className="btn btn-sm btn-ghost">View Map →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {STATE_ALERTS.map((s) => (
                <div key={s.state} className="flex items-center gap-3" style={{
                  padding: '10px 14px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}>
                  <span className={`alert-dot ${s.level}`} />
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {s.state}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {s.count} incidents
                  </span>
                  <span className={`badge badge-${s.level}`}>
                    {s.level.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            {/* AI Summary Box */}
            <div style={{
              marginTop: 16,
              padding: '12px 14px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.08))',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                <Zap size={13} color="#c4b5fd" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  AI Situation Summary
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                High flood risk persists in NE India. AI predicts 73% probability of escalation
                in Assam over next 24h. Recommend pre-positioning 200 food kits and 3 rescue
                boats in Guwahati district.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
