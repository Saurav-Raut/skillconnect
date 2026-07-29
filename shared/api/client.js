import axios from 'axios';
import { getTokenSync, getToken, removeToken, notifyUnauthorized } from './storage';

const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL || process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('vercel.app')) {
      return `http://${window.location.hostname}:5000/api`;
    }
  }
  return 'http://localhost:5000/api';
};

const API = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add auth token (sync web check first, then async mobile check)
API.interceptors.request.use(
  async (config) => {
    let token = getTokenSync();
    if (!token) {
      token = await getToken();
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized / Token expiry gracefully across web & mobile
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await removeToken();
      notifyUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default API;
