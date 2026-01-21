# NotesFlow - Professional Notes Application

A beautiful, professional notes application built with HTML, CSS (Tailwind CSS), vanilla JavaScript, and Framer Motion animations. Perfect for both personal and professional use.

## Features

### Pages
- **Landing Page** - Professional hero section with features and CTAs
- **Login Page** - Beautiful authentication interface with animations
- **Dashboard Page** - Notes management with expandable cards
- **About Page** - Company information and team details
- **Tasks Page** - Task management with priority levels

### Key Functionality
- Create, edit, and delete notes
- Auto-generated headlines from note content
- Expandable/collapsible note cards
- Task management with priority levels (Low, Medium, High)
- Task completion tracking with statistics
- Search functionality for notes
- LocalStorage persistence (no backend required)
- Responsive design for all screen sizes
- Smooth animations and transitions
- Dark mode ready (with Tailwind's dark mode classes)

## Tech Stack

- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first styling via CDN
- **Vanilla JavaScript** - No frameworks, pure JS
- **Framer Motion** - Smooth animations via CDN
- **LocalStorage** - Client-side data persistence

## Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser

That's it! No build process, no dependencies to install. Everything runs in the browser.

### Quick Start

1. Open `index.html` in your browser
2. Click "Login" or "Dashboard" in the navigation
3. Use the demo credentials or any email/password combination:
   - Email: demo@notesflow.com
   - Password: demo123
   - Or any email and password (6+ characters)

## Usage Guide

### Authentication

The application uses a simple localStorage-based authentication system for demonstration purposes. Any email and password combination (minimum 6 characters) will work.

**Login Page Features:**
- Email and password validation
- "Remember me" functionality
- Demo credentials display
- Social login buttons (UI only)
- Smooth animations on success/error

### Dashboard (Notes Management)

**Creating Notes:**
1. Click the "New Note" button
2. Optionally add a custom title
3. Write your content
4. Click "Save Note"

**Note Features:**
- Auto-generated headlines (from first line or first 50 characters)
- Colorful gradient backgrounds (automatically assigned)
- Expandable cards (click to expand/collapse)
- Edit existing notes
- Delete notes with confirmation
- Search across all notes
- Shows creation/update date

**Card Behavior:**
- Click a card to expand and view full content
- When editing or creating a new note, other cards automatically minimize
- Smooth animations for all interactions

**Keyboard Shortcuts:**
- `Ctrl/Cmd + N` - Create new note
- `Ctrl/Cmd + S` - Save note (when editor is open)
- `Escape` - Close editor

### Tasks Management

**Adding Tasks:**
1. Enter task text in the input field
2. Select priority (Low, Medium, High)
3. Click "Add Task" or press Enter

**Task Features:**
- Priority levels with color coding
- Check/uncheck to mark completion
- Delete tasks
- Filter by All/Pending/Completed
- Statistics dashboard showing total, completed, and pending tasks
- Tasks persist in localStorage

**Keyboard Shortcuts:**
- `Ctrl/Cmd + K` - Focus on task input

### Data Persistence

All data is stored in the browser's localStorage:
- **Notes** - Stored in `notes` key
- **Tasks** - Stored in `tasks` key
- **User Session** - Stored in `user` key

**Note:** Clearing browser data will remove all notes and tasks.

## File Structure

```
notes-app/
├── index.html          # Landing page
├── login.html          # Authentication page
├── dashboard.html      # Notes management
├── about.html          # About page
├── tasks.html          # Tasks management
└── README.md          # Documentation
```

## Design System

### Color Palette
- **Primary Blue:** #0ea5e9 (Sky Blue)
- **Purple Accent:** #764ba2
- **Success Green:** #10b981
- **Warning Yellow:** #f59e0b
- **Error Red:** #ef4444

### Typography
- **Font Family:** Inter (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700, 800

### Spacing
Following Tailwind's default spacing scale (4px base unit)

### Responsive Breakpoints
- **sm:** 640px
- **md:** 768px
- **lg:** 1024px
- **xl:** 1280px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Customization

### Changing Colors

Edit the Tailwind config in each HTML file's `<script>` section:

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: {
                    // Customize these values
                    500: '#0ea5e9',
                    600: '#0284c7',
                    // ...
                }
            }
        }
    }
}
```

### Adding Features

All JavaScript is inline within each HTML file for simplicity. To add features:

1. Locate the `<script>` section in the relevant HTML file
2. Add your functions to the appropriate section
3. Update event listeners in `setupEventListeners()`

## Performance Considerations

- **CDN Assets:** Tailwind CSS and Framer Motion are loaded via CDN
- **No Build Process:** Direct HTML execution for instant loading
- **LocalStorage:** Fast client-side storage with no server requests
- **Optimized Animations:** CSS transitions and Framer Motion for smooth 60fps animations

## Security Notes

This is a demonstration application with client-side only authentication. For production use:

1. Implement proper backend authentication
2. Use secure password hashing
3. Add CSRF protection
4. Implement rate limiting
5. Use HTTPS
6. Add input sanitization
7. Implement proper session management

## Future Enhancements

Potential features for future versions:
- Backend integration (Node.js/Express)
- Real database (MongoDB/PostgreSQL)
- User registration
- Password reset functionality
- Note categories/tags
- Rich text editor
- File attachments
- Note sharing
- Export/import functionality
- Mobile app versions
- Collaboration features

## Credits

- **Tailwind CSS** - https://tailwindcss.com
- **Framer Motion** - https://www.framer.com/motion/
- **Inter Font** - https://fonts.google.com/specimen/Inter
- **Heroicons** - SVG icons used in the interface

## License

This project is open source and available for educational and personal use.

## Support

For questions or issues, please open an issue on the repository or contact the development team.

---

Built with care by the NotesFlow team. Happy note-taking!
