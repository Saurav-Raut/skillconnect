import axios from 'axios';
import { getTokenSync, getToken, removeToken, notifyUnauthorized } from './storage';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
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
