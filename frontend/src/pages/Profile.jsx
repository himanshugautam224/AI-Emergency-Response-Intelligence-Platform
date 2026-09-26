import React, { useState } from 'react';
import { useUser, UserProfile } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import {
  Shield, CheckCircle2, Phone, Mail, Award, Clock,
  Calendar, Key, MapPin, Activity, Sparkles, User, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { soundManager } from '../utils/audioAlert';
import { useThemeStore } from '../store/theme';

export default function Profile() {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  const [dutyStatus, setDutyStatus] = useState('active');
  const [showClerkProfile, setShowClerkProfile] = useState(false);

  if (!isLoaded) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Commander Credentials...
      </div>
    );
  }

  const handleStatusChange = (status) => {
    setDutyStatus(status);
    soundManager.playBeep(status === 'active' ? 780 : 500, 0.08);
    toast.success(`Operational status updated to: ${status.toUpperCase()}`);
  };

  const CLERK_PROFILE_APPEARANCE = {
    variables: {
      colorPrimary: '#f97316',
      colorBackground: theme === 'dark' ? '#111827' : '#ffffff',
      colorInputBackground: theme === 'dark' ? '#1e2d40' : '#f1f5f9',
      colorInputText: theme === 'dark' ? '#ffffff' : '#0f172a',
      colorText: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      colorTextSecondary: theme === 'dark' ? '#cbd5e1' : '#475569',
      colorNeutral: theme === 'dark' ? '#1e2a3d' : '#e2e8f0',
      borderRadius: '12px',
      fontFamily: "'Inter', sans-serif",
    },
    elements: {
      rootBox: { width: '100%', maxWidth: '100%' },
      card: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--text-primary)',
      },
      navbar: {
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      },
      navbarButton: {
        color: 'var(--text-primary)',
        fontWeight: 600,
        '&:hover': { color: '#f97316', background: 'var(--bg-elevated)' },
      },
      navbarButtonActive: {
        color: '#f97316',
        background: 'var(--bg-elevated)',
        fontWeight: 700,
      },
      headerTitle: { color: 'var(--text-primary)', fontWeight: 700, fontSize: 20 },
      headerSubtitle: { color: 'var(--text-secondary)' },
      profileSectionTitleText: { color: 'var(--text-primary)', fontWeight: 700, fontSize: 16 },
      profileSectionContent: { color: 'var(--text-secondary)' },
      profileSectionPrimaryButton: {
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        color: '#fff',
        fontWeight: 600,
      },
      formFieldLabel: { color: 'var(--text-primary)', fontWeight: 600 },
      formFieldInput: {
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border)',
        color: 'var(--text-primary)',
      },
      breadcrumbsItem: { color: 'var(--text-secondary)' },
      breadcrumbsItemCurrent: { color: 'var(--text-primary)', fontWeight: 600 },
      accordionTriggerButton: { color: 'var(--text-primary)', fontWeight: 600 },
      badge: { background: 'rgba(249,115,22,0.15)', color: '#f97316' },
    },
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontSize: 24, fontWeight: 700, color: 'var(--text-primary)',
            fontFamily: 'Space Grotesk, sans-serif', marginBottom: 4,
          }}>
            Commander Credentials & Identity
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            Operational access token & security credentials for ERIP India Platform.
          </p>
        </div>

        <button
          onClick={() => setShowClerkProfile(s => !s)}
          className="interactive-hover-glow"
          style={{
            padding: '8px 16px', borderRadius: 8,
            background: showClerkProfile ? 'rgba(249,115,22,0.15)' : 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: showClerkProfile ? '#f97316' : 'var(--text-primary)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Key size={14} />
          {showClerkProfile ? 'Hide Security Manager' : 'Manage Account & Security'}
        </button>
      </div>

      {/* Official Identity Card */}
      <div className="card" style={{
        padding: 28, marginBottom: 28, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
        border: '1px solid var(--border)',
      }}>
        {/* Subtle Watermark Badge */}
        <div style={{
          position: 'absolute', right: -20, top: -20, opacity: 0.04,
          pointerEvents: 'none',
        }}>
          <Shield size={240} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
          {/* Avatar with status ring */}
          <div style={{ position: 'relative' }}>
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                style={{
                  width: 90, height: 90, borderRadius: '50%',
                  objectFit: 'cover', border: '3px solid #f97316',
                  boxShadow: '0 0 20px rgba(249,115,22,0.3)',
                }}
              />
            ) : (
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 34, fontWeight: 800, color: '#fff',
                boxShadow: '0 0 20px rgba(249,115,22,0.3)',
              }}>
                {(user?.firstName?.[0] || 'C').toUpperCase()}
              </div>
            )}
            <span style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 16, height: 16, borderRadius: '50%',
              background: dutyStatus === 'active' ? '#22c55e' : (dutyStatus === 'field' ? '#f97316' : '#94a3b8'),
              border: '3px solid var(--bg-card)',
              boxShadow: '0 0 8px currentColor',
            }} />
          </div>

          {/* Commander Information */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h2 style={{
                fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0,
                fontFamily: 'Space Grotesk, sans-serif',
              }}>
                {user?.fullName || user?.firstName || 'Disaster Response Commander'}
              </h2>
              <span style={{
                background: 'rgba(249,115,22,0.15)', color: '#f97316',
                border: '1px solid rgba(249,115,22,0.35)',
                borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 800,
                letterSpacing: '0.6px',
              }}>
                LEVEL 4 COMMANDER
              </span>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mail size={13} color="var(--text-muted)" />
              <span>{user?.primaryEmailAddress?.emailAddress || 'commander@erip.gov.in'}</span>
              <span>·</span>
              <Shield size={13} color="#f97316" />
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>NDRF National Operations Cell</span>
            </div>

            {/* Status pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'active', label: '🟢 On Active Command', color: '#22c55e' },
                { id: 'field', label: '🟠 In Field Operations', color: '#f97316' },
                { id: 'standby', label: '⚪ On Standby', color: '#94a3b8' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => handleStatusChange(s.id)}
                  style={{
                    padding: '4px 10px', borderRadius: 20,
                    background: dutyStatus === s.id ? `${s.color}20` : 'var(--bg-elevated)',
                    border: `1px solid ${dutyStatus === s.id ? s.color : 'var(--border)'}`,
                    color: dutyStatus === s.id ? s.color : 'var(--text-secondary)',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)',
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Operator ID
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'monospace' }}>
              IND-NDRF-88492
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Jurisdiction
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              Pan-India National Response
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Emergency Direct Line
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginTop: 2 }}>
              1078 (NDRF Direct Hotline)
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Clearance Status
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#22c55e', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={14} color="#22c55e" /> Verified Operator
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Clerk User Profile with High-Contrast Theming */}
      {showClerkProfile && (
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
          padding: 16, boxShadow: 'var(--shadow-lg)',
        }}>
          <UserProfile appearance={CLERK_PROFILE_APPEARANCE} />
        </div>
      )}
    </div>
  );
}
