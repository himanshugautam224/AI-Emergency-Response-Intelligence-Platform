import React from 'react';
import { Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeStore } from '../store/theme';
import { soundManager } from '../utils/audioAlert';

export default function ThemeToggle({ iconOnly = false }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    toggleTheme();
    soundManager.playBeep(isDark ? 880 : 540, 0.08);
    toast.success(isDark ? 'Switched to Light Mode' : 'Switched to Dark Mode', { id: 'theme-toast' });
  };

  return (
    <button
      onClick={handleToggle}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="interactive-hover-glow"
      style={{
        display: 'flex', alignItems: 'center', gap: iconOnly ? 0 : 7,
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: iconOnly ? 8 : 20,
        padding: iconOnly ? '6px 8px' : '5px 12px',
        cursor: 'pointer',
        color: isDark ? '#fbbf24' : '#6366f1',
        fontSize: 12, fontWeight: 600,
        transition: 'all 0.2s ease',
      }}
    >
      {isDark
        ? <Sun size={14} style={{ transition: 'transform 0.3s', transform: 'rotate(0deg)' }} />
        : <Moon size={14} style={{ transition: 'transform 0.3s', transform: 'rotate(15deg)' }} />
      }
      {!iconOnly && (
        <span style={{ color: 'var(--text-secondary)' }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
