#!/usr/bin/env python3
"""
Entry point for running the NotesFlow FastAPI server.

Usage:
    Development: python run.py
    Production:  gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
                 or: python run.py (with ENVIRONMENT=production in .env)
"""

import uvicorn
from app.config import settings

if __name__ == "__main__":
    # Configure based on environment
    if settings.is_production:
        # Production settings
        uvicorn.run(
            "app.main:app",
            host=settings.host,
            port=settings.port,
            reload=False,  # Never reload in production
            log_level="info",
            access_log=True,
            workers=1,  # Use gunicorn for multiple workers in real production
        )
    else:
        # Development settings
        uvicorn.run(
            "app.main:app",
            host=settings.host,
            port=settings.port,
            reload=settings.debug,
            log_level="debug" if settings.debug else "info"
        )
