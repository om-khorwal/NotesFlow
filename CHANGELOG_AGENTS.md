# CHANGELOG_AGENTS.md

This file tracks all significant changes made by AI agents to the codebase.

## LOG ENTRIES:

- **[2026-01-28] [Frontend Agent]:** Fix NoteCard/TaskCard Action Button Overflow & Replace Auto-save with Explicit Save Buttons
  - **Changes:**
    - Modified `/home/thunder/code/notes-app/frontend/app/dashboard/page.tsx`
  - **Why:**
    - **Fixed Action Button Overflow Issue:**
      - Added `flex-shrink-0` class to action buttons container (div with space-x-1) in both NoteCard and TaskCard components
      - This prevents action buttons (pin, color picker, share, delete) from being compressed or overflowing when the card content is being edited
      - The title input can now shrink appropriately while action buttons maintain their size
    - **Replaced Silent Auto-save with Explicit Save Buttons (NoteCard):**
      - Removed debounced auto-save behavior that triggered on blur (users found it unreliable)
      - Added visible Save and Cancel buttons that appear when `isEditing === true`
      - Save button calls `handleSave()` immediately (no debounce) to persist title and content changes
      - Cancel button calls `handleCancel()` to discard changes and reset to original values
      - Added `useEffect` hook to reset local state (title/content) when note prop changes
      - Textarea no longer has `onBlur` handler that auto-saved
    - **Replaced Silent Auto-save with Explicit Save Buttons (TaskCard):**
      - Removed `onBlur={handleSave}` from both title input and description textarea
      - Added visible Save and Cancel buttons that appear when `isEditing === true`
      - Save button calls `handleSave()` to persist title and description changes
      - Cancel button calls `handleCancel()` to discard changes and reset to original values
      - Status and Priority dropdowns remain instant-update (using `onQuickUpdate`) as they are quick actions, not text editing
      - Added `useEffect` hook to reset local state (title/description/status) when task prop changes
    - **Button Styling:**
      - Save button: `bg-indigo-600 hover:bg-indigo-500` with white text
      - Cancel button: `bg-white/10 hover:bg-white/20` with white text
      - Both buttons use `onClick={(e) => { e.stopPropagation(); handleSave/Cancel(); }}` to prevent card click handlers from interfering
  - **Status:** COMPLETED

- **[2026-01-28] [Backend Agent]:** Fix CORS Headers on Error Responses (500 & 422)
  - **Changes:**
    - Modified `/home/thunder/code/notes-app/backend-fastapi/app/main.py`
  - **Why:**
    - Browser was blocking 500 and 422 error responses with "No 'Access-Control-Allow-Origin' header" error
    - When `general_exception_handler` and `validation_exception_handler` create `JSONResponse` directly, they bypass the FastAPI CORS middleware
    - Added explicit CORS headers (`Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials`) to both exception handlers
    - Implemented origin validation: headers are only added if the request's `Origin` header matches an entry in `settings.cors_origins_list`
    - This ensures error messages from backend (e.g., database connection errors, validation failures) now reach the frontend instead of being blocked by the browser's CORS policy
    - Response body structure and status codes remain unchanged, only headers were added
  - **Status:** COMPLETED

- **[2026-01-22] [Frontend Agent]:** Delete Confirmation Dialog & Toast Dark Mode Styling
  - **Changes:**
    - Modified `/home/thunder/code/notes-app/frontend/app/dashboard/page.tsx`
    - Modified `/home/thunder/code/notes-app/frontend/lib/toast.ts`
  - **Why:**
    - **Delete Confirmation Dialog:** Replaced browser's native `confirm()` with a custom modal dialog component that provides better UX and visual consistency:
      - Added `DeleteDialog` component with proper accessibility (ARIA labels, role attributes)
      - Implemented centered modal with dark backdrop (`bg-black/60` with backdrop-blur)
      - Added Framer Motion animations for smooth entrance/exit transitions
      - Included focus trapping (prevents body scroll when open)
      - Keyboard support (ESC key to cancel)
      - Shows item title in the dialog for context
      - Two-button layout: Cancel (neutral) and Delete (destructive red styling)
      - Matches existing glassmorphism dark theme aesthetic
      - Dialog does NOT close on backdrop click (prevents accidental dismissal)
    - **Toast Dark Mode Styling:** Updated toast notifications to properly match the dark-themed UI:
      - Changed background from white to `backdrop-blur-xl bg-slate-900/95` for consistency with app theme
      - Updated border colors to use semi-transparent colored borders (`border-green-500/30`, etc.)
      - Changed text color from `text-gray-700` to `text-white` for proper contrast
      - Updated icon colors to lighter variants (`text-green-400` instead of `text-green-500`)
      - Enhanced close button hover states with `text-white/50 hover:text-white`
      - Improved shadow with `shadow-2xl` for better depth perception
      - Changed border radius from `rounded-lg` to `rounded-xl` for consistency
  - **Status:** COMPLETED

- **[2026-01-22] [Frontend Agent]:** Complete Profile Page Redesign with Cover Photo & Avatar Overlap
  - **Changes:** Modified `/home/thunder/code/notes-app/frontend/app/profile/page.tsx`
  - **Why:** Redesigned the entire profile page with a modern, professional layout featuring:
    - Cover photo banner (Facebook/LinkedIn style) with gradient fallback
    - Profile photo overlapping the cover photo with proper layering and shadow effects
    - Updated color scheme to match app aesthetic (indigo/purple gradients instead of primary colors)
    - Improved dark mode support using zinc color palette (dark:bg-slate-950, dark:bg-zinc-900, etc.)
    - Enhanced animations using Framer Motion with AnimatePresence for smooth transitions
    - Modernized form inputs with rounded-xl styling and improved focus states
    - Added icon indicators for each section and social platform-specific colored icons
    - Redesigned edit mode with sticky save/cancel buttons and backdrop blur effects
    - Created gradient stat cards showing member since date and account status
    - Improved responsive design with better mobile/desktop layouts
    - All existing functionality preserved (edit profile, form validation, API integration)
  - **Status:** COMPLETED

- **[2026-01-21] [Frontend Agent]:** Update About Page Title
  - **Changes:** Modified `/home/thunder/code/notes-app/frontend/app/about/page.tsx`
  - **Why:** Changed the main page heading from "About Us" to "About Notesflow" to properly reflect the application name and improve brand consistency across the interface.
  - **Status:** COMPLETED
