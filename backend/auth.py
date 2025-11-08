from fastapi import Request, HTTPException, status
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import User, UserSession
import requests
import logging

logger = logging.getLogger(__name__)

EMERGENT_AUTH_SESSION_API = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

async def get_current_user(request: Request, db: AsyncIOMotorDatabase) -> Optional[User]:
    """
    Get current authenticated user from session token.
    Checks cookies first, then Authorization header.
    """
    session_token = None
    
    # Check cookies first
    if "session_token" in request.cookies:
        session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        return None
    
    # Find session in database
    session_data = await db.user_sessions.find_one({"session_token": session_token})
    if not session_data:
        logger.warning("Session not found in database")
        return None
    
    # Check if session expired
    if session_data["expires_at"] < datetime.now(timezone.utc):
        logger.warning("Session expired")
        await db.user_sessions.delete_one({"session_token": session_token})
        return None
    
    # Get user data
    user_data = await db.users.find_one({"_id": session_data["user_id"]})
    if not user_data:
        logger.error(f"User not found for session: {session_data['user_id']}")
        return None
    
    # Map MongoDB _id to Pydantic id
    user_data["id"] = user_data.pop("_id")
    return User(**user_data)

async def fetch_user_from_emergent(session_id: str) -> dict:
    """
    Fetch user data from Emergent Auth using session_id.
    """
    try:
        response = requests.get(
            EMERGENT_AUTH_SESSION_API,
            headers={"X-Session-ID": session_id},
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching user from Emergent Auth: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )

async def create_or_update_user(db: AsyncIOMotorDatabase, user_data: dict) -> User:
    """
    Create a new user or return existing user.
    Does not update existing user data to preserve user information.
    """
    existing_user = await db.users.find_one({"email": user_data["email"]})
    
    if existing_user:
        # Return existing user without updating
        existing_user["id"] = existing_user.pop("_id")
        return User(**existing_user)
    
    # Create new user
    user = User(
        email=user_data["email"],
        name=user_data["name"],
        picture=user_data["picture"]
    )
    
    # Insert into database (Pydantic id maps to MongoDB _id)
    user_dict = user.dict(by_alias=True)
    await db.users.insert_one(user_dict)
    
    return user

async def create_session(db: AsyncIOMotorDatabase, user_id: str, session_token: str) -> UserSession:
    """
    Create a new session for the user.
    """
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session = UserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at
    )
    
    await db.user_sessions.insert_one(session.dict())
    return session
