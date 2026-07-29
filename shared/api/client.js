import axios from 'axios';
import { getTokenSync, getToken, removeToken, notifyUnauthorized } from './storage';

const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env) {
    const url = process.env.REACT_APP_API_URL || process.env.EXPO_PUBLIC_API_URL;
    if (url) {
      return url.endsWith('/api') ? url : `${url}/api`;
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
