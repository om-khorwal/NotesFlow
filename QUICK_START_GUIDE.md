# NotesFlow - Quick Start Guide

## What's New?

Your NotesFlow app has been completely redesigned with a modern, unified interface!

---

## Navigation Changes

### Before vs After

**Old Navigation:**
- Separate pages: Home, About, Notes, Tasks, Profile
- Duplicated navbar on every page

**New Navigation:**
- Single reusable header component
- Unified dashboard with tabs
- Profile accessible via avatar icon
- New Contact page added

---

## How to Use the New Dashboard

### 1. Login to Your Account
```
http://localhost:5000/login.html
```

### 2. Access the Dashboard
Click **Dashboard** in the navigation bar (or the avatar to go to Profile)

### 3. Switch Between Notes and Tasks
Click the **Notes** or **Tasks** tabs at the top of the dashboard

---

## Creating and Managing Notes

### Create a New Note
1. Click the **"Create New Note"** card (with the + icon)
2. A new note will be created and open in the editor

### Edit a Note
1. Click anywhere on a note card
2. The full-screen editor opens
3. Type your content (each line becomes a bullet point when viewing)
4. Changes auto-save every second
5. Click **"Save & Close"** or press ESC to exit

### Note Actions
- **Pin/Unpin:** Click the bookmark icon
- **Change Color:** Click the palette icon → pick a color
- **Delete:** Click the trash icon (requires confirmation)

### Note Features
- **Auto-save:** Changes save automatically while you type
- **Bullet points:** Each line displays as a bullet point
- **Collapsed view:** Long notes show "Read more..." button
- **Pinned notes:** Appear first with a colorful left border
- **Search:** Type in the search box to filter notes

---

## Managing Tasks

### Create a Task
1. Switch to the **Tasks** tab
2. Click **"+ New Task"** button
3. Enter title, description, and priority
4. Task appears in the grid

### Task Filters
- **All:** Show all tasks
- **Pending:** Show incomplete tasks only
- **Completed:** Show completed tasks only

### Task Actions
- **Complete:** Check the checkbox
- **Delete:** Click the trash icon

---

## Profile & Settings

### Access Your Profile
Click your **avatar** (circular icon with initials) in the top-right corner

### Theme Toggle
Click the **moon/sun icon** in the header to switch between light and dark modes

---

## Keyboard Shortcuts

- **Ctrl/Cmd + N:** Create new note (or task if on Tasks tab)
- **ESC:** Close note editor modal
- **Tab:** Navigate between UI elements

---

## Color Options for Notes

Choose from 8 beautiful colors:
- White (default)
- Yellow (light)
- Red (light)
- Green (light)
- Blue (light)
- Purple (light)
- Orange (light)
- Gray (light)

*Colors automatically adjust for dark mode!*

---

## Responsive Design

The app works beautifully on all devices:
- **Desktop:** 3-column masonry grid for notes
- **Tablet:** 2-column grid
- **Mobile:** Single column, fully thumb-friendly

---

## Tips & Tricks

1. **Pin Important Notes:** Pin frequently used notes to keep them at the top
2. **Use Colors:** Color-code notes by category or project
3. **Write Naturally:** Just type - bullet formatting happens automatically
4. **Let It Auto-Save:** No need to constantly click save!
5. **Search Fast:** Use the search bar to quickly find notes

---

## File Structure (for Developers)

```
/notes-app/
├── components/
│   └── header.js          # Reusable header component
├── js/
│   └── app.js             # API & utilities
├── index.html             # Home page
├── about.html             # About page
├── contact.html           # Contact page (NEW)
├── login.html             # Login/Register page
├── dashboard.html         # Dashboard with Notes/Tasks tabs (REDESIGNED)
└── profile.html           # Profile page
```

---

## Running the App

### Start the Backend
```bash
cd backend-fastapi
source venv/bin/activate  # or 'venv\Scripts\activate' on Windows
uvicorn app.main:app --reload
```

### Open the Frontend
Open your browser to:
```
http://localhost:5000/index.html
```

---

## AI Title Generation (Coming Soon)

The app is ready for AI-powered title generation!

**How it will work:**
- Write note content
- AI automatically generates a smart title
- Title updates in real-time

**To enable:** Implement the backend endpoint `/api/notes/{id}/generate-title`

See `IMPLEMENTATION_SUMMARY.md` for technical details.

---

## Browser Support

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Need Help?

- Check out the **About** page for company info
- Visit the **Contact** page to get in touch
- Read `IMPLEMENTATION_SUMMARY.md` for technical details

---

## Enjoy Your Redesigned NotesFlow App!

Beautiful, fast, and intuitive note-taking is now just a click away.
