/**
 * Authentication utilities
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

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
  setCookie('auth_token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  deleteCookie('auth_token');
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
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

