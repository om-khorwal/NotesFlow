# Error Handling Patterns

This document explains error handling in the Supabase-based frontend.

## Quick Reference

### The APIError Class

```typescript
// Defined in lib/api.ts
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}
```

All API methods throw `APIError` with:
- `status`: HTTP-like status code (401, 404, 500, etc.)
- `message`: User-friendly error message

### Using try/catch

```typescript
try {
  const result = await notesAPI.create('My Note', 'Content here')
  console.log('Note created:', result.data)
} catch (error: any) {
  if (error.status === 401) {
    // User not authenticated
    window.location.href = '/login'
  } else if (error.status === 404) {
    // Note not found
    toast.error('Note not found')
  } else if (error.status === 500) {
    // Server error
    toast.error('Failed to create note. Please try again.')
  } else {
    // Unknown error
    toast.error(error.message || 'Something went wrong')
  }
}
```

## Common Error Codes

| Code | Scenario | How to Handle |
|------|----------|---------------|
| 401 | User not authenticated | Redirect to `/login` |
| 403 | Permission denied (RLS) | Show "Access denied" message |
| 404 | Resource not found | Show "Not found" toast |
| 400 | Bad request / validation | Show validation error |
| 413 | Payload too large | Show "File too large" message |
| 500 | Database/server error | Show "Try again later" message |
| Network | Offline / timeout | Show offline indicator |

## Error Handling by Feature

### Authentication Errors

```typescript
try {
  await authAPI.login(email, password)
} catch (error: any) {
  if (error.status === 401) {
    toast.error('Invalid email or password')
  } else if (error.message?.includes('Email not confirmed')) {
    toast.error('Please verify your email first')
  } else {
    toast.error('Login failed. Please try again.')
  }
}
```

### CRUD Errors

```typescript
// CREATE
try {
  await notesAPI.create(title, content)
} catch (error: any) {
  toast.error('Failed to create note')
}

// READ
try {
  const note = await notesAPI.getById(id)
} catch (error: any) {
  if (error.status === 404) {
    toast.error('Note not found')
  }
}

// UPDATE
try {
  await notesAPI.update(id, { title: 'New Title' })
} catch (error: any) {
  toast.error('Failed to update note')
}

// DELETE
try {
  await notesAPI.delete(id)
} catch (error: any) {
  toast.error('Failed to delete note')
}
```

### File Upload Errors

```typescript
try {
  const result = await profileAPI.uploadAvatar(file)
  toast.success('Avatar uploaded')
} catch (error: any) {
  if (error.message?.includes('too large')) {
    toast.error('File too large. Max 5MB.')
  } else if (error.message?.includes('storage')) {
    toast.error('Storage quota exceeded')
  } else {
    toast.error('Failed to upload file')
  }
}
```

### Share Link Errors

```typescript
try {
  const result = await notesAPI.createShareLink(noteId, 7)
} catch (error: any) {
  toast.error('Failed to create share link')
}

// When viewing shared item
try {
  const item = await shareAPI.getByToken(token)
  if (!item.success) {
    return <div>Link expired or not found</div>
  }
} catch (error: any) {
  return <div>Error loading shared item</div>
}
```

## Best Practices

### 1. Always Catch Errors

❌ **Bad:**
```typescript
const note = await notesAPI.create(title, content)
setNotes([...notes, note])
```

✅ **Good:**
```typescript
try {
  const result = await notesAPI.create(title, content)
  setNotes([...notes, result.data])
  toast.success('Note created')
} catch (error: any) {
  toast.error(error.message || 'Failed to create note')
}
```

### 2. Provide User-Friendly Messages

❌ **Bad:**
```typescript
toast.error(error.message) // Might show: "FOREIGN KEY constraint failed"
```

✅ **Good:**
```typescript
toast.error('Failed to create note. Please try again.')
```

### 3. Disable Forms During Loading

```typescript
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  setIsLoading(true)
  try {
    await notesAPI.create(...)
  } catch (error) {
    toast.error(error.message)
  } finally {
    setIsLoading(false)
  }
}

return (
  <button disabled={isLoading} type="submit">
    {isLoading ? 'Saving...' : 'Save'}
  </button>
)
```

### 4. Retry Logic for Transient Errors

```typescript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      if (i === maxRetries - 1) throw error
      // Retry on network errors or 5xx
      if (!error.status || error.status >= 500) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
        continue
      }
      throw error
    }
  }
}

// Usage:
try {
  const notes = await retryWithBackoff(() => notesAPI.getAll())
} catch (error) {
  toast.error('Failed to load notes')
}
```

### 5. Validation Before API Calls

```typescript
// Validate client-side BEFORE calling API
const validateForm = (formData) => {
  if (!formData.title.trim()) {
    throw new Error('Title is required')
  }
  if (formData.title.length > 200) {
    throw new Error('Title must be under 200 characters')
  }
  return true
}

const handleSubmit = async (formData) => {
  try {
    validateForm(formData)
    await notesAPI.create(formData.title, formData.content)
    toast.success('Note created')
  } catch (error: any) {
    toast.error(error.message)
  }
}
```

### 6. Network Status Indicator

```typescript
const [isOnline, setIsOnline] = useState(navigator.onLine)

useEffect(() => {
  const handleOnline = () => setIsOnline(true)
  const handleOffline = () => setIsOnline(false)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}, [])

if (!isOnline) {
  return <div className="bg-red-500 p-4">You are offline</div>
}
```

## RLS (Row Level Security) Errors

If users encounter "permission denied" errors, it means RLS policies are working:

```
Error: permission denied for schema public
```

**What it means:**
- User tried to access data they don't own
- RLS policy blocked the request
- This is **expected and correct** behavior

**Example scenario:**
- User A tries to read User B's notes directly via query
- RLS policy checks: `auth.uid() = user_id` (User A's UUID ≠ User B's UUID)
- Policy denies access
- Error thrown

## Testing Error Handling

### Manual Testing

1. **Test 401 (Not Authenticated):**
   - Clear cookies: `document.cookie = ''`
   - Try to access protected route
   - Should redirect to `/login`

2. **Test 404 (Not Found):**
   - Try to fetch non-existent note: `notesAPI.getById(999999)`
   - Should throw APIError with status 404

3. **Test RLS (Permission Denied):**
   - Sign in as User A
   - In browser console: Try to query User B's notes
   - Should be blocked by RLS policy

4. **Test Network Error:**
   - Go offline (DevTools → Network → Offline)
   - Try to create a note
   - Should show error message

5. **Test File Upload:**
   - Upload large file (>5MB)
   - Should show error

### Automated Testing

```typescript
// Example test with Jest
describe('Error Handling', () => {
  test('should catch 404 errors', async () => {
    try {
      await notesAPI.getById(999999)
      fail('Should have thrown error')
    } catch (error: any) {
      expect(error.status).toBe(404)
      expect(error.message).toBe('Note not found')
    }
  })

  test('should catch auth errors', async () => {
    try {
      await notesAPI.create('Title', 'Content') // No user auth
      fail('Should have thrown error')
    } catch (error: any) {
      expect(error.status).toBe(401)
    }
  })
})
```

## Monitoring & Debugging

### Enable Supabase Logging

```typescript
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Enable logging in development
if (process.env.NODE_ENV === 'development') {
  // Supabase logs go to browser console
}
```

### Check Supabase Logs

1. **Dashboard** → Your Project → Logs tab
2. Filter by:
   - API calls (REST)
   - Auth events
   - Storage operations
   - Errors

### Browser DevTools

```typescript
// In browser console:
// Check if user is authenticated
localStorage.getItem('sb-cviuaxfmwqlhzbgawfzq-auth-token')

// Check current user
supabase.auth.getUser().then(r => console.log(r))

// Check RLS policies
// (Run in Supabase SQL Editor, not browser console)
```

## Summary

- **Always catch errors** with try/catch
- **Use user-friendly messages** (not raw error text)
- **Provide retry options** for transient errors
- **Validate before API calls** to catch issues early
- **RLS errors are good** — they mean security is working
- **Monitor Supabase logs** for debugging production issues
