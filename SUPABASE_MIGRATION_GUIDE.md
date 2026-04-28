# Supabase Migration Guide - Production Ready

## Overview

Your notes app has been fully migrated from FastAPI to Supabase. All frontend code now uses `@supabase/supabase-js` directly with zero backend server overhead.

---

## ✅ Current Status

### What's Complete

- ✅ **Supabase Client Setup** — `lib/supabase.ts` with proper browser client
- ✅ **All API Methods** — Full CRUD operations in `lib/api.ts` for notes, tasks, profiles
- ✅ **Auth Integration** — Login, register, logout in `lib/auth.ts` with session persistence
- ✅ **User-Based Queries** — All queries filtered by `user_id` (Supabase auth UUID)
- ✅ **File Uploads** — Avatar and cover photo uploads to Supabase Storage
- ✅ **Share Links** — Public sharing with token-based access and expiry
- ✅ **Server Middleware** — `middleware.ts` protects routes using server-side auth
- ✅ **Error Handling** — `APIError` class for consistent error handling
- ✅ **Frontend Components** — Login, Dashboard, Profile all using Supabase APIs

### What's Next (Production Readiness)

1. **Enable Row Level Security (RLS)** on all tables (SQL provided)
2. **Test All Features** using the testing checklist
3. **Remove FastAPI Backend** (still in repo)
4. **Deploy** to production
5. **Monitor** and verify everything works

---

## Step 1: Enable Row Level Security (RLS)

### Why RLS Matters

Without RLS, users could query each other's data via direct database calls. RLS policies ensure users can only access:
- Their own notes/tasks/profiles
- Public items (shared notes/tasks with valid tokens)

### How to Enable RLS

1. **Open Supabase Dashboard** → Your Project → SQL Editor
2. **Copy all SQL from** `RLS_POLICIES.sql`
3. **Run the SQL** in the editor
4. **Verify** RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname='public' AND tablename IN ('notes', 'tasks', 'user_profiles');
   ```
   Result should show `rowsecurity = true` for all three tables.

### What RLS Policies Do

| Table | Policy | Effect |
|-------|--------|--------|
| **notes** | `users_can_select_own_notes` | Users can only see their own notes |
| **notes** | `users_can_select_public_notes` | Anyone can see public notes with valid tokens |
| **notes** | `users_can_insert_own_notes` | Users can only create notes for themselves |
| **notes** | `users_can_update_own_notes` | Users can only modify their own notes |
| **notes** | `users_can_delete_own_notes` | Users can only delete their own notes |
| **tasks** | (same pattern as notes) | Same row-level isolation |
| **user_profiles** | (same pattern) | Users can only access their own profile |

---

## Step 2: Test All Features

### Before Testing

1. **Ensure .env files are set:**
   - `frontend/.env.local` should have `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `frontend/.env.production` should have the same values
2. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```
3. **Start dev server:**
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:3000`

### Testing Checklist

#### Authentication ✅
- [ ] **Signup:** Create new account with email/password
  - User created in `auth.users`
  - User profile auto-created in `user_profiles` (via trigger)
  - Email verification sent (if configured in Supabase)
  
- [ ] **Login:** Sign in with registered email
  - Session token stored in browser cookies
  - `initUser()` called, user cached in memory
  - Redirected to `/dashboard`
  
- [ ] **Logout:** Sign out from profile page
  - Session cleared
  - Cookies deleted
  - Redirected to `/login`
  
- [ ] **Session Persistence:** Refresh browser on authenticated page
  - User stays logged in (middleware restores session)
  - No need to sign in again

#### Notes CRUD ✅
- [ ] **Create Note:** Click "New Note" on dashboard
  - Note appears in list
  - Note has correct `user_id` (your UUID)
  - Defaults: white background, not pinned, not public
  
- [ ] **Read Notes:** View list on dashboard
  - Only your notes shown (RLS policy)
  - Sorted by pinned status, then by updated date
  
- [ ] **Update Note:** Edit note title/content
  - Changes saved immediately
  - `updated_at` timestamp updates
  - Background color change works
  
- [ ] **Delete Note:** Remove a note
  - Note disappears from list
  - Confirmed deleted from database
  
- [ ] **Pin Note:** Click pin icon
  - Pinned notes appear at top
  - Pin state persists after refresh

#### Tasks CRUD ✅
- [ ] **Create Task:** Click "New Task"
  - Task appears with correct user_id
  - Status defaults to "pending"
  - Priority defaults to "medium"
  
- [ ] **Update Task Status:** Change task status to "in_progress" → "completed"
  - `completed_at` timestamp set on completion
  - Status updates persist
  
- [ ] **Update Task Priority:** Change priority from medium → high
  - Priority field updates
  
- [ ] **Delete Task:** Remove a task
  - Task disappears from list
  
- [ ] **Pin Task:** Toggle pin on task
  - Pinned tasks appear first

#### Profile Management ✅
- [ ] **View Profile:** Go to `/profile`
  - User info (username, email) displayed correctly
  - Display name loaded from profile
  - Bio displayed
  
- [ ] **Edit Profile:** Click "Edit Profile"
  - Update display name and bio
  - Changes saved
  - Sticky save button appears while editing
  
- [ ] **Upload Avatar:** Select image file
  - Preview shown before saving
  - File uploaded to Supabase Storage (`profiles/avatars/`)
  - URL saved to profile, displayed with avatar
  
- [ ] **Upload Cover Photo:** Select cover image
  - Preview shown
  - File uploaded to Storage (`profiles/covers/`)
  - URL saved and displayed
  
- [ ] **Update Social Links:** Add LinkedIn/GitHub/Twitter URLs
  - Links saved to profile
  - Persisted after page refresh

#### Share Links ✅
- [ ] **Create Share Link for Note:**
  - Note becomes public (`is_public = true`)
  - Token generated and saved
  - Share URL accessible: `/shared/{token}`
  
- [ ] **View Shared Note (Public):**
  - Open share link in incognito/different browser
  - See note content without login
  - Note is read-only
  
- [ ] **Revoke Share Link:**
  - Make note private again
  - Share link no longer works
  - Trying to access returns "not found"
  
- [ ] **Share Link Expiry (Optional):**
  - Set note to expire in 1 day
  - Wait 1+ day
  - Verify link returns "expired"

#### Data Isolation (RLS) ✅
- [ ] **Cross-User Data Isolation:**
  - Sign up as User A, create a note
  - Sign up as User B, view notes
  - User B **cannot** see User A's notes (RLS policy blocks)
  - User B **can** see shared notes from User A if public
  
- [ ] **Profile Isolation:**
  - Sign in as User A, view profile
  - Only User A's profile loads (not other users')
  
- [ ] **Task Isolation:**
  - Sign in as User A, create tasks
  - Sign in as User B
  - User B's task list is empty (RLS policy)

#### Error Handling ✅
- [ ] **Network Error:** Disconnect network, try CRUD operation
  - Error message shown to user
  - No silent failures
  - User can retry
  
- [ ] **Auth Error:** Try to access protected route without login
  - Middleware redirects to `/login`
  - No data exposed
  
- [ ] **Invalid Input:** Create note with empty title
  - Client-side validation (if present) warns user
  - Or API rejects gracefully
  
- [ ] **Database Error:** (Simulate with RLS policy test)
  - User tries direct SQL query to access other user's data
  - RLS policy blocks with "permission denied" error

#### File Uploads ✅
- [ ] **Avatar Upload:**
  - Upload small image (<5MB)
  - Image appears immediately in profile
  - Image persists after logout/login
  
- [ ] **Cover Photo Upload:**
  - Upload image
  - Displayed as cover
  - File stored at `profiles/covers/{user_id}/cover.ext`
  
- [ ] **Storage Bucket (Public):**
  - Verify `profiles` bucket is set to public
  - Public URLs are accessible without auth
  - Images load in browser/email

---

## Step 3: Remove Old FastAPI Backend

The old backend is no longer needed. Remove it:

```bash
# Remove backend directory
rm -rf backend-fastapi

# Remove the SQL cleanup file (if it exists)
rm -f clean.sql

# Verify it's gone
ls -la /path/to/notes-app
# Should NOT show backend-fastapi directory
```

Then commit:

```bash
git add -A
git commit -m "Remove deprecated FastAPI backend — using Supabase only"
git push
```

---

## Step 4: Deploy to Production

### Frontend Hosting Options

Choose one:

#### A. **Vercel** (Recommended)
1. Push code to GitHub
2. Connect repo at https://vercel.com
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy with `npm run build`
5. Gets automatic preview deployments for PRs

#### B. **Netlify**
1. Push code to GitHub
2. Connect at https://netlify.com
3. Build command: `cd frontend && npm run build`
4. Publish directory: `frontend/.next`
5. Set same environment variables
6. Deploy

#### C. **Self-Hosted (Docker)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY frontend/ .
RUN npm ci && npm run build
CMD ["npm", "run", "start:prod"]
```

### Supabase Production Checklist

- [ ] **RLS Enabled** on all tables (see Step 1)
- [ ] **Auth Configured:**
  - Email provider enabled
  - Email templates customized (optional)
  - SMTP configured (optional) or use Supabase defaults
- [ ] **Storage Bucket:**
  - `profiles` bucket created and set to **public**
  - CORS configured (if needed)
- [ ] **Database Backups:**
  - Verify automated daily backups enabled (default)
  - Check backup retention (30 days default)
- [ ] **Rate Limiting:**
  - Supabase has built-in rate limits
  - Monitor usage in dashboard

### Environment Variables

**Production (.env.production):**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

These are **public** and safe to commit. The anon key has RLS policies enforcing access.

---

## Step 5: Error Handling Best Practices

### Current Error Handling in Code

**lib/api.ts:**
```typescript
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}
```

### Common Error Scenarios

| Scenario | Error | Handling |
|----------|-------|----------|
| User not auth'd | 401 | Redirect to `/login` |
| User tries to access other's data | 403 | RLS policy blocks (permission denied) |
| Note not found | 404 | Show "Not found" toast |
| Database error | 500 | Show generic "Something went wrong" |
| Network offline | Network Error | Show offline message, retry button |
| File too large | 413 | Show "File too large" |
| Invalid input | 400 | Show validation error |

### Adding Better Error Messages

For production, enhance error handling in **lib/api.ts**:

```typescript
// Map Supabase errors to user-friendly messages
function mapErrorMessage(error: any): string {
  if (error.message?.includes('permission denied')) {
    return 'You do not have permission to access this'
  }
  if (error.message?.includes('not found')) {
    return 'Item not found'
  }
  if (error.message?.includes('unique violation')) {
    return 'This item already exists'
  }
  return error.message || 'Something went wrong'
}

// Use in error handling:
try {
  // ...
} catch (error: any) {
  throw new APIError(400, mapErrorMessage(error))
}
```

### Monitoring & Logging

For production monitoring:

1. **Supabase Dashboard** → Logs tab
   - View all database activity
   - Check auth logs
   - Monitor storage operations

2. **Set Up Alerts** (optional):
   - High error rate
   - Storage quota exceeded
   - Auth failures

3. **Client-Side Analytics** (optional):
   - Track errors with Sentry/LogRocket
   - Monitor user sessions
   - Track feature usage

---

## Step 6: Production Monitoring Checklist

### Daily Checks

- [ ] **Auth Working** — Test signup/login
- [ ] **Notes/Tasks** — Create and edit items
- [ ] **Sharing** — Verify shared links work
- [ ] **Uploads** — Test avatar/cover uploads
- [ ] **No Errors** — Check browser console for errors

### Weekly Checks

- [ ] **Database Size** → Supabase Dashboard → Settings
- [ ] **Auth Metrics** → Auth → Activity
- [ ] **Error Logs** → Logs tab (any 5xx errors?)
- [ ] **User Feedback** → Any reported issues?

### Monthly Reviews

- [ ] **RLS Policies** — Still correct?
- [ ] **Rate Limits** — Any issues?
- [ ] **Backups** — Verified recently?
- [ ] **Costs** — Within budget?
- [ ] **Security** — Any suspicious activity?

---

## Appendix: Useful Supabase Commands

### Check Database Connections
```sql
SELECT count(*) as active_connections FROM pg_stat_activity;
```

### View RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('notes', 'tasks', 'user_profiles');
```

### Check User Count
```sql
SELECT count(*) FROM auth.users;
```

### View Recent Auth Activity
```sql
SELECT id, email, created_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Storage Usage
```sql
SELECT bucket_id, sum(metadata->'size')::bigint as total_size 
FROM storage.objects 
GROUP BY bucket_id;
```

---

## FAQ

**Q: Can I use this app without Supabase?**
A: No, the app is tightly integrated with Supabase Auth and DB. No FastAPI backend exists anymore.

**Q: Is my data secure?**
A: Yes, RLS policies enforce row-level access control. Users can only see their own data + shared public items.

**Q: What if Supabase goes down?**
A: App becomes unavailable (no local fallback). Consider multi-region backup for critical apps.

**Q: Can I export my data?**
A: Yes, Supabase allows full database exports. Contact support for data extraction.

**Q: How much does it cost?**
A: Supabase free tier includes:
- Up to 500MB DB storage
- 2GB bandwidth/month
- Unlimited API requests (rate limited)
- Paid plans start at $25/month for more storage/auth users.

**Q: How do I add new features?**
A: Add API methods to `lib/api.ts`, use them in components. RLS policies protect data automatically.

---

## Summary

Your app is now **fully serverless** ✨

- **Zero backend maintenance** — No servers to manage
- **Built-in security** — RLS policies enforce access control
- **Automatic scaling** — Supabase handles load
- **Real-time ready** — Easy to add real-time features later with Supabase subscriptions
- **Portable** — All data in PostgreSQL, easy to migrate

**Next Steps:**
1. Enable RLS policies (Step 1)
2. Run full testing (Step 2)
3. Remove old backend (Step 3)
4. Deploy to production (Step 4)
5. Monitor and maintain (Step 5)

---

**Questions?** Check Supabase docs: https://supabase.com/docs
