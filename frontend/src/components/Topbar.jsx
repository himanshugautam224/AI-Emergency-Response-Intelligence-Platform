import React from 'react';
import { Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { useAuthStore } from '../store';

export default function Topbar({ title, breadcrumb, isLive = true }) {
  const { user } = useAuthStore();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <div className="page-title">{title}</div>
          {breadcrumb && <div className="page-breadcrumb">{breadcrumb}</div>}
        </div>
      </div>

      <div className="topbar-right">
        {/* Live Status Indicator */}
        <div className="flex items-center gap-2" style={{
          padding: '5px 12px',
          borderRadius: 'var(--radius-full)',
          background: isLive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${isLive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          fontSize: '12px',
          fontWeight: 600,
          color: isLive ? 'var(--alert-green)' : 'var(--alert-red)',
        }}>
          {isLive
            ? <><Wifi size={13} /> LIVE</>
            : <><WifiOff size={13} /> OFFLINE</>
          }
        </div>

        {/* Search */}
        <div className="flex items-center gap-2" style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '7px 12px',
          gap: 8,
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search incidents, locations..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: 13,
              width: 200,
            }}
          />
        </div>

        {/* Notifications */}
        <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--alert-red)',
            boxShadow: '0 0 6px var(--alert-red)',
          }} />
        </button>

        {/* Agency Tag */}
        {user?.agency_detail && (
          <div className="badge badge-blue" style={{ fontSize: 11 }}>
            {user.agency_detail.code}
          </div>
        )}
      </div>
    </header>
  );
}
