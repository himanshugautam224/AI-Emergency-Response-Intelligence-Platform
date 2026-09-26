import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Search, Wifi, Volume2, VolumeX, ShieldAlert,
  ChevronRight, ExternalLink, Check, AlertTriangle, User,
  Settings as SettingsIcon, X
} from 'lucide-react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import { soundManager } from '../utils/audioAlert';

const ROUTE_INFO = {
  '/':          { titleKey: 'dashboard.title', defaultTitle: 'Operations Dashboard', breadcrumbKey: 'dashboard.breadcrumb', defaultBreadcrumb: 'Operations / Dashboard' },
  '/map':       { titleKey: 'map.title',       defaultTitle: 'Live Incident Map',    breadcrumbKey: 'map.breadcrumb',       defaultBreadcrumb: 'Operations / Live Map' },
  '/incidents': { titleKey: 'incidents.title', defaultTitle: 'Incident Management',  breadcrumbKey: 'incidents.breadcrumb', defaultBreadcrumb: 'Operations / Incidents' },
  '/sos':       { titleKey: 'sos.title',        defaultTitle: 'Citizen SOS Reports',  breadcrumbKey: 'sos.breadcrumb',       defaultBreadcrumb: 'Operations / SOS Reports' },
  '/resources': { titleKey: 'resources.title',  defaultTitle: 'Resource Command',     breadcrumbKey: 'nav.resources',        defaultBreadcrumb: 'Management / Resources' },
  '/volunteers':{ titleKey: 'volunteers.title', defaultTitle: 'Volunteer Fleet',      breadcrumbKey: 'nav.volunteers',       defaultBreadcrumb: 'Management / Volunteers' },
  '/comms':     { titleKey: 'comms.title',      defaultTitle: 'Emergency Comms',      breadcrumbKey: 'nav.comms',            defaultBreadcrumb: 'Management / Communications' },
  '/ai':        { titleKey: 'ai.title',         defaultTitle: 'AI Emergency Engine',  breadcrumbKey: 'nav.aiEngine',         defaultBreadcrumb: 'Intelligence / AI Engine' },
  '/analytics': { titleKey: 'analytics.title',  defaultTitle: 'Disaster Analytics',   breadcrumbKey: 'nav.analytics',        defaultBreadcrumb: 'Intelligence / Analytics' },
  '/external':  { titleKey: 'feeds.title',      defaultTitle: 'Live Disaster Feeds',  breadcrumbKey: 'nav.liveFeeds',        defaultBreadcrumb: 'Intelligence / Live Feeds' },
  '/settings':  { titleKey: 'settings.title',   defaultTitle: 'System Settings',      breadcrumbKey: 'nav.settings',         defaultBreadcrumb: 'System / Settings' },
  '/profile':   { titleKey: 'profile.title',    defaultTitle: 'Commander Profile',    breadcrumbKey: 'nav.profile',          defaultBreadcrumb: 'System / Profile' },
};

const SAMPLE_NOTIFICATIONS = [
  { id: 1, title: 'Critical Alert: Flood Warning', desc: 'Brahmaputra river water level exceeded Danger Mark in Kamrup.', time: '4m ago', severe: true, route: '/incidents' },
  { id: 2, title: 'New Citizen SOS Broadcast', desc: '14 citizens trapped in landslide near Wayanad sector 4.', time: '12m ago', severe: true, route: '/sos' },
  { id: 3, title: 'Resource Deployed', desc: '3 NDRF motorized rescue rafts dispatched to Kendrapara.', time: '35m ago', severe: false, route: '/resources' },
  { id: 4, title: 'IMD Satellite Cyclone Update', desc: 'Deep depression in Bay of Bengal moving NW at 18 km/h.', time: '1h ago', severe: false, route: '/external' },
];

export default function Topbar({ title, breadcrumb, isLive = true }) {
  const { user } = useUser();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [isAudioMuted, setIsAudioMuted] = useState(soundManager.isMuted());
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const notifRef = useRef(null);
  const searchRef = useRef(null);

  const currentRouteMeta = ROUTE_INFO[location.pathname] || {
    defaultTitle: 'ERIP Operations',
    defaultBreadcrumb: 'Emergency Response Platform',
  };

  const displayTitle = title || t(currentRouteMeta.titleKey, currentRouteMeta.defaultTitle);
  const displayBreadcrumb = breadcrumb || t(currentRouteMeta.breadcrumbKey, currentRouteMeta.defaultBreadcrumb);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleAudio = () => {
    const nextMuted = !isAudioMuted;
    soundManager.setMuted(nextMuted);
    setIsAudioMuted(nextMuted);
    if (!nextMuted) {
      soundManager.playBeep(880, 0.1);
      toast.success('Audio Siren & Voice Alerts Enabled', { id: 'audio-toast' });
    } else {
      toast('Audio Alerts Muted', { icon: '🔇', id: 'audio-toast' });
    }
  };

  const handleNotificationClick = (item) => {
    setShowNotifications(false);
    navigate(item.route);
    soundManager.playBeep(600, 0.05);
  };

  const clearNotifications = () => {
    setNotifications([]);
    soundManager.playBeep(450, 0.06);
    toast.success('All notifications cleared');
  };

  const SEARCH_ITEMS = [
    { label: 'Operations Dashboard', route: '/', cat: 'Page' },
    { label: 'Live Incident Map & GPS Tracker', route: '/map', cat: 'Map' },
    { label: 'Active Incidents & Disaster Reports', route: '/incidents', cat: 'Incidents' },
    { label: 'Citizen SOS Rescue Broadcasts', route: '/sos', cat: 'Emergency' },
    { label: 'NDRF & SDRF Logistics & Resources', route: '/resources', cat: 'Resources' },
    { label: 'Volunteer Fleets & On-Ground Responders', route: '/volunteers', cat: 'Volunteers' },
    { label: 'Emergency Broadcasts & SMS Comms', route: '/comms', cat: 'Communications' },
    { label: 'AI Incident Severity Predictor', route: '/ai', cat: 'AI Engine' },
    { label: 'Disaster Frequency Analytics', route: '/analytics', cat: 'Analytics' },
    { label: 'Live USGS Earthquakes & IMD Radar Feeds', route: '/external', cat: 'Data Feeds' },
    { label: 'System & Emergency Audio Settings', route: '/settings', cat: 'Settings' },
    { label: 'Commander Profile & Credentials', route: '/profile', cat: 'Profile' },
  ];

  const searchResults = searchQuery.trim()
    ? SEARCH_ITEMS.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.cat.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{displayTitle}</span>
          </div>
          {displayBreadcrumb && <div className="page-breadcrumb">{displayBreadcrumb}</div>}
        </div>
      </div>

      <div className="topbar-right">
        {/* Live/Offline Status badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 11px', borderRadius: 20,
          background: isLive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${isLive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          fontSize: 11, fontWeight: 700,
          color: isLive ? '#22c55e' : '#ef4444',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isLive ? '#22c55e' : '#ef4444',
            boxShadow: isLive ? '0 0 8px #22c55e' : '0 0 8px #ef4444',
            animation: isLive ? 'pulse 2s infinite' : 'none',
          }} />
          {isLive ? t('common.live', 'LIVE') : t('common.offline', 'OFFLINE')}
        </div>

        {/* Audio Siren Mute / Unmute Button */}
        <button
          onClick={toggleAudio}
          className="interactive-hover-glow"
          title={isAudioMuted ? 'Unmute Emergency Siren' : 'Mute Emergency Siren'}
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: isAudioMuted ? 'var(--bg-elevated)' : 'rgba(239,68,68,0.15)',
            border: isAudioMuted ? '1px solid var(--border)' : '1px solid rgba(239,68,68,0.4)',
            color: isAudioMuted ? 'var(--text-muted)' : '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
        >
          {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Global Interactive Theme Toggle */}
        <ThemeToggle iconOnly />

        {/* Global Multilingual Selector */}
        <LanguageSelector />

        {/* Global Quick Search Bar */}
        <div ref={searchRef} style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 12px',
            transition: 'border-color 0.2s',
          }}>
            <Search size={13} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={t('common.search', 'Quick search...')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 12, width: 150,
              }}
            />
            {searchQuery && (
              <X
                size={12}
                color="var(--text-muted)"
                style={{ cursor: 'pointer' }}
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, boxShadow: 'var(--shadow-lg)',
              zIndex: 9999, minWidth: 260, overflow: 'hidden',
            }}>
              <div style={{ padding: '6px 10px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Quick Navigate
              </div>
              {searchResults.slice(0, 5).map((res) => (
                <div
                  key={res.route}
                  onClick={() => {
                    navigate(res.route);
                    setShowSearchDropdown(false);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '8px 12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderTop: '1px solid var(--border)',
                    fontSize: 12, color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 500 }}>{res.label}</span>
                  <span style={{ fontSize: 9, padding: '2px 5px', borderRadius: 4, background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
                    {res.cat}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell with Interactive Flyout */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(s => !s)}
            className="interactive-hover-glow"
            title="Notifications & Live Alerts"
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', color: 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            <Bell size={16} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 8, height: 8, borderRadius: '50%',
                background: '#ef4444', boxShadow: '0 0 6px #ef4444',
                animation: 'pulse 1.5s infinite',
              }} />
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 340, background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 12,
              boxShadow: 'var(--shadow-lg)', zIndex: 9999,
              overflow: 'hidden', backdropFilter: 'blur(24px)',
            }}>
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  <ShieldAlert size={15} color="#f97316" />
                  <span>Operations Alerts ({notifications.length})</span>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                    No pending emergency alerts
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      style={{
                        padding: '12px 16px', borderBottom: '1px solid var(--border)',
                        cursor: 'pointer', transition: 'background 0.15s',
                        background: item.severe ? 'rgba(239,68,68,0.04)' : 'transparent',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = item.severe ? 'rgba(239,68,68,0.04)' : 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: item.severe ? '#ef4444' : 'var(--text-primary)' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.time}</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {item.desc}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div style={{
                padding: '8px 12px', background: 'var(--bg-elevated)',
                borderTop: '1px solid var(--border)', textAlign: 'center',
              }}>
                <button
                  onClick={() => { setShowNotifications(false); navigate('/incidents'); }}
                  style={{
                    background: 'none', border: 'none',
                    color: '#f97316', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  View All Live Feeds &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Signed-in user chip with click action to Profile */}
        {user && (
          <div
            onClick={() => navigate('/profile')}
            className="interactive-hover-glow"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '3px 12px 3px 4px',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            title="Click to view Commander Profile"
          >
            {user.imageUrl ? (
              <img src={user.imageUrl} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} alt="" />
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg,#f97316,#ef4444)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff',
              }}>
                {(user.firstName?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              {user.firstName || 'Commander'}
            </span>
            <span style={{
              fontSize: 9, fontWeight: 800, color: '#f97316',
              background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)',
              borderRadius: 4, padding: '1px 6px', letterSpacing: '0.5px',
            }}>
              {t('common.admin', 'ADMIN')}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
