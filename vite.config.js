import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = process.env.VITE_PROXY_TARGET || 'http://localhost:3000';

// Proxy /api/* through Vite so cookies (SameSite=Lax) work without HTTPS.
// From the browser's perspective all requests stay on the same origin (:5173).
const proxy = {
  '/api': {
    target: API_TARGET,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
};

export default defineConfig({
  plugins: [react()],
  server:  { proxy },
  preview: { proxy },
})
