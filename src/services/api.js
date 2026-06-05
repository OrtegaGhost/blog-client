import axios from 'axios';
import { storage } from '../utils/storage';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Instancia de Axios preconfigurada con la URL base del backend
const api = axios.create({ baseURL: BASE_URL });

// Adjunta el token JWT en cada peticion si existe uno en almacenamiento local
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Autenticacion -------------------------------------------------------

export const authApi = {
  login:          (data)     => api.post('/login', data),
  register:       (formData) => api.post('/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  me:             ()         => api.get('/me'),
  changePassword: (data)     => api.put('/change-password', data),
};

// --- Feed ----------------------------------------------------------------

export const feedApi = {
  getComments:   ()              => api.get('/feed'),
  createComment: (data)          => api.post('/feed', data),
  updateComment: (id, content)   => api.put(`/feed/${id}`, { content }),
  deleteComment: (id)            => api.delete(`/feed/${id}`),
};

// --- Usuarios ------------------------------------------------------------

export const usersApi = {
  getProfile: (username) => api.get(`/users/${username}`),
};

/**
 * Convierte una ruta relativa de upload en una URL completa.
 * Retorna null si no se proporciona ruta.
 *
 * @param {string|null} path - Ruta relativa, ej: '/uploads/abc.webp'
 * @returns {string|null}
 */
export const assetUrl = (path) => (path ? `${BASE_URL}${path}` : null);
