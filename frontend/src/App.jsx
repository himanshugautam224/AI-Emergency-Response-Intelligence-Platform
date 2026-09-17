import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';

import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import LiveMap from './pages/LiveMap';
import Incidents from './pages/Incidents';
import SOSReports from './pages/SOSReports';
import Resources from './pages/Resources';
import Volunteers from './pages/Volunteers';
import Communications from './pages/Communications';
import AIEngine from './pages/AIEngine';
import Analytics from './pages/Analytics';
import ExternalFeeds from './pages/ExternalFeeds';

// Protected layout wrapper
function AppLayout({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar incidentCount={5} sosCount={3} />
      <main className="main-content" style={{ flex: 1, overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}

function AuthBootstrap({ children }) {
  const { isAuthenticated, fetchMe } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (isAuthenticated && token) {
      fetchMe();
    } else if (isAuthenticated && !token) {
      useAuthStore.setState({ user: null, isAuthenticated: false });
    }
  }, [isAuthenticated, fetchMe]);

  return children;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <AuthBootstrap>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/map" element={<AppLayout><LiveMap /></AppLayout>} />
        <Route path="/incidents" element={<AppLayout><Incidents /></AppLayout>} />
        <Route path="/sos" element={<AppLayout><SOSReports /></AppLayout>} />
        <Route path="/resources" element={<AppLayout><Resources /></AppLayout>} />
        <Route path="/volunteers" element={<AppLayout><Volunteers /></AppLayout>} />
        <Route path="/comms" element={<AppLayout><Communications /></AppLayout>} />
        <Route path="/ai" element={<AppLayout><AIEngine /></AppLayout>} />
        <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
        <Route path="/external" element={<AppLayout><ExternalFeeds /></AppLayout>} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
