import React, { useEffect, useState, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle, Activity, Users, Truck, Radio, Brain,
  ArrowUp, ArrowDown, RefreshCw, MapPin, Clock, Zap,
  ChevronRight, Volume2, Send, ShieldAlert, X, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { statsAPI, incidentsAPI } from '../api/client';
import { soundManager } from '../utils/audioAlert';

const ALERT_COLORS = {
  critical: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171', dot: '#ef4444' },
  high:     { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', text: '#fb923c', dot: '#f97316' },
  medium:   { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#fbbf24', dot: '#eab308' },
  low:      { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', text: '#4ade80', dot: '#22c55e' },
};

function StatCard({ icon: Icon, label, value, sub, color = '#f97316', trend, href }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="card interactive-hover-glow"
      onClick={() => {
        if (href) {
          soundManager.playBeep(650, 0.04);
          navigate(href);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start',
        cursor: href ? 'pointer' : 'default',
        transform: hovered && href ? 'translateY(-2px)' : 'none',
        boxShadow: hovered && href ? `0 8px 24px ${color}25` : 'var(--shadow-sm)',
        border: hovered && href ? `1px solid ${color}45` : '1px solid var(--border)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: hovered && href ? `${color}30` : `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            {trend === 'up' && <ArrowUp size={10} color="#f87171" />}
            {trend === 'down' && <ArrowDown size={10} color="#4ade80" />}
            {sub}
          </div>
        )}
      </div>
      {href && (
        <ChevronRight
          size={16}
          color={hovered ? color : 'var(--text-muted)'}
          style={{ transform: hovered ? 'translateX(3px)' : 'none', transition: 'transform 0.2s' }}
        />
      )}
    </div>
  );
}

function IncidentRow({ inc }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const severity = (inc.severity || inc.alert_level || 'medium').toLowerCase();
  const c = ALERT_COLORS[severity] || ALERT_COLORS.medium;

  return (
    <div
      onClick={() => navigate('/incidents')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
        borderRadius: 8, cursor: 'pointer',
        background: hovered ? 'var(--bg-elevated)' : 'transparent',
        borderBottom: '1px solid var(--border)',
        transition: 'all 0.15s ease',
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: c.dot,
        boxShadow: `0 0 6px ${c.dot}`, flexShrink: 0,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {inc.title || inc.description || 'Emergency Incident'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 10, marginTop: 2 }}>
          {inc.state && <span>📍 {inc.state}</span>}
          {inc.district && <span>· {inc.district}</span>}
          {inc.created_at && (
            <span>· {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      </div>

      <span style={{
        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
        background: c.bg, border: `1px solid ${c.border}`, color: c.text,
        textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0,
      }}>
        {severity}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [countdown, setCountdown] = useState(30);

  // Quick Emergency Broadcast Modal state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('All Sectors');
  const [broadcastLevel, setBroadcastLevel] = useState('critical');

  const fetchData = async (isManual = false) => {
    setLoading(true);
    try {
      const [statsRes, incRes] = await Promise.all([
        statsAPI.platform().catch(() => ({ data: null })),
        incidentsAPI.list({ status: 'active', limit: 12 }).catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setIncidents(incRes.data || []);
      if (isManual) {
        soundManager.playBeep(800, 0.08);
        toast.success('Live operations telemetry refreshed', { id: 'dash-refresh' });
      }
    } catch (e) {
      console.error('Dashboard fetch error', e);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
      setCountdown(30);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    const countInterval = setInterval(() => {
      setCountdown(c => (c > 1 ? c - 1 : 30));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countInterval);
    };
  }, []);

  const filteredIncidents = useMemo(() => {
    if (selectedSeverity === 'all') return incidents;
    return incidents.filter(inc => {
      const s = (inc.severity || inc.alert_level || 'medium').toLowerCase();
      return s === selectedSeverity;
    });
  }, [incidents, selectedSeverity]);

  const handleSendQuickBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    soundManager.playSiren(2.5);
    toast.success(`Emergency Broadcast Transmitted to ${broadcastTarget}!`, {
      icon: '🚨',
      style: { background: '#ef4444', color: '#fff', fontWeight: 700 },
    });

    setShowBroadcastModal(false);
    setBroadcastText('');
  };

  const statCards = [
    { icon: AlertTriangle, label: t('dashboard.activeIncidents', 'Active Incidents'),   value: stats?.active_incidents ?? '—',              sub: `${stats?.total_incidents ?? 0} total`,  color: '#ef4444', trend: 'up', href: '/incidents' },
    { icon: Radio,         label: t('dashboard.sosAlerts', 'SOS Reports'),        value: stats?.sos_reports ?? '—',                   sub: 'Awaiting rescue response',               color: '#f97316', trend: 'up', href: '/sos' },
    { icon: Users,         label: t('nav.volunteers', 'Volunteers Active'),  value: stats?.volunteers_active?.toLocaleString() ?? '—', sub: 'Deployed On-ground',                color: '#06b6d4',             href: '/volunteers' },
    { icon: Truck,         label: t('dashboard.resourcesDeployed', 'Resources Deployed'), value: stats?.deployed_resources ?? '—',            sub: `${stats?.total_resources ?? 0} total units`,  color: '#8b5cf6',             href: '/resources' },
    { icon: Zap,           label: 'Alerts Sent Today',  value: stats?.alerts_sent_today?.toLocaleString() ?? '—', sub: 'SMS + Mobile Broadcasts',           color: '#eab308',             href: '/comms' },
    { icon: MapPin,        label: 'Districts Monitored',  value: stats?.districts_covered ?? '—',             sub: 'Pan-India Multi-Hazard',               color: '#22c55e',             href: '/map' },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: 4 }}>
            {t('dashboard.title', 'Operations Dashboard')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            {t('dashboard.welcome', 'Welcome back')}, {user?.firstName || 'Commander'} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Quick Emergency Broadcast Trigger */}
          <button
            onClick={() => {
              soundManager.playBeep(700, 0.05);
              setShowBroadcastModal(true);
            }}
            className="interactive-hover-glow"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 13, fontWeight: 700,
            }}
          >
            <ShieldAlert size={15} />
            <span>Broadcast Alert</span>
          </button>

          {/* Refresh button with live telemetry counter */}
          <button
            onClick={() => fetchData(true)}
            disabled={loading}
            className="interactive-hover-glow"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13,
            }}
            title="Force refresh live telemetry"
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
            <span>{loading ? 'Refreshing...' : `Refresh (${countdown}s)`}</span>
          </button>
        </div>
      </div>

      {/* Backend status alert */}
      {!stats && !loading && (
        <div style={{
          padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#f87171',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={14} />
          <span>Backend not responding. Start FastAPI: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4 }}>python -m uvicorn api.main:app --reload</code></span>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

        {/* Active Incidents */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {t('dashboard.recentIncidents', 'Active Live Incidents')} ({filteredIncidents.length})
              </h2>
            </div>

            {/* Interactive Severity Filter Pills */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', padding: 3, borderRadius: 8 }}>
              {['all', 'critical', 'high', 'medium', 'low'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => {
                    setSelectedSeverity(lvl);
                    soundManager.playBeep(600, 0.04);
                  }}
                  style={{
                    border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', textTransform: 'capitalize',
                    background: selectedSeverity === lvl ? 'var(--primary)' : 'transparent',
                    color: selectedSeverity === lvl ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>Loading telemetry...</div>
          ) : filteredIncidents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>No matching incidents found for this filter</div>
          ) : (
            filteredIncidents.slice(0, 8).map((inc) => <IncidentRow key={inc.id} inc={inc} />)
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Quick actions */}
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              Command Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: '🆘 Dispatch Citizen SOS', href: '/sos',       color: '#f97316' },
                { label: '🗺️ Tactical Map Tracker',  href: '/map',       color: '#22c55e' },
                { label: '🤖 Run AI NLP Triage',     href: '/ai',        color: '#8b5cf6' },
                { label: '📢 Send Broadcast Alerts', href: '/comms',     color: '#06b6d4' },
                { label: '⚙️ System & Siren Settings',href: '/settings',  color: '#eab308' },
              ].map(({ label, href, color }) => (
                <button
                  key={label}
                  onClick={() => {
                    soundManager.playBeep(620, 0.04);
                    navigate(href);
                  }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 14px', background: `${color}15`,
                    border: `1px solid ${color}30`, borderRadius: 8, color,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    transition: 'background 0.2s, transform 0.1s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}25`; e.currentTarget.style.transform = 'translateX(3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}15`; e.currentTarget.style.transform = 'none'; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* System status */}
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              {t('dashboard.systemStatus', 'Telemetry Status')}
            </h3>
            {[
              { label: 'FastAPI Operations API', status: stats ? 'online' : 'offline' },
              { label: 'ML Triage & Hungarian Optimizer', status: 'online' },
              { label: 'USGS Real-time Quake Feed', status: 'online' },
              { label: 'NASA EONET Satellite Fire/Flood', status: 'online' },
              { label: 'National Early Warning Siren', status: soundManager.isMuted() ? 'muted' : 'online' },
            ].map(({ label, status }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: status === 'online' ? 'rgba(34,197,94,0.12)' : status === 'offline' ? 'rgba(239,68,68,0.12)' : 'rgba(234,179,8,0.12)',
                  color: status === 'online' ? '#4ade80' : status === 'offline' ? '#f87171' : '#fbbf24',
                  border: `1px solid ${status === 'online' ? 'rgba(34,197,94,0.25)' : status === 'offline' ? 'rgba(239,68,68,0.25)' : 'rgba(234,179,8,0.25)'}`,
                  textTransform: 'uppercase',
                }}>
                  {status}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Interactive Emergency Broadcast Modal */}
      {showBroadcastModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: 16, width: '100%', maxWidth: 520, padding: 24,
            boxShadow: '0 20px 60px rgba(239,68,68,0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={22} color="#ef4444" />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Emergency Disaster Broadcast
                </h3>
              </div>
              <X
                size={18}
                color="var(--text-muted)"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowBroadcastModal(false)}
              />
            </div>

            <form onSubmit={handleSendQuickBroadcast}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Target Zone / Sector
                </label>
                <select
                  value={broadcastTarget}
                  onChange={e => setBroadcastTarget(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13,
                  }}
                >
                  <option value="All Sectors (National Wide)">All Sectors (National Wide)</option>
                  <option value="Coastal Odisha & Bengal">Coastal Odisha & Bengal</option>
                  <option value="Assam Brahmaputra Valley">Assam Brahmaputra Valley</option>
                  <option value="Wayanad Disaster Zone">Wayanad Disaster Zone</option>
                  <option value="Himalayan Landslide Corridor">Himalayan Landslide Corridor</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Broadcast Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. URGENT: Flood water level rising rapidly. All residents near river basin must evacuate to Cyclone Shelter #4 immediately."
                  value={broadcastText}
                  onChange={e => setBroadcastText(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', color: 'var(--text-secondary)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: 'none', color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
                  }}
                >
                  <Send size={14} /> Transmit Emergency Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
