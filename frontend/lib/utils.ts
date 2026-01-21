/**
 * General utility functions
 */

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const truncate = (str: string, length: number = 100): string => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getInitials = (name: string): string => {
  if (!name) return 'U';
  const parts = name.split(/\s+|@/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const adjustColorForDarkMode = (color: string): string => {
  const colorMap: Record<string, string> = {
    '#FFFFFF': '#1e293b',
    '#FFF9C4': '#3d3815',
    '#FFCDD2': '#3d1a1e',
    '#C8E6C9': '#1a3d1c',
    '#BBDEFB': '#1a2d3d',
    '#E1BEE7': '#2d1a3d',
    '#FFE0B2': '#3d2a15',
    '#F5F5F5': '#2d3748',
  };
  return colorMap[color] || '#1e293b';
};

export const NOTE_COLORS = [
  '#FFFFFF',
  '#FFF9C4',
  '#FFCDD2',
  '#C8E6C9',
  '#BBDEFB',
  '#E1BEE7',
  '#FFE0B2',
  '#F5F5F5',
];

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
