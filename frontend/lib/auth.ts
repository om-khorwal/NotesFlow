/**
 * Authentication utilities
 * Uses in-memory state + secure cookies only (no localStorage/sessionStorage)
 */

/**
 * Check if we're in a production environment.
 * Uses HTTPS protocol as the indicator.
 */
const isProduction = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:';
};

/**
 * Cookie helpers for middleware support.
 * Automatically configures secure cookies for HTTPS in production.
 */
const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();

  // Build cookie string with production-safe defaults
  let cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;

  // Add secure flag for HTTPS
  if (isProduction()) {
    cookieString += '; Secure';
  }

  // SameSite attribute for CSRF protection
  cookieString += '; SameSite=Lax';

  document.cookie = cookieString;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') return;

  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

  // Add secure flag for HTTPS
  if (isProduction()) {
    cookieString += '; Secure';
  }

  cookieString += '; SameSite=Lax';

  document.cookie = cookieString;
};

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

// In-memory auth state (secure - not accessible via DevTools Storage tab)
let inMemoryToken: string | null = null;
let inMemoryUser: User | null = null;

export const getToken = (): string | null => {
  // First check in-memory, then fallback to cookie for initial page load
  if (inMemoryToken) return inMemoryToken;
  if (typeof window === 'undefined') return null;
  const cookieToken = getCookie('auth_token');
  if (cookieToken) {
    inMemoryToken = cookieToken; // Cache in memory
  }
  return cookieToken;
};

export const setToken = (token: string): void => {
  inMemoryToken = token;
  setCookie('auth_token', token);
};

export const removeToken = (): void => {
  inMemoryToken = null;
  deleteCookie('auth_token');
};

export const getUser = (): User | null => {
  return inMemoryUser;
};

export const setUser = (user: User): void => {
  inMemoryUser = user;
};

export const removeUser = (): void => {
  inMemoryUser = null;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const logout = (): void => {
  removeToken();
  removeUser();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const requireAuth = (): boolean => {
  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
  return true;
};

export const redirectIfAuth = (router: { replace: (path: string) => void }) => {
  if (isAuthenticated()) {
    router.replace('/dashboard');
  }
};
