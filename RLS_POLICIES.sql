-- ============================================================================
-- Row Level Security (RLS) Policies for Notes App
-- ============================================================================
-- Run all these policies in your Supabase SQL editor to enable RLS on all tables
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. NOTES TABLE RLS
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on notes table
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own notes
CREATE POLICY "users_can_select_own_notes"
ON notes FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can SELECT public notes (shared)
CREATE POLICY "users_can_select_public_notes"
ON notes FOR SELECT
USING (
  is_public = true
  AND (share_expires_at IS NULL OR share_expires_at > NOW())
);

-- Policy: Users can INSERT their own notes
CREATE POLICY "users_can_insert_own_notes"
ON notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own notes
CREATE POLICY "users_can_update_own_notes"
ON notes FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE their own notes
CREATE POLICY "users_can_delete_own_notes"
ON notes FOR DELETE
USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TASKS TABLE RLS
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own tasks
CREATE POLICY "users_can_select_own_tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can SELECT public tasks (shared)
CREATE POLICY "users_can_select_public_tasks"
ON tasks FOR SELECT
USING (
  is_public = true
  AND (share_expires_at IS NULL OR share_expires_at > NOW())
);

-- Policy: Users can INSERT their own tasks
CREATE POLICY "users_can_insert_own_tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own tasks
CREATE POLICY "users_can_update_own_tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE their own tasks
CREATE POLICY "users_can_delete_own_tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. USER_PROFILES TABLE RLS
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own profile
CREATE POLICY "users_can_select_own_profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can UPDATE their own profile
CREATE POLICY "users_can_update_own_profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can INSERT their own profile (for upsert operations)
CREATE POLICY "users_can_insert_own_profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES
-- ─────────────────────────────────────────────────────────────────────────────

-- Verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';

-- Check all policies for a table:
-- SELECT schemaname, tablename, policyname, permissive FROM pg_policies WHERE tablename='notes';
