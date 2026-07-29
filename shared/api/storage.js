// Platform-agnostic storage adapter for SkillConnect Web & Mobile
let storageAdapter = {
  getItemSync: (key) => {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  },
  getItem: async (key) => {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key, value) => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, value);
    }
  },
  removeItem: async (key) => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  }
};

let onUnauthorizedCallback = null;

export const setStorageAdapter = (adapter) => {
  storageAdapter = adapter;
};

export const setUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

export const getTokenSync = () => {
  if (storageAdapter.getItemSync) {
    return storageAdapter.getItemSync('token');
  }
  return null;
};

export const getToken = async () => {
  return await storageAdapter.getItem('token');
};

export const setToken = async (token) => {
  return await storageAdapter.setItem('token', token);
};

export const removeToken = async () => {
  return await storageAdapter.removeItem('token');
};

export const notifyUnauthorized = () => {
  if (onUnauthorizedCallback) {
    onUnauthorizedCallback();
  } else if (typeof window !== 'undefined' && window.location) {
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
  }
};
