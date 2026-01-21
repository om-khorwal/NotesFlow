/**
 * Theme management utilities
 */

const STORAGE_KEY = 'theme';

export type Theme = 'light' | 'dark';

export const getTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';

  const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (savedTheme) return savedTheme;

  // Check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
};

export const setTheme = (theme: Theme): void => {
  if (typeof window === 'undefined') return;

  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  localStorage.setItem(STORAGE_KEY, theme);
};

export const toggleTheme = (): Theme => {
  const currentTheme = getTheme();
  const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
};

export const initTheme = (): void => {
  if (typeof window === 'undefined') return;

  const theme = getTheme();
  document.documentElement.classList.add(theme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
};
