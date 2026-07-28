import axios from 'axios';

const API_BASE = (import.meta as any).env?.VITE_API_URL || (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : null) || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Attach bearer token — read fresh from localStorage on every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('chronex_token');
      if (token && token !== 'demo-jwt-token') {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401, clear stale token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('chronex_token');
        // Only clear real (non-demo) tokens that returned 401
        if (token && token !== 'demo-jwt-token') {
          // Don't auto-logout on 401 from auth routes themselves
          const url = error.config?.url || '';
          if (!url.includes('/auth/')) {
            localStorage.removeItem('chronex_token');
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
