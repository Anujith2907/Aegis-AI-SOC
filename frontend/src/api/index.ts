import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aegisai-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('aegisai-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ===== AUTH API =====
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
};

// ===== THREAT DETECTION API =====
export const threatAPI = {
  detectThreats: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/threats/detect', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getIncidents: (page = 1, limit = 20) =>
    api.get(`/incidents?page=${page}&limit=${limit}`),
  getIncident: (id: string) => api.get(`/incidents/${id}`),
  getRootCause: (id: string) => api.get(`/incidents/${id}/root-cause`),
  getSimilarIncidents: (id: string) => api.get(`/incidents/${id}/similar`),
  getClusters: () => api.get('/threats/clusters'),
};

// ===== COPILOT API =====
export const copilotAPI = {
  chat: (message: string, history: { role: string; content: string }[]) =>
    api.post('/copilot/chat', { message, history }),
};

// ===== REPORTS API =====
export const reportsAPI = {
  generate: (incidentId: string, type: string) =>
    api.post('/reports/generate', { incidentId, type }),
};

// ===== RESPONSE API =====
export const responseAPI = {
  triggerResponse: (incidentId: string, actions: string[]) =>
    api.post('/response/trigger', { incidentId, actions }),
};

// ===== ADMIN API =====
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getSystemLogs: () => api.get('/admin/logs'),
  getModelMetrics: () => api.get('/admin/models'),
};
