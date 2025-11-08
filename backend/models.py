from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import uuid

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    email: str
    name: str
    picture: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}

class BusinessDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    size: int
    url: str
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}

class BusinessProfile(BaseModel):
    user_id: str
    business_name: str
    business_type: str
    custom_services: list[str] = Field(default_factory=list)
    business_phone: str
    documents: list[BusinessDocument] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}

class BusinessProfileCreate(BaseModel):
    business_name: str = Field(min_length=2)
    business_type: str
    custom_services: list[str] = Field(default_factory=list)
    business_phone: str

class BusinessProfileUpdate(BaseModel):
    business_name: str = Field(min_length=2)
    business_type: str
    custom_services: list[str] = Field(default_factory=list)
    business_phone: str
