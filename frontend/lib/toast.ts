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

    const toast = document.createElement('div');
    toast.className = `
      transform translate-x-full opacity-0 transition-all duration-300 ease-out
      max-w-sm w-full bg-white dark:bg-dark-card rounded-lg shadow-lg border
      ${type === 'success' ? 'border-green-200 dark:border-green-800' : ''}
      ${type === 'error' ? 'border-red-200 dark:border-red-800' : ''}
      ${type === 'warning' ? 'border-yellow-200 dark:border-yellow-800' : ''}
      ${type === 'info' ? 'border-blue-200 dark:border-blue-800' : ''}
      p-4 flex items-start gap-3
    `.replace(/\s+/g, ' ').trim();

    const iconColor = {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500',
    }[type];

    const icons = {
      success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />',
      error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />',
      warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />',
      info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />',
    };

    toast.innerHTML = `
      <svg class="w-5 h-5 ${iconColor} flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${icons[type]}
      </svg>
      <p class="text-sm text-gray-700 dark:text-gray-200 flex-1">${this.escapeHtml(message)}</p>
      <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0" onclick="this.parentElement.remove()">
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
