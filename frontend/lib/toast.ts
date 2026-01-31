/**
 * Toast notification utilities
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

class ToastManager {
  private container: HTMLElement | null = null;

  private init() {
    if (this.container || typeof window === 'undefined') return;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'fixed top-20 right-4 z-[100] flex flex-col gap-2';
    document.body.appendChild(this.container);
  }

  show(message: string, type: ToastType = 'info', duration: number = 4000) {
    this.init();
    if (!this.container) return;

    const isDark = document.documentElement.classList.contains('dark');

    const toast = document.createElement('div');
    toast.className = `
      transform translate-x-full opacity-0 transition-all duration-300 ease-out
      max-w-sm w-full backdrop-blur-xl ${isDark ? 'bg-slate-900/95' : 'bg-white/95 shadow-lg'} rounded-xl shadow-2xl border
      ${type === 'success' ? (isDark ? 'border-green-500/30' : 'border-green-300') : ''}
      ${type === 'error' ? (isDark ? 'border-red-500/30' : 'border-red-300') : ''}
      ${type === 'warning' ? (isDark ? 'border-yellow-500/30' : 'border-yellow-300') : ''}
      ${type === 'info' ? (isDark ? 'border-blue-500/30' : 'border-blue-300') : ''}
      p-4 flex items-start gap-3
    `.replace(/\s+/g, ' ').trim();

    const iconColor = {
      success: 'text-green-400',
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400',
    }[type];

    const icons = {
      success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />',
      error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />',
      warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />',
      info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
    };

    const textColor = isDark ? 'text-white' : 'text-zinc-900';
    const closeColor = isDark ? 'text-white/50 hover:text-white' : 'text-zinc-400 hover:text-zinc-700';

    toast.innerHTML = `
      <svg class="w-5 h-5 ${iconColor} flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${icons[type]}
      </svg>
      <p class="text-sm ${textColor} flex-1">${this.escapeHtml(message)}</p>
      <button class="${closeColor} flex-shrink-0 transition-colors" onclick="this.parentElement.remove()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    `;

    this.container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
    });

    // Auto remove
    setTimeout(() => {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export const toast = new ToastManager();
