import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Clerk token to every request
client.interceptors.request.use(async (config) => {
  try {
    // Try to get Clerk session token
    const { getToken } = window.__clerk_session || {};
    if (getToken) {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {}
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      console.error('[API] Cannot reach backend. Start FastAPI: python -m uvicorn api.main:app --reload');
    }
    return Promise.reject(err);
  }
);

// ─── API Modules ─────────────────────────────────────────────────────────────
export const authAPI = {
  login: async ({ email, password }) => {
    return {
      data: {
        access: 'demo-jwt-token-ops-hq',
        refresh: 'demo-refresh-token',
        user: {
          id: 'usr_ops_01',
          email: email || 'commander@erip.gov.in',
          first_name: 'Operations',
          last_name: 'Commander',
          role: 'admin',
          agency_name: 'National Disaster Response Force (NDRF)',
        },
      },
    };
  },
  logout: async () => ({ data: { success: true } }),
  me: async () => ({
    data: {
      id: 'usr_ops_01',
      email: 'commander@erip.gov.in',
      first_name: 'Operations',
      last_name: 'Commander',
      role: 'admin',
      agency_name: 'National Disaster Response Force (NDRF)',
    },
  }),
};

export const incidentsAPI = {
  list: (params = {}) => client.get('/api/incidents/', { params }),
  get: (id) => client.get(`/api/incidents/${id}`),
  create: (data) => client.post('/api/incidents/', data),
  update: (id, data) => client.patch(`/api/incidents/${id}`, data),
  delete: (id) => client.delete(`/api/incidents/${id}`),
  sos: () => client.get('/api/incidents/sos'),
};

export const disastersAPI = {
  list: (params = {}) => client.get('/api/disasters/', { params }),
  types: () => client.get('/api/disasters/types'),
  timeline: (params = {}) => client.get('/api/disasters/timeline', { params }),
};

export const resourcesAPI = {
  list: (params = {}) => client.get('/api/resources/', { params }),
  create: (data) => client.post('/api/resources/', data),
  deploy: (id, incidentId, eta) => client.patch(`/api/resources/${id}/deploy`, null, {
    params: { incident_id: incidentId, eta_minutes: eta }
  }),
  release: (id) => client.patch(`/api/resources/${id}/release`),
};

export const riskAPI = {
  predict: (data) => client.post('/api/risk/predict', data),
  summary: () => client.get('/api/risk/summary'),
  heatmap: () => client.get('/api/risk/heatmap'),
};

export const weatherAPI = {
  current: (lat, lon) => client.get('/api/weather/current', { params: { lat, lon } }),
  earthquakes: (lat, lon, period = 'week', minMag = 3.0) =>
    client.get('/api/weather/earthquakes', { params: { lat, lon, period, min_magnitude: minMag } }),
  nasaEvents: (lat, lon) => client.get('/api/weather/nasa-events', { params: { lat, lon } }),
};

export const triageAPI = {
  analyze: (text) => client.post('/api/triage/triage', { text }),
};

export const chatbotAPI = {
  chat: (messages, context = '') => client.post('/api/chatbot/chat', { messages, context }),
};

export const statsAPI = {
  platform: () => client.get('/api/stats'),
  health: () => client.get('/api/health'),
};

export const optimizationAPI = {
  allocate: (data) => client.post('/api/optimization/allocate', data),
  routing: (fromLat, fromLon, toLat, toLon) =>
    client.get('/api/optimization/routing', { params: { from_lat: fromLat, from_lon: fromLon, to_lat: toLat, to_lon: toLon } }),
};

export default client;
