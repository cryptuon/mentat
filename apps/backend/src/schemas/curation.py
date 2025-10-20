"""Curation workflow Pydantic schemas for API validation."""
from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from src.models.curation import CurationActionType, DraftStatus


class DraftCreateRequest(BaseModel):
    """Schema for creating a new market draft."""

    draft_data: dict[str, Any] = Field(..., description="Full market specification as JSON")
    ai_model_used: Optional[str] = None
    ai_generation_metadata: Optional[dict[str, Any]] = None
    conversation_history: Optional[list[dict[str, Any]]] = None


class DraftUpdateRequest(BaseModel):
    """Schema for updating a draft (creator edits after changes requested)."""

    draft_data: dict[str, Any]
    curator_response: Optional[str] = None  # Response to curator feedback


class DraftApproveRequest(BaseModel):
    """Schema for curator approval action."""

    curator_notes: Optional[str] = None
    deploy_immediately: bool = False


class DraftRequestChangesRequest(BaseModel):
    """Schema for curator requesting changes."""

    requested_changes: dict[str, Any] = Field(
        ..., description="Structured change requests by field"
    )
    curator_notes: str = Field(..., min_length=10)


class DraftResponse(BaseModel):
    """Draft response for detail view."""

    id: UUID
    creator_id: UUID
    creator_wallet: str
    draft_data: dict[str, Any]
    status: DraftStatus
    assigned_curator_id: Optional[UUID]
    assigned_curator_name: Optional[str]

    # AI metadata
    ai_model_used: Optional[str]
    ai_generation_metadata: Optional[dict[str, Any]]

    # Quality scores
    quality_score: Optional[float]
    safety_score: Optional[float]
    clarity_score: Optional[float]

    # Validation
    validation_errors: list[dict[str, Any]]
    validation_warnings: list[dict[str, Any]]

    # Curator feedback
    curator_notes: Optional[str]
    requested_changes: Optional[dict[str, Any]]

    # Version
    version: int
    parent_draft_id: Optional[UUID]

    # Timestamps
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime]
    reviewed_at: Optional[datetime]
    approved_at: Optional[datetime]
    deployed_at: Optional[datetime]

    class Config:
        from_attributes = True


class DraftListResponse(BaseModel):
    """Compact draft response for curator queue and creator dashboard."""

    id: UUID
    creator_wallet: str
    question_text: str  # Extracted from draft_data
    status: DraftStatus
    assigned_curator_name: Optional[str]
    quality_score: Optional[float]
    version: int
    created_at: datetime
    submitted_at: Optional[datetime]

    class Config:
        from_attributes = True


class CurationActionCreate(BaseModel):
    """Schema for creating a curation action."""

    draft_id: UUID
    action_type: CurationActionType
    comment: Optional[str] = None
    field_changes: Optional[dict[str, dict[str, Any]]] = None
    metadata: Optional[dict[str, Any]] = None


class CurationActionResponse(BaseModel):
    """Curation action response."""

    id: UUID
    draft_id: UUID
    actor_id: UUID
    actor_wallet: str
    action_type: CurationActionType
    comment: Optional[str]
    field_changes: Optional[dict[str, dict[str, Any]]]
    metadata: Optional[dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class CuratorStats(BaseModel):
    """Curator performance statistics."""

    curator_id: UUID
    curator_name: str
    total_reviewed: int
    total_approved: int
    total_rejected: int
    avg_review_time_hours: float
    approval_rate: float
