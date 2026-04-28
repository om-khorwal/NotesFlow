/**
 * API Service — Supabase-only. No FastAPI backend required.
 */

import { supabase } from './supabase'
import { setUser, removeUser, mapSupabaseUser } from './auth'
import type { Note, Task, UserProfile } from './types'

// ─── helpers ────────────────────────────────────────────────────────────────

function generateShareToken(): string {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('')
}

class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// ─── auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new APIError(401, error.message)
    const user = mapSupabaseUser(data.user)
    setUser(user)
    return { success: true, data: { user } }
  },

  async register(username: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) throw new APIError(400, error.message)
    if (!data.user) throw new APIError(400, 'Registration failed')

    const user = mapSupabaseUser(data.user)
    setUser(user)

    // Ensure profile row exists (trigger should create it, but guard anyway)
    await supabase
      .from('user_profiles')
      .upsert({ user_id: data.user.id }, { onConflict: 'user_id' })

    return { success: true, data: { user } }
  },

  async getProfile() {
    const { data: { user: authUser }, error } = await supabase.auth.getUser()
    if (error || !authUser) throw new APIError(401, 'Not authenticated')
    const user = mapSupabaseUser(authUser)
    setUser(user)
    return { success: true, data: { user } }
  },

  async logout() {
    removeUser()
    await supabase.auth.signOut()
    return { success: true }
  },
}

// ─── notes ───────────────────────────────────────────────────────────────────

export const notesAPI = {
  async getAll(_params: Record<string, any> = {}) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new APIError(500, error.message)
    return {
      success: true,
      data: { notes: (data ?? []) as Note[], total: data?.length ?? 0 },
    }
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new APIError(404, 'Note not found')
    return { success: true, data: data as Note }
  },

  async create(
    title: string,
    content: string = '',
  ) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new APIError(401, 'Not authenticated')

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title,
        content,
      })
      .select()
      .single()

    if (error) throw new APIError(500, error.message)
    return { success: true, message: 'Note created successfully', data: data as Note }
  },

  async update(
    id: number,
    noteData: Partial<Pick<Note, 'title' | 'content' | 'background_color'>>,
  ) {
    const { data, error } = await supabase
      .from('notes')
      .update(noteData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new APIError(500, error.message)
    return { success: true, message: 'Note updated successfully', data: data as Note }
  },

  async delete(id: number) {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) throw new APIError(500, error.message)
    return { success: true, message: 'Note deleted successfully' }
  },

  async togglePin(id: number) {
    // Pinning not supported - is_pinned column doesn't exist
    // Return current note without modification
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new APIError(500, error.message)
    return { success: true, data: data as Note }
  },

  async setColor(id: number, color: string) {
    // Background color not supported - column doesn't exist
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new APIError(500, error.message)
    return { success: true, data: data as Note }
  },

  async createShareLink(id: number, expiresInDays?: number) {
    const token = generateShareToken()
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
      : null

    const { error } = await supabase
      .from('notes')
      .update({ share_token: token, is_public: true, share_expires_at: expiresAt })
      .eq('id', id)

    if (error) throw new APIError(500, error.message)
    return {
      success: true,
      data: {
        share_token: token,
        share_url: `/shared/${token}`,
        expires_at: expiresAt,
      },
    }
  },

  async revokeShareLink(id: number) {
    const { error } = await supabase
      .from('notes')
      .update({ share_token: null, is_public: false, share_expires_at: null })
      .eq('id', id)

    if (error) throw new APIError(500, error.message)
    return { success: true, message: 'Share link revoked successfully' }
  },
}

// ─── tasks ───────────────────────────────────────────────────────────────────

export const tasksAPI = {
  async getAll(_params: Record<string, any> = {}) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new APIError(500, error.message)
    return {
      success: true,
      data: { tasks: (data ?? []) as Task[], total: data?.length ?? 0 },
    }
  },

  async getStats() {
    const { data, error } = await supabase
      .from('tasks')
      .select('status, priority')

    if (error) throw new APIError(500, error.message)

    const statusCounts = { pending: 0, in_progress: 0, completed: 0 }
    const priorityCounts = { low: 0, medium: 0, high: 0 }

    for (const t of data ?? []) {
      if (t.status in statusCounts)
        statusCounts[t.status as keyof typeof statusCounts]++
      if (t.priority in priorityCounts)
        priorityCounts[t.priority as keyof typeof priorityCounts]++
    }

    return {
      success: true,
      data: { total: data?.length ?? 0, statusCounts, priorityCounts },
    }
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new APIError(404, 'Task not found')
    return { success: true, data: data as Task }
  },

  async create(taskData: {
    title: string
    status?: string
    due_date?: string
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new APIError(401, 'Not authenticated')

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: taskData.title,
        status: taskData.status ?? 'pending',
      })
      .select()
      .single()

    if (error) throw new APIError(500, error.message)
    return { success: true, message: 'Task created successfully', data: data as Task }
  },

  async update(
    id: number,
    taskData: Partial<{
      title: string
      status: string
      due_date: string | null
    }>,
  ) {
    const updatePayload: Record<string, unknown> = { ...taskData }

    // Mirror server-side completed_at logic
    if ('status' in taskData) {
      if (taskData.status === 'completed') {
        updatePayload.completed_at = new Date().toISOString()
      } else {
        updatePayload.completed_at = null
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new APIError(500, error.message)
    return { success: true, message: 'Task updated successfully', data: data as Task }
  },

  async delete(id: number) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw new APIError(500, error.message)
    return { success: true, message: 'Task deleted successfully' }
  },

  async togglePin(id: number) {
    // Pinning not supported - is_pinned column doesn't exist
    // Return current task without modification
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new APIError(500, error.message)
    return { success: true, data: data as Task }
  },

  async setColor(id: number, color: string) {
    // Background color not supported - column doesn't exist
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new APIError(500, error.message)
    return { success: true, data: data as Task }
  },

  async createShareLink(id: number, expiresInDays?: number) {
    const token = generateShareToken()
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
      : null

    const { error } = await supabase
      .from('tasks')
      .update({ share_token: token, is_public: true, share_expires_at: expiresAt })
      .eq('id', id)

    if (error) throw new APIError(500, error.message)
    return {
      success: true,
      data: {
        share_token: token,
        share_url: `/shared/${token}`,
        expires_at: expiresAt,
      },
    }
  },

  async revokeShareLink(id: number) {
    const { error } = await supabase
      .from('tasks')
      .update({ share_token: null, is_public: false, share_expires_at: null })
      .eq('id', id)

    if (error) throw new APIError(500, error.message)
    return { success: true, message: 'Share link revoked successfully' }
  },
}

// ─── profile ─────────────────────────────────────────────────────────────────

export const profileAPI = {
  async get() {
    const { data: { user: authUser }, error: authError } =
      await supabase.auth.getUser()
    if (authError || !authUser) throw new APIError(401, 'Not authenticated')

    // Ensure profile row exists
    await supabase
      .from('user_profiles')
      .upsert({ user_id: authUser.id }, { onConflict: 'user_id' })

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (error) throw new APIError(500, error.message)

    return {
      success: true,
      data: {
        user: mapSupabaseUser(authUser),
        profile: profile as UserProfile,
      },
    }
  },

  async update(profileData: {
    display_name?: string
    bio?: string
    avatar_url?: string
    cover_photo_url?: string
    linkedin_url?: string
    github_url?: string
    twitter_url?: string
    instagram_url?: string
    website_url?: string
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new APIError(401, 'Not authenticated')

    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw new APIError(500, error.message)
    return { success: true, data: { profile: data as UserProfile } }
  },

  async uploadAvatar(file: File) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new APIError(401, 'Not authenticated')

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `avatars/${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) throw new APIError(500, uploadError.message)

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(path)

    // Cache-bust so the browser fetches the new image
    const avatarUrl = `${publicUrl}?t=${Date.now()}`

    await supabase
      .from('user_profiles')
      .update({ avatar_url: avatarUrl })
      .eq('user_id', user.id)

    return { success: true, data: { avatar_url: avatarUrl } }
  },

  async uploadCover(file: File) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new APIError(401, 'Not authenticated')

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `covers/${user.id}/cover.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) throw new APIError(500, uploadError.message)

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(path)

    const coverUrl = `${publicUrl}?t=${Date.now()}`

    await supabase
      .from('user_profiles')
      .update({ cover_photo_url: coverUrl })
      .eq('user_id', user.id)

    return { success: true, data: { cover_photo_url: coverUrl } }
  },
}

// ─── share ────────────────────────────────────────────────────────────────────

export const shareAPI = {
  async getByToken(token: string) {
    // Try notes first (RLS enforces is_public + expiry check)
    const { data: note } = await supabase
      .from('notes')
      .select('title, content, background_color, created_at')
      .eq('share_token', token)
      .eq('is_public', true)
      .maybeSingle()

    if (note) {
      return {
        success: true,
        data: {
          type: 'note' as const,
          title: note.title,
          content: note.content,
          background_color: note.background_color,
          created_at: note.created_at,
        },
      }
    }

    // Then try tasks
    const { data: task } = await supabase
      .from('tasks')
      .select('title, description, status, priority, background_color, created_at')
      .eq('share_token', token)
      .eq('is_public', true)
      .maybeSingle()

    if (task) {
      return {
        success: true,
        data: {
          type: 'task' as const,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          background_color: task.background_color,
          created_at: task.created_at,
        },
      }
    }

    return {
      success: false,
      message: 'Shared item not found or link has expired',
    }
  },

  async getNoteByToken(token: string) {
    return this.getByToken(token)
  },

  async getTaskByToken(token: string) {
    return this.getByToken(token)
  },
}

export { APIError }
