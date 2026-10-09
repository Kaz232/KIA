/**
 * Safe Browser Storage Utility for GAG Visual Core OS
 * Prevents SecurityError or DOMException when cookies/storage are restricted in iframes
 * and gracefully falls back to an in-memory storage dictionary.
 */

const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // In-memory fallback
    }
    return memoryStore[key] ?? null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // In-memory fallback
    }
    memoryStore[key] = value;
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // In-memory fallback
    }
    delete memoryStore[key];
  },

  getParsed: <T>(key: string, fallback: T): T => {
    try {
      const raw = safeStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  setParsed: <T>(key: string, value: T): void => {
    try {
      safeStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore
    }
  },
};
