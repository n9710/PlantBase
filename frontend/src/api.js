import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Request interceptor — attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, error => Promise.reject(error));

// Response interceptor — global error handling
api.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.message || err.response?.data?.msg || err.message || 'Something went wrong';

    // Don't toast on 401 during initial auth check
    if (err.response?.status === 401) {
      localStorage.removeItem('pb_token');
      localStorage.removeItem('pb_user');
      // Only redirect if not already on login/register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    } else if (err.response?.status !== 404) {
      // Show toast for non-404 errors
      toast.error(message);
    }

    return Promise.reject(err);
  }
);

export default api;