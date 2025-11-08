from fastapi import FastAPI, APIRouter, Request, HTTPException, status, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import shutil
from auth import get_current_user, fetch_user_from_emergent, create_or_update_user, create_session
from models import User, BusinessProfile, BusinessProfileCreate, BusinessProfileUpdate, BusinessDocument


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# ==================== Authentication Routes ====================

@api_router.post("/auth/session")
async def create_auth_session(request: Request):
    """
    Process session_id from Emergent Auth and create user session.
    """
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Session-ID header is required"
        )
    
    try:
        # Fetch user data from Emergent Auth
        emergent_user_data = await fetch_user_from_emergent(session_id)
        
        # Create or get existing user
        user = await create_or_update_user(db, emergent_user_data)
        
        # Create session
        session = await create_session(db, user.id, emergent_user_data["session_token"])
        
        # Create response with user data
        response = JSONResponse(content={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "picture": user.picture
        })
        
        # Set httpOnly cookie with session token
        response.set_cookie(
            key="session_token",
            value=emergent_user_data["session_token"],
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,  # 7 days
            path="/"
        )
        
        logger.info(f"Session created for user: {user.email}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session"
        )

@api_router.get("/auth/me")
async def get_current_user_info(request: Request):
    """
    Get current authenticated user information.
    """
    user = await get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    # Return as dict to ensure proper field names
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

@api_router.post("/auth/logout")
async def logout(request: Request):
    """
    Logout user by deleting session and clearing cookie.
    """
    session_token = request.cookies.get("session_token")
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active session"
        )
    
    # Delete session from database
    result = await db.user_sessions.delete_one({"session_token": session_token})
    
    if result.deleted_count == 0:
        logger.warning("Session not found during logout")
    
    # Create response and clear cookie
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie(
        key="session_token",
        path="/",
        samesite="none",
        secure=True
    )
    
    logger.info("User logged out")
    return response

# ==================== Business Profile Routes ====================

BUSINESS_TYPES = [
    "Restaurant / Cafe",
    "Retail Store",
    "Medical / Dental Office",
    "Legal Services",
    "Salon / Spa",
    "Fitness Center / Gym",
    "Real Estate",
    "Accounting / Financial Services",
    "Consulting",
    "Home Services (Plumbing, Electrical, etc.)",
    "Other"
]

@api_router.get("/businesses")
async def get_user_businesses(request: Request):
    """
    Get all businesses for current user.
    """
    user = await get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    businesses = await db.business_profiles.find({"user_id": user.id}).to_list(100)
    
    # Convert _id to id for each business
    for business in businesses:
        business["id"] = str(business.pop("_id"))
    
    return {"businesses": businesses}

@api_router.get("/business/{business_id}")
async def get_business(request: Request, business_id: str):
    """
    Get specific business by ID.
    """
    user = await get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    business = await db.business_profiles.find_one({"_id": business_id, "user_id": user.id})
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    business["id"] = str(business.pop("_id"))
    return business

@api_router.get("/profile/business-types")
async def get_business_types():
    """
    Get list of predefined business types.
    """
    return {"business_types": BUSINESS_TYPES}

@api_router.post("/business")
async def create_business(request: Request, profile_data: BusinessProfileCreate):
    """
    Create new business for current user.
    """
    user = await get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Validate business type
    if profile_data.business_type not in BUSINESS_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid business_type. Must be one of: {', '.join(BUSINESS_TYPES)}"
        )
    
    # Create business
    business = BusinessProfile(
        user_id=user.id,
        **profile_data.dict()
    )
    
    business_dict = business.dict(by_alias=True)
    
    # Ensure _id is stored as string, not ObjectId
    business_id = business_dict.get("_id")
    if business_id:
        business_dict["_id"] = str(business_id)
    
    await db.business_profiles.insert_one(business_dict)
    
    logger.info(f"Business created for user: {user.email}, business: {business.business_name}, id: {business_id}")
    
    # Return with id instead of _id
    business_dict["id"] = business_dict.pop("_id")
    return business_dict

@api_router.put("/business/{business_id}")
async def update_business(request: Request, business_id: str, profile_data: BusinessProfileUpdate):
    """
    Update existing business.
    """
    user = await get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    logger.info(f"Attempting to update business: {business_id} for user: {user.email}")
    
    # Check if business exists and belongs to user
    existing_business = await db.business_profiles.find_one({"_id": business_id, "user_id": user.id})
    
    if not existing_business:
        # Log for debugging
        all_user_businesses = await db.business_profiles.find({"user_id": user.id}).to_list(100)
        logger.error(f"Business {business_id} not found. User has {len(all_user_businesses)} businesses")
        for b in all_user_businesses:
            logger.error(f"  Business _id: {b.get('_id')}, type: {type(b.get('_id'))}")
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business not found: {business_id}"
        )
    
    # Validate business type
    if profile_data.business_type not in BUSINESS_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid business_type. Must be one of: {', '.join(BUSINESS_TYPES)}"
        )
    
    # Update business
    update_data = profile_data.dict()
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.business_profiles.update_one(
        {"_id": business_id, "user_id": user.id},
        {"$set": update_data}
    )
    
    logger.info(f"Business updated: matched={result.matched_count}, modified={result.modified_count}")
    
    # Get and return updated business
    updated_business = await db.business_profiles.find_one({"_id": business_id})
    updated_business["id"] = str(updated_business.pop("_id"))
    return updated_business

@api_router.delete("/business/{business_id}")
async def delete_business(request: Request, business_id: str):
    """
    Delete business and all related documents.
    """
    user = await get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    logger.info(f"Attempting to delete business: {business_id} for user: {user.email}")
    
    # Find business
    business = await db.business_profiles.find_one({"_id": business_id, "user_id": user.id})
    if not business:
        logger.error(f"Business {business_id} not found for deletion")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business not found: {business_id}"
        )
    
    # Delete all documents
    documents = business.get("documents", [])
    for doc in documents:
        doc_id = doc["id"]
        for ext in ['.pdf', '.doc', '.docx']:
            file_path = UPLOAD_DIR / f"{doc_id}{ext}"
            if file_path.exists():
                file_path.unlink()
                break
    
    # Delete logo if exists
    if business.get("logo_url"):
        logo_id = business["logo_url"].split("/")[-1]
        for ext in ['.png', '.jpg', '.jpeg']:
            logo_path = UPLOAD_DIR / f"{logo_id}{ext}"
            if logo_path.exists():
                logo_path.unlink()
                break
    
    # Delete business from database
    await db.business_profiles.delete_one({"_id": business_id, "user_id": user.id})
    
    logger.info(f"Business deleted for user: {user.email}, business_id: {business_id}")
    return {"message": "Business deleted successfully"}

@api_router.post("/business/{business_id}/upload-logo")
async def upload_logo(request: Request, business_id: str, file: UploadFile = File(...)):
    """
    Upload business logo
    """
    user = await get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Validate file type
    allowed_extensions = ['.png', '.jpg', '.jpeg']
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Validate file size (2MB max for logo)
    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 2MB"
        )
    
    # Generate unique filename
    logo_id = str(uuid.uuid4())
    safe_filename = f"{logo_id}{file_ext}"
    file_path = UPLOAD_DIR / safe_filename
    
    # Save file
    with open(file_path, 'wb') as f:
        f.write(content)
    
    logo_url = f"/api/business/{business_id}/logo/{logo_id}"
    
    # Update business with logo URL
    await db.business_profiles.update_one(
        {"_id": business_id, "user_id": user.id},
        {"$set": {"logo_url": logo_url, "updated_at": datetime.now(timezone.utc)}}
    )
    
    logger.info(f"Logo uploaded for business: {business_id}")
    return {"logo_url": logo_url}

@api_router.get("/business/{business_id}/logo/{logo_id}")
async def get_logo(business_id: str, logo_id: str):
    """
    Get business logo
    """
    # Find file
    file_path = None
    for ext in ['.png', '.jpg', '.jpeg']:
        potential_path = UPLOAD_DIR / f"{logo_id}{ext}"
        if potential_path.exists():
            file_path = potential_path
            break
    
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Logo not found"
        )
    
    return FileResponse(path=file_path, media_type="image/jpeg")

@api_router.post("/business/{business_id}/upload-document")
async def upload_document(request: Request, business_id: str, file: UploadFile = File(...)):
    """
    Upload a business document (menu, service list, etc.)
    """
    user = await get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Validate file type
    allowed_extensions = ['.pdf', '.doc', '.docx']
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Validate file size (5MB max)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB"
        )
    
    # Generate unique filename
    doc_id = str(uuid.uuid4())
    safe_filename = f"{doc_id}{file_ext}"
    file_path = UPLOAD_DIR / safe_filename
    
    # Save file
    with open(file_path, 'wb') as f:
        f.write(content)
    
    # Create document record
    document = BusinessDocument(
        id=doc_id,
        filename=file.filename,
        size=len(content),
        url=f"/api/business/{business_id}/document/{doc_id}"
    )
    
    # Update business with document
    business = await db.business_profiles.find_one({"_id": business_id, "user_id": user.id})
    if business:
        documents = business.get("documents", [])
        documents.append(document.dict())
        await db.business_profiles.update_one(
            {"_id": business_id, "user_id": user.id},
            {"$set": {"documents": documents, "updated_at": datetime.now(timezone.utc)}}
        )
    
    logger.info(f"Document uploaded for business: {business_id}, file: {file.filename}")
    return document.dict()

@api_router.get("/business/{business_id}/document/{doc_id}")
async def get_document(request: Request, business_id: str, doc_id: str):
    """
    Download a business document
    """
    user = await get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Find document in business
    business = await db.business_profiles.find_one({"_id": business_id, "user_id": user.id})
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    documents = business.get("documents", [])
    document = next((d for d in documents if d["id"] == doc_id), None)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Find file
    file_path = None
    for ext in ['.pdf', '.doc', '.docx']:
        potential_path = UPLOAD_DIR / f"{doc_id}{ext}"
        if potential_path.exists():
            file_path = potential_path
            break
    
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found"
        )
    
    return FileResponse(
        path=file_path,
        filename=document["filename"],
        media_type="application/octet-stream"
    )

@api_router.delete("/business/{business_id}/document/{doc_id}")
async def delete_document(request: Request, business_id: str, doc_id: str):
    """
    Delete a business document
    """
    user = await get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Find and remove document from business
    business = await db.business_profiles.find_one({"_id": business_id, "user_id": user.id})
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    documents = business.get("documents", [])
    document = next((d for d in documents if d["id"] == doc_id), None)
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Remove from database
    documents = [d for d in documents if d["id"] != doc_id]
    await db.business_profiles.update_one(
        {"_id": business_id, "user_id": user.id},
        {"$set": {"documents": documents, "updated_at": datetime.now(timezone.utc)}}
    )
    
    # Delete file
    for ext in ['.pdf', '.doc', '.docx']:
        file_path = UPLOAD_DIR / f"{doc_id}{ext}"
        if file_path.exists():
            file_path.unlink()
            break
    
    logger.info(f"Document deleted for business: {business_id}, doc_id: {doc_id}")
    return {"message": "Document deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()