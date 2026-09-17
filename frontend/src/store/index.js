import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/client';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.login({ email, password });
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          let msg = err.response?.data?.non_field_errors?.[0];
          if (!msg && err.response?.data?.detail) {
            msg = err.response.data.detail;
          }
          if (!msg && !err.response) {
            msg =
              'Cannot reach the API. Start the backend: cd backend → python manage.py runserver 0.0.0.0:8000';
          }
          if (!msg) msg = 'Invalid email or password.';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      logout: async () => {
        const refresh = localStorage.getItem('refresh_token');
        try { await authAPI.logout({ refresh }); } catch {}
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await authAPI.me();
          set({ user: data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ─── Incident Store ──────────────────────────────────────────
export const useIncidentStore = create((set) => ({
  incidents: [],
  activeIncident: null,
  isLoading: false,
  filters: { status: '', alert_level: '', disaster_type: '' },

  setIncidents: (incidents) => set({ incidents }),
  setActiveIncident: (incident) => set({ activeIncident: incident }),
  setLoading: (v) => set({ isLoading: v }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

  addIncident: (incident) =>
    set((state) => ({ incidents: [incident, ...state.incidents] })),

  updateIncident: (id, updates) =>
    set((state) => ({
      incidents: state.incidents.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),
}));

// ─── UI Store ────────────────────────────────────────────────
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  activePage: 'dashboard',
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActivePage: (page) => set({ activePage: page }),
  addNotification: (n) =>
    set((state) => ({ notifications: [{ id: Date.now(), ...n }, ...state.notifications].slice(0, 20) })),
  clearNotification: (id) =>
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
}));
