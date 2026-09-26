import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Map, AlertTriangle, Package, Users,
  Bell, MessageSquare, BarChart3, Cpu, Globe, Settings,
  ShieldAlert, User, Volume2
} from 'lucide-react';
import { soundManager } from '../utils/audioAlert';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const NAV_SECTIONS = [
    {
      section: t('nav.operations', 'Operations'),
      items: [
        { to: '/',          icon: LayoutDashboard, label: t('nav.dashboard', 'Dashboard') },
        { to: '/map',       icon: Map,             label: t('nav.liveMap', 'Live Map') },
        { to: '/incidents', icon: AlertTriangle,   label: t('nav.incidents', 'Incidents'),   badge: 'live' },
        { to: '/sos',       icon: Bell,            label: t('nav.sos', 'SOS Reports'),       badge: 'urgent' },
      ],
    },
    {
      section: t('nav.management', 'Management'),
      items: [
        { to: '/resources',  icon: Package,       label: t('nav.resources', 'Resources') },
        { to: '/volunteers', icon: Users,         label: t('nav.volunteers', 'Volunteers') },
        { to: '/comms',      icon: MessageSquare, label: t('nav.comms', 'Communications') },
      ],
    },
    {
      section: t('nav.intelligence', 'Intelligence'),
      items: [
        { to: '/ai',        icon: Cpu,       label: t('nav.aiEngine', 'AI Engine') },
        { to: '/analytics', icon: BarChart3, label: t('nav.analytics', 'Analytics') },
        { to: '/external',  icon: Globe,     label: t('nav.liveFeeds', 'Live Feeds') },
      ],
    },
  ];

  const handleTestSiren = (e) => {
    e.stopPropagation();
    soundManager.playSiren(3);
    toast('🚨 Test Emergency Siren Broadcast Triggered!', {
      icon: '🚨',
      style: { background: '#ef4444', color: '#fff', fontWeight: 600 },
    });
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="logo-icon">
          <ShieldAlert size={20} color="#fff" />
        </div>
        <div className="logo-text">
          <span className="logo-title">ERIP India</span>
          <span className="logo-sub">Emergency Response</span>
        </div>
      </div>

      {/* Live status pulse & Quick Siren Trigger */}
      <div style={{
        margin: '8px 12px',
        padding: '7px 12px',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 11, color: '#f87171', fontWeight: 700,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#ef4444',
            boxShadow: '0 0 8px #ef4444',
            animation: 'pulse 2s infinite',
            flexShrink: 0,
          }} />
          {t('common.liveOperations', 'LIVE OPS ACTIVE')}
        </div>
        <button
          onClick={handleTestSiren}
          title="Broadcast Test Siren"
          style={{
            background: 'rgba(239,68,68,0.2)',
            border: 'none',
            borderRadius: 4,
            padding: '2px 5px',
            cursor: 'pointer',
            color: '#ef4444',
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 9, fontWeight: 700,
          }}
        >
          <Volume2 size={11} /> SIREN
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map(({ section, items }) => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {items.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => soundManager.playBeep(520, 0.04)}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={16} className="nav-icon" />
                <span style={{ flex: 1 }}>{label}</span>
                {badge === 'live' && (
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    background: 'rgba(6,182,212,0.15)',
                    color: '#06b6d4',
                    border: '1px solid rgba(6,182,212,0.3)',
                    borderRadius: 4,
                    padding: '1px 5px', letterSpacing: '0.5px',
                  }}>LIVE</span>
                )}
                {badge === 'urgent' && (
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    background: 'rgba(239,68,68,0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 4,
                    padding: '1px 5px', letterSpacing: '0.5px',
                  }}>SOS</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}

        <div style={{ marginTop: 4 }}>
          <div className="nav-section-label">{t('nav.system', 'System')}</div>
          <NavLink
            to="/profile"
            onClick={() => soundManager.playBeep(520, 0.04)}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <User size={16} className="nav-icon" />
            <span style={{ flex: 1 }}>{t('nav.profile', 'Profile')}</span>
          </NavLink>
          <NavLink
            to="/settings"
            onClick={() => soundManager.playBeep(520, 0.04)}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Settings size={16} className="nav-icon" />
            <span style={{ flex: 1 }}>{t('nav.settings', 'Settings')}</span>
          </NavLink>
        </div>
      </nav>

      {/* User Footer — Clerk UserButton & Profile Quicklink */}
      <div className="sidebar-footer">
        <div
          className="user-card"
          onClick={() => navigate('/profile')}
          title="View Commander Profile"
        >
          {isLoaded && user ? (
            <>
              <div onClick={(e) => e.stopPropagation()}>
                <UserButton
                  afterSignOutUrl="/sign-in"
                  appearance={{
                    elements: {
                      avatarBox: { width: 34, height: 34 },
                      userButtonPopoverCard: {
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      },
                    },
                  }}
                />
              </div>
              <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name" style={{ fontSize: 12, fontWeight: 600 }}>
                  {user.firstName || 'Commander'} {user.lastName || ''}
                </div>
                <div className="user-role" style={{
                  fontSize: 10, color: 'var(--text-muted)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.primaryEmailAddress?.emailAddress || 'Operational Command'}
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading…</div>
          )}
        </div>
      </div>
    </aside>
  );
}
