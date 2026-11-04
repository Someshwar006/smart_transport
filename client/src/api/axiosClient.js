import axios from 'axios';

// Dynamically resolve the API base URL:
// 1. If VITE_API_URL environment variable is set (e.g., in Render dashboard or .env):
//    Ensure it properly points to the /api endpoint (appending /api if missing).
// 2. In browser environments (e.g. deployed on Render at https://smart-transport-f0xg.onrender.com):
//    Default to relative '/api' so it hits the exact same origin over secure HTTPS without mixed-content issues.
// 3. In local development:
//    Defaults to '/api' which is proxied by Vite dev server to http://localhost:5000/api.
const getBaseApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return '/api';
};

const axiosClient = axios.create({
  baseURL: getBaseApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('logiconnect_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthenticated 401s gracefully
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (localStorage.getItem('logiconnect_token')) {
        localStorage.removeItem('logiconnect_token');
        localStorage.removeItem('logiconnect_user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
