-- Migration 001: Schema Updates for NotesFlow Overhaul
-- Adds user_profiles table and new columns for notes and tasks

-- New table: user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    instagram_url VARCHAR(255),
    website_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add columns to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#FFFFFF';
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS share_token VARCHAR(64) UNIQUE;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMP;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Add columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#FFFFFF';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;

-- Create index for share_token lookups
CREATE INDEX IF NOT EXISTS idx_notes_share_token ON notes(share_token) WHERE share_token IS NOT NULL;

-- Create index for pinned items
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_tasks_is_pinned ON tasks(is_pinned) WHERE is_pinned = TRUE;

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE user_profiles IS 'Stores extended user profile information';
COMMENT ON COLUMN notes.background_color IS 'Hex color code for note card background';
COMMENT ON COLUMN notes.is_pinned IS 'Whether the note is pinned to the top';
COMMENT ON COLUMN notes.share_token IS 'Unique token for public sharing';
COMMENT ON COLUMN notes.share_expires_at IS 'When the share link expires (NULL = never)';
COMMENT ON COLUMN notes.is_public IS 'Whether the note is publicly accessible';
COMMENT ON COLUMN tasks.background_color IS 'Hex color code for task card background';
COMMENT ON COLUMN tasks.is_pinned IS 'Whether the task is pinned to the top';
