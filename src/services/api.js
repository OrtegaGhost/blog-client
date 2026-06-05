import axios from 'axios';
import { storage } from '../utils/storage';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** Axios instance pre-configured with base URL and auth header injection */
const api = axios.create({ baseURL: BASE_URL });

// Attach the JWT token on every request if one exists
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/login', data),
  register: (formData) =>
    api.post('/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  me: () => api.get('/me'),
  changePassword: (data) => api.put('/change-password', data),
};

// ─── Feed ──────────────────────────────────────────────────────────────────
export const feedApi = {
  getComments: () => api.get('/feed'),
  createComment: (data) => api.post('/feed', data),
};

/** Resolves a relative upload path to a full URL */
export const assetUrl = (path) =>
  path ? `${BASE_URL}${path}` : null;
