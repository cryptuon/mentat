"""User-related Pydantic schemas for API validation."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for creating a new user account."""

    wallet_address: str = Field(..., min_length=32, max_length=44)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    display_name: Optional[str] = Field(None, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login (email/password or wallet)."""

    email: Optional[EmailStr] = None
    password: Optional[str] = None
    wallet_address: Optional[str] = None
    signature: Optional[str] = None  # For wallet-based auth


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    username: Optional[str] = Field(None, min_length=3, max_length=50)
    display_name: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = None


class UserProfile(BaseModel):
    """Public user profile response."""

    id: UUID
    wallet_address: str
    username: Optional[str]
    display_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    total_markets_created: int
    total_volume_generated: float
    created_at: datetime

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    """Full user response (includes private fields for authenticated user)."""

    id: UUID
    wallet_address: str
    email: Optional[str]
    username: Optional[str]
    display_name: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    is_active: bool
    is_curator: bool
    is_admin: bool
    total_markets_created: int
    total_volume_generated: float
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime]

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
