import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Volume2, VolumeX, Moon, Sun, Globe, Radio, Shield,
  Bell, MapPin, Sliders, Database, Check, RefreshCw,
  Play, Sparkles, Navigation, Layers, Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeStore } from '../store/theme';
import { soundManager } from '../utils/audioAlert';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { useGeolocation } from '../hooks/useGeolocation';

const AGENCIES = [
  { id: 'ndrf', name: 'National Disaster Response Force (NDRF)', badge: 'Central HQ', color: '#f97316' },
  { id: 'sdrf', name: 'State Disaster Response Force (SDRF)', badge: 'State Unit', color: '#06b6d4' },
  { id: 'fire', name: 'Fire & Emergency Rescue Services', badge: 'Tactical', color: '#ef4444' },
  { id: 'iaf',  name: 'Indian Air Force Disaster Relief Wing', badge: 'Air Support', color: '#8b5cf6' },
  { id: 'med',  name: 'Indian Red Cross & Emergency Medical Corps', badge: 'Medical', color: '#22c55e' },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const geo = useGeolocation();

  const [audioMuted, setAudioMuted] = useState(soundManager.isMuted());
  const [audioVolume, setAudioVolume] = useState(soundManager.volume);
  const [sirenActive, setSirenActive] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(localStorage.getItem('erip_agency') || 'ndrf');
  const [alertThreshold, setAlertThreshold] = useState(localStorage.getItem('erip_threshold') || 'medium');
  const [responseRadius, setResponseRadius] = useState(localStorage.getItem('erip_radius') || '25');
  const [mapDefault, setMapDefault] = useState(localStorage.getItem('erip_map_default') || 'dark');
  const [activeTab, setActiveTab] = useState('general');

  const currentLang = SUPPORTED_LANGUAGES.find(
    l => l.code === i18n.language || i18n.language?.startsWith(l.code)
  ) || SUPPORTED_LANGUAGES[0];

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setAudioVolume(val);
    soundManager.setVolume(val);
  };

  const handleToggleMute = () => {
    const next = !audioMuted;
    setAudioMuted(next);
    soundManager.setMuted(next);
    if (!next) {
      soundManager.playBeep(880, 0.1);
      toast.success('Audio Alerts Enabled');
    } else {
      toast('Audio Alerts Muted', { icon: '🔇' });
    }
  };

  const testSirenSound = () => {
    setSirenActive(true);
    soundManager.playSiren(3.5);
    toast('🚨 Playing Emergency Warning Siren (3.5s)', { icon: '🔊' });
    setTimeout(() => setSirenActive(false), 3600);
  };

  const testSonarSound = () => {
    soundManager.playSonarPing();
    toast.success('Radar Sonar Ping Generated');
  };

  const testVoiceAlert = () => {
    soundManager.speakAlert(
      `Emergency Alert: Flood warning active in district. NDRF units dispatched.`,
      i18n.language?.startsWith('hi') ? 'hi-IN' : 'en-IN'
    );
    toast.success('Voice broadcast synthesized');
  };

  const handleLanguageSelect = (lang) => {
    i18n.changeLanguage(lang.code);
    localStorage.setItem('erip_lang', lang.code);
    soundManager.playSuccess();
    toast.success(`Language updated to ${lang.name} (${lang.native})`);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    soundManager.playBeep(newTheme === 'dark' ? 520 : 880, 0.08);
    toast.success(`Theme switched to ${newTheme === 'dark' ? 'Dark Tactical' : 'Light Operations'}`);
  };

  const savePreferences = () => {
    localStorage.setItem('erip_agency', selectedAgency);
    localStorage.setItem('erip_threshold', alertThreshold);
    localStorage.setItem('erip_radius', responseRadius);
    localStorage.setItem('erip_map_default', mapDefault);
    soundManager.playSuccess();
    toast.success('Settings and preferences saved successfully!');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{
            fontSize: 24, fontWeight: 700, color: 'var(--text-primary)',
            fontFamily: 'Space Grotesk, sans-serif', marginBottom: 6,
          }}>
            {t('nav.settings', 'System & Operational Settings')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            Configure real-time sirens, multilingual preferences, theme appearance, and tactical agency parameters.
          </p>
        </div>
        <button
          onClick={savePreferences}
          className="interactive-hover-glow"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 20px', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
          }}
        >
          <Check size={16} /> Save Settings
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 8, borderBottom: '1px solid var(--border)',
        marginBottom: 24, paddingBottom: 2,
      }}>
        {[
          { id: 'general', label: 'Audio & Theme', icon: Sliders },
          { id: 'language', label: 'Multilingual (12 Languages)', icon: Globe },
          { id: 'operations', label: 'Emergency & Agency', icon: Shield },
          { id: 'location', label: 'GPS & Geolocation', icon: MapPin },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                soundManager.playBeep(600, 0.04);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: '8px 8px 0 0',
                background: active ? 'var(--bg-card)' : 'transparent',
                border: active ? '1px solid var(--border)' : '1px solid transparent',
                borderBottom: active ? '1px solid var(--bg-card)' : '1px solid transparent',
                color: active ? '#f97316' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                fontSize: 13, cursor: 'pointer',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={15} color={active ? '#f97316' : 'currentColor'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: AUDIO & THEME ─── */}
      {activeTab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
          {/* Emergency Audio Siren Studio */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(239,68,68,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Volume2 size={20} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Emergency Audio & Siren System
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Real-time alarms synthesized via Web Audio API
                  </p>
                </div>
              </div>

              <button
                onClick={handleToggleMute}
                style={{
                  padding: '6px 12px', borderRadius: 20,
                  background: audioMuted ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                  border: `1px solid ${audioMuted ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                  color: audioMuted ? '#ef4444' : '#22c55e',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {audioMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                {audioMuted ? 'MUTED' : 'ACTIVE'}
              </button>
            </div>

            {/* Volume control slider */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Master Broadcast Volume</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {Math.round(audioVolume * 100)}%
                </span>
              </div>
              <input
                type="range" min="0" max="1" step="0.05"
                value={audioVolume}
                onChange={handleVolumeChange}
                disabled={audioMuted}
                style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }}
              />
            </div>

            {/* Test Interactive Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={testSirenSound}
                className={sirenActive ? 'siren-active' : 'interactive-hover-glow'}
                style={{
                  padding: '12px 16px', borderRadius: 8,
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  color: '#f87171', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Play size={15} />
                {sirenActive ? '🚨 SIREN TRANSMITTING (3.5s)...' : 'Test Emergency Siren Warning'}
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  onClick={testSonarSound}
                  className="interactive-hover-glow"
                  style={{
                    padding: '9px 14px', borderRadius: 8,
                    background: 'rgba(6,182,212,0.12)',
                    border: '1px solid rgba(6,182,212,0.35)',
                    color: '#06b6d4', fontWeight: 600, fontSize: 12,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Radio size={14} /> Sonar Ping
                </button>
                <button
                  onClick={testVoiceAlert}
                  className="interactive-hover-glow"
                  style={{
                    padding: '9px 14px', borderRadius: 8,
                    background: 'rgba(139,92,246,0.12)',
                    border: '1px solid rgba(139,92,246,0.35)',
                    color: '#a78bfa', fontWeight: 600, fontSize: 12,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Sparkles size={14} /> Voice Alert
                </button>
              </div>
            </div>
          </div>

          {/* Theme & Visual Appearance */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(249,115,22,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Moon size={20} color="#f97316" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Theme & Display Appearance
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Select operational high-contrast interface mode
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              {/* Dark Option */}
              <div
                onClick={() => handleThemeChange('dark')}
                style={{
                  padding: 16, borderRadius: 10, cursor: 'pointer',
                  background: '#0d1421',
                  border: theme === 'dark' ? '2px solid #f97316' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: theme === 'dark' ? '0 0 20px rgba(249,115,22,0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Moon size={18} color="#f97316" />
                  {theme === 'dark' && <Check size={16} color="#f97316" />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Dark Tactical</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  Glassmorphic dark design optimized for command rooms & night duty
                </div>
              </div>

              {/* Light Option */}
              <div
                onClick={() => handleThemeChange('light')}
                style={{
                  padding: 16, borderRadius: 10, cursor: 'pointer',
                  background: '#f8fafc',
                  border: theme === 'light' ? '2px solid #f97316' : '1px solid rgba(0,0,0,0.12)',
                  boxShadow: theme === 'light' ? '0 0 20px rgba(249,115,22,0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Sun size={18} color="#ea580c" />
                  {theme === 'light' && <Check size={16} color="#ea580c" />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Light Operations</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                  High-contrast daylight theme for outdoor emergency response tablets
                </div>
              </div>
            </div>

            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              fontSize: 12, color: 'var(--text-secondary)',
            }}>
              Current active mode: <strong style={{ color: '#f97316' }}>{theme === 'dark' ? 'Dark Tactical Mode' : 'Light Operations Mode'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: MULTILINGUAL ─── */}
      {activeTab === 'language' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Indian Multilingual Language Support (12 Official Languages)
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Instant real-time platform translation across navigation, incidents, maps, and broadcasts.
              </p>
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)',
              color: '#f97316', fontWeight: 700, fontSize: 12,
            }}>
              Active: {currentLang.native} ({currentLang.name})
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLang.code === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang)}
                  className="interactive-hover-glow"
                  style={{
                    padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                    background: isSelected ? 'rgba(249,115,22,0.12)' : 'var(--bg-elevated)',
                    border: isSelected ? '2px solid #f97316' : '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: isSelected ? '#f97316' : 'var(--text-primary)' }}>
                      {lang.native}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {lang.name} · ({lang.code.toUpperCase()})
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={14} color="#fff" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: EMERGENCY & AGENCY ─── */}
      {activeTab === 'operations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Agency Selection */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
              Primary Coordinating Agency
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Set your dispatch authority and resource command profile
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AGENCIES.map(ag => {
                const active = selectedAgency === ag.id;
                return (
                  <div
                    key={ag.id}
                    onClick={() => {
                      setSelectedAgency(ag.id);
                      soundManager.playBeep(600, 0.04);
                    }}
                    style={{
                      padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                      background: active ? `${ag.color}15` : 'var(--bg-elevated)',
                      border: active ? `2px solid ${ag.color}` : '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {ag.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        {ag.badge}
                      </div>
                    </div>
                    {active && <Check size={16} color={ag.color} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational Parameters */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
              Operational Thresholds & Defaults
            </h3>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Incident Alert Threshold
              </label>
              <select
                value={alertThreshold}
                onChange={e => setAlertThreshold(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                }}
              >
                <option value="all">Broadcast All Incidents (Low, Medium, High, Critical)</option>
                <option value="medium">Medium & Above (Default)</option>
                <option value="critical">Critical Emergencies Only</option>
              </select>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Emergency Geofence Radius
              </label>
              <select
                value={responseRadius}
                onChange={e => setResponseRadius(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                }}
              >
                <option value="10">Local Sector (10 km)</option>
                <option value="25">District Command (25 km)</option>
                <option value="50">Regional Response (50 km)</option>
                <option value="pan-india">Pan-India Operations (All)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Default Live Map Style
              </label>
              <select
                value={mapDefault}
                onChange={e => setMapDefault(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                }}
              >
                <option value="dark">Carto Dark Tactical</option>
                <option value="satellite">Esri Satellite Imagery</option>
                <option value="street">OpenStreetMap Standard</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: GPS & GEOLOCATION ─── */}
      {activeTab === 'location' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(59,130,246,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MapPin size={20} color="#3b82f6" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Device Geolocation Sensor
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  GPS accuracy and local disaster coordinates
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                geo.retry();
                toast.success('Refreshing GPS coordinates...');
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} /> Refresh GPS
            </button>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16, marginBottom: 20,
          }}>
            <div style={{ padding: 14, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Status</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: geo.loading ? '#eab308' : (geo.error ? '#ef4444' : '#22c55e'), marginTop: 4 }}>
                {geo.loading ? 'Acquiring Fix...' : (geo.error ? 'GPS Permission Denied' : 'GPS Fix Acquired')}
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Latitude</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, fontFamily: 'monospace' }}>
                {geo.lat ? geo.lat.toFixed(5) : '—'}° N
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Longitude</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, fontFamily: 'monospace' }}>
                {geo.lon ? geo.lon.toFixed(5) : '—'}° E
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Accuracy</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                {geo.accuracy ? `±${Math.round(geo.accuracy)} meters` : 'High Precision'}
              </div>
            </div>
          </div>

          <div style={{
            padding: 14, borderRadius: 8,
            background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)',
            fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
          }}>
            📍 Your exact browser geolocation is used to calculate proximity to active floods, landslides, and earthquakes in real-time. If you are operating on a mobile tablet or field vehicle, ensure location services are enabled.
          </div>
        </div>
      )}
    </div>
  );
}
