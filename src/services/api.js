import axios from 'axios';

// API calls go through the Vite proxy (/api → backend) so the browser
// treats them as same-origin — enabling HttpOnly cookie auth (ASVS V8.2.2).
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Static assets (profile photos) are served directly from the backend.
// They don't require the auth cookie so no proxy is needed.
const ASSET_BASE_URL = import.meta.env.VITE_ASSET_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Send HttpOnly cookie on every request
});

// --- Autenticacion -------------------------------------------------------

export const authApi = {
  login:               (data)     => api.post('/login', data),
  logout:              ()         => api.post('/logout'),
  register:            (formData) => api.post('/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  me:                  ()         => api.get('/me'),
  changePassword:      (data)     => api.put('/change-password', data),
  updateProfilePhoto:  (formData) => api.put('/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateCoverPhoto:    (formData) => api.put('/me/cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateName:          (name)     => api.put('/me/name', { name }),
  deleteAccount:       ()         => api.delete('/me'),
  getSecurityQuestion: (username) => api.get(`/forgot-password/${username}`),
  resetPassword:       (data)     => api.post('/forgot-password', data),
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
 * Builds an absolute URL for a backend-served static asset (profile photo, cover).
 * @param {string|null} path - Relative path, e.g. '/uploads/abc.webp'
 * @returns {string|null}
 */
export const assetUrl = (path) => (path ? `${ASSET_BASE_URL}${path}` : null);
