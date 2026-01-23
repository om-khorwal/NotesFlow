# NotesFlow

A modern, full-stack notes and task management application with a beautiful glassmorphic UI, built with Next.js 16 and FastAPI.

## Overview

NotesFlow is a professional productivity application that combines note-taking and task management in a unified, intuitive interface. Featuring a Samsung Notes-inspired design with smooth animations, dark mode support, and real-time auto-save functionality.

## Features

### Notes Management
- Create, edit, and delete notes with real-time auto-save
- Pin important notes to keep them at the top
- Customize note colors with 8 beautiful color options
- Search across all notes instantly
- Masonry grid layout for optimal space usage
- Share notes via secure, expiring links

### Task Management
- Full task lifecycle: Pending, In Progress, Completed
- Priority levels: Low, Medium, High
- Due date tracking
- Task statistics dashboard
- Pin and color-code tasks
- Share tasks with expiring links

### User Experience
- Glassmorphic UI with animated gradient backgrounds
- Smooth animations powered by Framer Motion
- Fully responsive design (mobile, tablet, desktop)
- Light and dark theme support
- Keyboard shortcuts for power users
- Secure JWT-based authentication

### Sharing & Collaboration
- Generate shareable links for notes and tasks
- Set link expiration (1-365 days)
- Revoke share access anytime
- Public shared content view page

## Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.12
- **Database**: PostgreSQL with SQLAlchemy 2.0
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Passlib with bcrypt

### Infrastructure
- **API Documentation**: OpenAPI (Swagger UI at `/api/docs`)
- **CORS**: Configured for cross-origin requests
- **Validation**: Pydantic v2

## Project Structure

```
notes-app/
├── frontend/                    # Next.js 16 frontend application
│   ├── app/                     # App Router pages
│   │   ├── page.tsx             # Home/landing page
│   │   ├── login/page.tsx       # Authentication page
│   │   ├── dashboard/page.tsx   # Main dashboard (notes & tasks)
│   │   ├── profile/page.tsx     # User profile management
│   │   ├── about/page.tsx       # About page
│   │   ├── contact/page.tsx     # Contact page
│   │   └── shared/[token]/      # Public shared content viewer
│   ├── components/              # Reusable UI components
│   │   └── Header.tsx           # Navigation header
│   ├── lib/                     # Utilities and API client
│   │   ├── api.ts               # API wrapper functions
│   │   ├── auth.ts              # Authentication utilities
│   │   ├── types.ts             # TypeScript type definitions
│   │   ├── utils.ts             # Helper functions
│   │   └── toast.ts             # Toast notifications
│   └── package.json
│
├── backend-fastapi/             # FastAPI backend application
│   ├── app/
│   │   ├── main.py              # Application entry point
│   │   ├── config.py            # Configuration settings
│   │   ├── database.py          # Database connection
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py          # User model
│   │   │   ├── user_profile.py  # User profile model
│   │   │   ├── note.py          # Note model
│   │   │   └── task.py          # Task model
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── user.py          # User schemas
│   │   │   ├── note.py          # Note schemas
│   │   │   ├── task.py          # Task schemas
│   │   │   └── response.py      # API response schemas
│   │   ├── routers/             # API route handlers
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── notes.py         # Notes CRUD endpoints
│   │   │   ├── tasks.py         # Tasks CRUD endpoints
│   │   │   ├── profile.py       # Profile endpoints
│   │   │   └── share.py         # Sharing endpoints
│   │   └── utils/               # Utility functions
│   │       ├── jwt.py           # JWT token handling
│   │       └── password.py      # Password hashing
│   ├── migrations/              # Database migrations
│   └── requirements.txt         # Python dependencies
│
└── README.md
```

## Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL database

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend-fastapi
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your configuration:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/notesflow
   SECRET_KEY=your-super-secret-key-here
   CORS_ORIGINS=http://localhost:3000,http://localhost:5000
   DEBUG=true
   ```

5. Run database migrations (if applicable) or let SQLAlchemy create tables:
   ```bash
   # Tables are auto-created on first run
   ```

6. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| POST | `/api/auth/logout` | Logout current user |
| GET | `/api/auth/profile` | Get current user profile |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes (with optional search/filter) |
| GET | `/api/notes/{id}` | Get a specific note |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/{id}` | Update a note |
| DELETE | `/api/notes/{id}` | Delete a note |
| PUT | `/api/notes/{id}/pin` | Toggle pin status |
| PUT | `/api/notes/{id}/color` | Update note color |
| POST | `/api/notes/{id}/share` | Create share link |
| DELETE | `/api/notes/{id}/share` | Revoke share link |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (with optional filters) |
| GET | `/api/tasks/stats` | Get task statistics |
| GET | `/api/tasks/{id}` | Get a specific task |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |
| PUT | `/api/tasks/{id}/pin` | Toggle pin status |
| PUT | `/api/tasks/{id}/color` | Update task color |
| POST | `/api/tasks/{id}/share` | Create share link |
| DELETE | `/api/tasks/{id}/share` | Revoke share link |

### Health & Info
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/api/health` | Health check |
| GET | `/api/docs` | Swagger UI documentation |
| GET | `/api/redoc` | ReDoc documentation |

## Usage

### Getting Started

1. **Register an Account**: Navigate to the login page and create a new account with your email and password.

2. **Access the Dashboard**: After logging in, you'll be redirected to the dashboard where you can manage notes and tasks.

3. **Create Notes**: Click the "New" button in the Notes tab to create a note. Notes auto-save as you type.

4. **Create Tasks**: Switch to the Tasks tab and click "New" to create a task. Set priority, status, and due dates.

5. **Organize**: Use pin functionality to keep important items at the top. Color-code items for visual organization.

6. **Share**: Click the share icon on any note or task to generate a shareable link.

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | Create new note/task |
| `Escape` | Close modal/editor |

### Tips

- **Auto-save**: Notes save automatically while typing (500ms debounce)
- **Search**: Use the search bar to filter notes and tasks by title or content
- **Color Coding**: Assign colors to organize items by project or category
- **Pinning**: Pin frequently accessed items to keep them at the top

## Development

### Running Tests

```bash
# Backend tests (if available)
cd backend-fastapi
pytest

# Frontend tests
cd frontend
npm run test
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend runs with uvicorn in production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Code Quality

```bash
# Frontend linting
cd frontend
npm run lint
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- CORS configured for allowed origins
- Input validation with Pydantic
- SQL injection prevention via SQLAlchemy ORM

## Future Enhancements

- AI-powered title generation for notes
- Rich text editor with Markdown support
- File attachments and image uploads
- Collaborative editing
- Mobile applications (iOS/Android)
- Export to PDF/Markdown
- Tags and categories
- Reminders and notifications

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available for educational and personal use.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python SQL toolkit
