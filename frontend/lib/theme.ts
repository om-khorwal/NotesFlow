const STORAGE_KEY = 'theme';
export type Theme = 'light' | 'dark';

export const getTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

export const initTheme = (): void => {
  if (typeof window === 'undefined') return;

  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const theme: Theme = saved ?? (prefersDark ? 'dark' : 'light');

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const toggleTheme = (): Theme => {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');

  const newTheme: Theme = isDark ? 'light' : 'dark';

  if (newTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  localStorage.setItem(STORAGE_KEY, newTheme);
  return newTheme;
};
