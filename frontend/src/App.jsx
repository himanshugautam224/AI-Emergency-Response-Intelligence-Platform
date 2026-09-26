import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Incidents from './pages/Incidents';
import SOSReports from './pages/SOSReports';
import Resources from './pages/Resources';
import Volunteers from './pages/Volunteers';
import Communications from './pages/Communications';
import AIEngine from './pages/AIEngine';
import Analytics from './pages/Analytics';
import ExternalFeeds from './pages/ExternalFeeds';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

// ─── Dark Auth Shell ──────────────────────────────────────────────────────────
function AuthShell({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080c14',
      backgroundImage: `
        radial-gradient(ellipse at 20% 20%, rgba(249,115,22,0.10) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 80%, rgba(239,68,68,0.07) 0%, transparent 55%),
        radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.04) 0%, transparent 70%)
      `,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 72, height: 72,
          background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
          borderRadius: 20, margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
          boxShadow: '0 0 40px rgba(249,115,22,0.40), 0 0 90px rgba(249,115,22,0.12)',
        }}>🚨</div>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 26, fontWeight: 800, color: '#f1f5f9',
          margin: '0 0 6px', letterSpacing: '-0.5px',
        }}>ERIP India</h1>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 4px' }}>
          AI Emergency Response Intelligence Platform
        </p>
        <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>
          NDRF · SDRF · Fire &amp; Rescue · Medical Corps · IAF
        </p>
      </div>
      {children}
    </div>
  );
}

const CLERK_APPEARANCE = {
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
    fontSize: '14px',
  },
  elements: {
    rootBox: { width: '100%', maxWidth: 420 },
    card: {
      background: '#111827',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
      backdropFilter: 'blur(20px)',
    },
    headerTitle: { color: '#f1f5f9', fontWeight: 700, fontSize: 20 },
    headerSubtitle: { color: '#94a3b8' },
    socialButtonsBlockButton: {
      background: '#1e2a3d',
      border: '1px solid rgba(255,255,255,0.10)',
      color: '#f1f5f9',
      '&:hover': { background: '#253448' },
    },
    socialButtonsBlockButtonText: { color: '#f1f5f9', fontWeight: 600 },
    formButtonPrimary: {
      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      boxShadow: '0 4px 16px rgba(249,115,22,0.45)',
      fontWeight: 700,
    },
    footerActionLink: { color: '#f97316', fontWeight: 600 },
    formFieldInput: {
      background: '#1e2d40',
      border: '1px solid rgba(255,255,255,0.10)',
      color: '#f1f5f9',
      '&:focus': { borderColor: '#f97316' },
    },
    formFieldLabel: { color: '#94a3b8', fontSize: 13 },
    dividerLine: { background: 'rgba(255,255,255,0.07)' },
    dividerText: { color: '#475569' },
    identityPreviewText: { color: '#f1f5f9' },
    identityPreviewEditButton: { color: '#f97316' },
    otpCodeFieldInput: { background: '#1e2d40', borderColor: 'rgba(255,255,255,0.10)', color: '#f1f5f9' },
    alertText: { color: '#f87171' },
  },
};

// ─── Protected App Layout ─────────────────────────────────────────────────────
function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-w)',
        minHeight: '100vh',
        width: 'calc(100% - var(--sidebar-w))',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Topbar />
        <main style={{
          flex: 1,
          paddingTop: 'var(--topbar-h)',
          minHeight: 'calc(100vh - var(--topbar-h))',
          overflowX: 'hidden',
          background: 'var(--bg-base)',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Protected Route Wrapper ─────────────────────────────────────────────────
function Protected({ children }) {
  return (
    <>
      <SignedIn><AppLayout>{children}</AppLayout></SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

// ─── App Routes ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)', color: 'var(--text-primary)',
            border: '1px solid var(--border)', borderRadius: 10, fontSize: 13,
          },
          duration: 3500,
        }}
      />
      <Routes>
        {/* ── Auth Pages ── */}
        <Route path="/sign-in/*" element={
          <AuthShell>
            <SignIn
              appearance={CLERK_APPEARANCE}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              afterSignInUrl="/"
            />
          </AuthShell>
        } />
        <Route path="/sign-up/*" element={
          <AuthShell>
            <SignUp
              appearance={CLERK_APPEARANCE}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              afterSignUpUrl="/"
            />
          </AuthShell>
        } />

        {/* ── Protected App Routes ── */}
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/map" element={<Protected><LiveMap /></Protected>} />
        <Route path="/incidents" element={<Protected><Incidents /></Protected>} />
        <Route path="/sos" element={<Protected><SOSReports /></Protected>} />
        <Route path="/resources" element={<Protected><Resources /></Protected>} />
        <Route path="/volunteers" element={<Protected><Volunteers /></Protected>} />
        <Route path="/comms" element={<Protected><Communications /></Protected>} />
        <Route path="/ai" element={<Protected><AIEngine /></Protected>} />
        <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
        <Route path="/external" element={<Protected><ExternalFeeds /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
