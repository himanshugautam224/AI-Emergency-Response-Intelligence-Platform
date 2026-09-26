import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { soundManager } from '../utils/audioAlert';
import { SUPPORTED_LANGUAGES } from '../i18n';

export default function LanguageSelector({ compact = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const langCode = i18n.language || 'en';
  const current = SUPPORTED_LANGUAGES.find(l => l.code === langCode || langCode.startsWith(l.code)) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang.code);
    localStorage.setItem('erip_lang', lang.code);
    soundManager.playBeep(650, 0.08);
    toast.success(`Language changed to ${lang.name} (${lang.native})`, { id: 'lang-toast' });
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 8, padding: compact ? '5px 8px' : '6px 12px',
          cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600,
          transition: 'all 0.15s',
        }}
        title="Switch Language / भाषा बदलें"
      >
        <Globe size={13} color="var(--text-muted)" />
        {!compact && <span style={{ color: 'var(--text-secondary)' }}>{current.native}</span>}
        <ChevronDown size={11} color="var(--text-muted)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          zIndex: 9999,
          minWidth: 180,
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Header */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Select Language · भाषा चुनें
          </div>

          {/* Language list */}
          <div style={{ maxHeight: 280, overflowY: 'auto', padding: '4px 0' }}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '8px 12px',
                  background: i18n.language === lang.code ? 'rgba(249,115,22,0.1)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: i18n.language === lang.code ? '#f97316' : 'var(--text-primary)',
                  fontSize: 13, textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (i18n.language !== lang.code) e.target.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (i18n.language !== lang.code) e.target.style.background = 'transparent'; }}
              >
                <span style={{ fontWeight: 600 }}>{lang.native}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
