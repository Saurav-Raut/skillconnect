import * as SecureStore from 'expo-secure-store';
import { setStorageAdapter, setUnauthorizedCallback } from '@skillconnect/shared';

// In-memory token cache for instant synchronous access
let cachedToken: string | null = null;

export const initializeSecureStorage = async (onUnauthorized?: () => void) => {
  try {
    cachedToken = await SecureStore.getItemAsync('jwt_token');
  } catch (err) {
    cachedToken = null;
  }

  setStorageAdapter({
    getItemSync: (key: string) => {
      if (key === 'token') return cachedToken;
      return null;
    },
    getItem: async (key: string) => {
      if (key === 'token') {
        try {
          const val = await SecureStore.getItemAsync('jwt_token');
          cachedToken = val;
          return val;
        } catch {
          return cachedToken;
        }
      }
      return await SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string) => {
      if (key === 'token') {
        cachedToken = value;
        await SecureStore.setItemAsync('jwt_token', value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    },
    removeItem: async (key: string) => {
      if (key === 'token') {
        cachedToken = null;
        await SecureStore.deleteItemAsync('jwt_token');
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    }
  });

  if (onUnauthorized) {
    setUnauthorizedCallback(onUnauthorized);
  }
};
