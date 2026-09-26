import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.jsx';
import './index.css';
import './i18n';                       // initialise i18next (all 12 Indian languages)

// ── PWA Service Worker ────────────────────────────────────────────────────────
import { registerSW } from 'virtual:pwa-register';
registerSW({
  immediate: true,
  onNeedRefresh() {
    // Optional: notify user that a new version is available
    console.log('[PWA] New version available — will update on next reload.');
  },
  onOfflineReady() {
    console.log('[PWA] App ready for offline use.');
  },
});

// ── Theme init (apply saved theme immediately) ────────────────────────────────
const savedTheme = localStorage.getItem('erip-theme')
  ? JSON.parse(localStorage.getItem('erip-theme'))?.state?.theme
  : 'dark';
document.documentElement.setAttribute('data-theme', savedTheme || 'dark');

// ── Clerk publishable key ─────────────────────────────────────────────────────
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in frontend/.env');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: '#f97316',
          colorBackground: '#111827',
          colorInputBackground: '#1e2d40',
          colorInputText: '#f1f5f9',
          colorText: '#f1f5f9',
          colorTextSecondary: '#94a3b8',
          colorNeutral: '#1e2a3d',
          borderRadius: '12px',
          fontFamily: "'Inter', sans-serif",
        },
        elements: {
          card: {
            background: '#111827',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          },
          formButtonPrimary: {
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            boxShadow: '0 4px 16px rgba(249,115,22,0.45)',
            fontWeight: 700,
          },
          socialButtonsBlockButton: {
            background: '#1e2a3d',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#f1f5f9',
          },
          footerActionLink: { color: '#f97316', fontWeight: 600 },
          formFieldInput: {
            background: '#1e2d40',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#f1f5f9',
          },
          dividerLine: { background: 'rgba(255,255,255,0.07)' },
          dividerText: { color: '#475569' },
        },
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
