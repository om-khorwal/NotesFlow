from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.routers import auth_router, notes_router, tasks_router, profile_router, share_router
from app.schemas.response import APIResponse, ErrorDetail

# Create FastAPI application
app = FastAPI(
    title="NotesFlow API",
    description="API for NotesFlow - Professional Note-Taking Application",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with consistent response format."""
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"][1:]) if len(error["loc"]) > 1 else error["loc"][0]
        errors.append(ErrorDetail(field=str(field), message=error["msg"]))

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=APIResponse(
            success=False,
            message="Validation error",
            errors=[e.model_dump() for e in errors]
        ).model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions with consistent response format."""
    # In debug mode, include error details
    message = str(exc) if settings.debug else "An internal error occurred"

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIResponse(
            success=False,
            message=message
        ).model_dump()
    )


# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(notes_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(share_router, prefix="/api")


# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return APIResponse(
        success=True,
        message="NotesFlow API is running",
        data={"version": "2.0.0"}
    )


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "NotesFlow API",
        "version": "2.0.0",
        "docs": "/api/docs",
        "health": "/api/health"
    }
