/**
 * Type definitions for the application
 */

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  background_color: string;
  is_pinned: boolean;
  share_token: string | null;
  share_expires_at: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  background_color: string;
  is_pinned: boolean;
  share_token: string | null;
  share_expires_at: string | null;
  is_public: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  avatar_url: string | null;
  cover_photo_url: string | null;
  display_name: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
}

export interface SharedItem {
  type: 'note' | 'task';
  title: string;
  content?: string;
  description?: string;
  status?: string;
  priority?: string;
  background_color: string;
  created_at: string;
}
