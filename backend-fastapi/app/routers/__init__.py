from app.routers.auth import router as auth_router
from app.routers.notes import router as notes_router
from app.routers.tasks import router as tasks_router
from app.routers.profile import router as profile_router
from app.routers.share import router as share_router

__all__ = ["auth_router", "notes_router", "tasks_router", "profile_router", "share_router"]
