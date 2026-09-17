import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import {
  LayoutDashboard, Map, AlertTriangle, Package, Users,
  Bell, MessageSquare, BarChart3, Cpu, Globe, LogOut, Settings
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Operations',
    items: [
      { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/map',       icon: Map,             label: 'Live Map',         badge: null },
      { to: '/incidents', icon: AlertTriangle,   label: 'Incidents',        badge: 'live' },
      { to: '/sos',       icon: Bell,            label: 'SOS Reports',      badge: 'live' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/resources',  icon: Package,        label: 'Resources' },
      { to: '/volunteers', icon: Users,          label: 'Volunteers' },
      { to: '/comms',      icon: MessageSquare,  label: 'Communications' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/ai',        icon: Cpu,             label: 'AI Engine' },
      { to: '/analytics', icon: BarChart3,       label: 'Analytics' },
      { to: '/external',  icon: Globe,           label: 'Live Data Feeds' },
    ],
  },
];

export default function Sidebar({ sosCount = 0, incidentCount = 0 }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🚨</div>
        <div className="logo-text">
          <span className="logo-title">ERIP India</span>
          <span className="logo-sub">Emergency Response</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(({ to, icon: Icon, label, badge }) => {
              const count = badge === 'live'
                ? (label === 'SOS Reports' ? sosCount : incidentCount)
                : 0;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <Icon size={16} className="nav-icon" />
                  {label}
                  {count > 0 && <span className="nav-badge">{count > 99 ? '99+' : count}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}

        {/* Settings */}
        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
          <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Settings size={16} />
            Settings
          </NavLink>
        </div>
      </nav>

      {/* User Card */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.first_name} {user?.last_name}</div>
            <div className="user-role">{user?.role?.replace('_', ' ') || 'User'}</div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleLogout}
            title="Logout"
            style={{ marginLeft: 'auto', flexShrink: 0 }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
