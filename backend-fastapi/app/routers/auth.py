from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.user_profile import UserProfile
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.response import APIResponse
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token, verify_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user from the JWT token."""
    token = credentials.credentials
    payload = verify_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get the current user if authenticated, otherwise None."""
    if not credentials:
        return None

    token = credentials.credentials
    payload = verify_token(token)

    if not payload:
        return None

    user_id = payload.get("user_id")
    return db.query(User).filter(User.id == user_id).first()


@router.post("/register", response_model=APIResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if username already exists
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create empty profile for user
    profile = UserProfile(user_id=user.id)
    db.add(profile)
    db.commit()

    # Generate token
    token = create_access_token({"user_id": user.id})

    return APIResponse(
        success=True,
        message="Registration successful",
        data={
            "token": token,
            "user": UserResponse.model_validate(user).model_dump()
        }
    )


@router.post("/login", response_model=APIResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"user_id": user.id})

    return APIResponse(
        success=True,
        message="Login successful",
        data={
            "token": token,
            "user": UserResponse.model_validate(user).model_dump()
        }
    )


@router.post("/logout", response_model=APIResponse)
def logout(current_user: User = Depends(get_current_user)):
    """Logout the current user."""
    # JWT tokens are stateless, so we just return success
    # In a production app, you might want to implement token blacklisting
    return APIResponse(
        success=True,
        message="Logout successful"
    )


@router.get("/profile", response_model=APIResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get the current user's profile."""
    return APIResponse(
        success=True,
        data=UserResponse.model_validate(current_user).model_dump()
    )
