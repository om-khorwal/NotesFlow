/**
 * API Service - All backend API calls
 */

import { getToken, removeToken, removeUser } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token from auth module (in-memory + cookie fallback)
  const token = getToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Try to parse JSON, handle non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // Response is not JSON
      if (!response.ok) {
        throw new APIError(response.status, `Server error: ${response.statusText}`);
      }
      throw new APIError(0, 'Invalid response from server');
    }

    if (!response.ok) {
      // Handle 401 - redirect to login
      if (response.status === 401 && typeof window !== 'undefined') {
        removeToken();
        removeUser();
        window.location.href = '/login';
        throw new APIError(401, 'Unauthorized');
      }
      throw new APIError(response.status, data.detail || data.message || 'Request failed', data);
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    // Provide more context for network errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new APIError(0, `Network error: ${errorMessage}`);
  }
}

// Auth API
export const authAPI = {
  async login(email: string, password: string) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(username: string, email: string, password: string) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  async getProfile() {
    return request('/auth/profile');
  },

  async logout() {
    return request('/auth/logout', { method: 'POST' });
  },
};

// Notes API
export const notesAPI = {
  async getAll(params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return request(`/notes${queryString ? '?' + queryString : ''}`);
  },

  async getById(id: number) {
    return request(`/notes/${id}`);
  },

  async create(title: string, content: string = '', background_color?: string) {
    return request('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content, background_color }),
    });
  },

  async update(id: number, data: Partial<{ title: string; content: string; background_color: string; is_pinned: boolean }>) {
    return request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number) {
    return request(`/notes/${id}`, { method: 'DELETE' });
  },

  async togglePin(id: number) {
    return request(`/notes/${id}/pin`, { method: 'PUT' });
  },

  async setColor(id: number, color: string) {
    return request(`/notes/${id}/color`, {
      method: 'PUT',
      body: JSON.stringify({ color }),
    });
  },

  async createShareLink(id: number, expiresInDays?: number) {
    const params = expiresInDays ? `?expires_in_days=${expiresInDays}` : '';
    return request(`/notes/${id}/share${params}`, { method: 'POST' });
  },

  async revokeShareLink(id: number) {
    return request(`/notes/${id}/share`, { method: 'DELETE' });
  },
};

// Tasks API
export const tasksAPI = {
  async getAll(params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return request(`/tasks${queryString ? '?' + queryString : ''}`);
  },

  async getStats() {
    return request('/tasks/stats');
  },

  async getById(id: number) {
    return request(`/tasks/${id}`);
  },

  async create(data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
    background_color?: string;
  }) {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
    background_color: string;
    is_pinned: boolean;
  }>) {
    return request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number) {
    return request(`/tasks/${id}`, { method: 'DELETE' });
  },

  async togglePin(id: number) {
    return request(`/tasks/${id}/pin`, { method: 'PUT' });
  },

  async setColor(id: number, color: string) {
    return request(`/tasks/${id}/color`, {
      method: 'PUT',
      body: JSON.stringify({ color }),
    });
  },

  async createShareLink(id: number, expiresInDays?: number) {
    const params = expiresInDays ? `?expires_in_days=${expiresInDays}` : '';
    return request(`/tasks/${id}/share${params}`, { method: 'POST' });
  },

  async revokeShareLink(id: number) {
    return request(`/tasks/${id}/share`, { method: 'DELETE' });
  },
};

// Profile API
export const profileAPI = {
  async get() {
    return request('/profile');
  },

  async update(data: {
    avatar_url?: string;
    cover_photo_url?: string;
    display_name?: string;
    bio?: string;
    linkedin_url?: string;
    github_url?: string;
    twitter_url?: string;
    website_url?: string;
  }) {
    return request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async uploadAvatar(file: File) {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/profile/upload-avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return response.json();
  },

  async uploadCover(file: File) {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/profile/upload-cover`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return response.json();
  },
};

// Share API
export const shareAPI = {
  async getByToken(token: string) {
    return request(`/share/${token}`);
  },

  async getNoteByToken(token: string) {
    return request(`/share/note/${token}`);
  },

  async getTaskByToken(token: string) {
    return request(`/share/task/${token}`);
  },
};

export { APIError };
