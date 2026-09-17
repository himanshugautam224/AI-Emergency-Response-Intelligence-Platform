import axios from 'axios';

// In dev, Vite proxies /api → Django (works on any dev port: 5173, 5175, etc.)
const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api/v1' : 'http://localhost:8000/api/v1');

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ───────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  logout:   (data) => api.post('/auth/logout/', data),
  me:       ()     => api.get('/auth/me/'),
  updateMe: (data) => api.patch('/auth/me/', data),
  agencies: ()     => api.get('/auth/agencies/'),
  users:    ()     => api.get('/auth/users/'),
};

// ─── Incidents ──────────────────────────────────────────────
export const incidentsAPI = {
  list:      (params) => api.get('/incidents/', { params }),
  detail:    (id)     => api.get(`/incidents/${id}/`),
  create:    (data)   => api.post('/incidents/', data),
  update:    (id, d)  => api.patch(`/incidents/${id}/`, d),
  delete:    (id)     => api.delete(`/incidents/${id}/`),
  updates:   (id)     => api.get(`/incidents/${id}/updates/`),
  addUpdate: (id, d)  => api.post(`/incidents/${id}/updates/`, d),
  sosList:   (params) => api.get('/incidents/sos/', { params }),
};

// ─── SOS ────────────────────────────────────────────────────
export const sosAPI = {
  list:   (params) => api.get('/incidents/sos/', { params }),
  submit: (data)   => api.post('/incidents/sos/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verify: (id)     => api.patch(`/incidents/sos/${id}/verify/`),
};

// ─── Resources ──────────────────────────────────────────────
export const resourcesAPI = {
  list:   (params) => api.get('/resources/', { params }),
  depots: ()       => api.get('/resources/depots/'),
  deploy: (data)   => api.post('/resources/deploy/', data),
};

// ─── Volunteers ─────────────────────────────────────────────
export const volunteersAPI = {
  list:   (params) => api.get('/volunteers/', { params }),
  assign: (data)   => api.post('/volunteers/assign/', data),
};

// ─── AI Engine ──────────────────────────────────────────────
export const aiAPI = {
  triage:         (data) => api.post('/ai/triage/', data),
  disasterType:   (data) => api.post('/ai/predict/disaster-type/', data),
  alertLevel:     (data) => api.post('/ai/predict/alert-level/', data),
  riskScore:      (data) => api.post('/ai/predict/risk-score/', data),
  resourceDemand: (data) => api.post('/ai/predict/resource-demand/', data),
  responseTime:   (data) => api.post('/ai/predict/response-time/', data),
};

// ─── Analytics ──────────────────────────────────────────────
export const analyticsAPI = {
  overview:  () => api.get('/analytics/overview/'),
  incidents: () => api.get('/analytics/incidents/'),
  resources: () => api.get('/analytics/resources/'),
};

// ─── External Data ──────────────────────────────────────────
export const externalAPI = {
  earthquakes: () => api.get('/external/earthquakes/'),
  weather:     (lat, lon) => api.get(`/external/weather/?lat=${lat}&lon=${lon}`),
  gdacs:       () => api.get('/external/gdacs/'),
};

export default api;
