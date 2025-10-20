"""Pydantic schemas for API request/response validation."""
from src.schemas.curation import (
    CurationActionCreate,
    CurationActionResponse,
    DraftApproveRequest,
    DraftCreateRequest,
    DraftListResponse,
    DraftResponse,
    DraftUpdateRequest,
)
from src.schemas.market import (
    MarketCreateRequest,
    MarketDetailResponse,
    MarketListResponse,
    MarketOutcomeResponse,
    MarketUpdateRequest,
)
from src.schemas.user import (
    UserCreate,
    UserLogin,
    UserProfile,
    UserResponse,
    UserUpdate,
)

__all__ = [
    # User
    "UserCreate",
    "UserLogin",
    "UserProfile",
    "UserResponse",
    "UserUpdate",
    # Market
    "MarketCreateRequest",
    "MarketDetailResponse",
    "MarketListResponse",
    "MarketOutcomeResponse",
    "MarketUpdateRequest",
    # Curation
    "CurationActionCreate",
    "CurationActionResponse",
    "DraftApproveRequest",
    "DraftCreateRequest",
    "DraftListResponse",
    "DraftResponse",
    "DraftUpdateRequest",
]
