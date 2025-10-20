"""Draft endpoints for creator studio workflow."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from src.middleware.auth import get_current_user
from src.models.curation import CurationActionType, DraftStatus, MarketDraft
from src.models.user import User
from src.schemas.curation import (
    DraftCreateRequest,
    DraftListResponse,
    DraftResponse,
    DraftUpdateRequest,
)

router = APIRouter()


@router.post("/", response_model=DraftResponse, status_code=status.HTTP_201_CREATED)
async def create_draft(
    draft_data: DraftCreateRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Create a new market draft.
    Used by both web and mobile creator studio.
    """
    # Create draft
    draft = await MarketDraft.create(
        creator=current_user,
        draft_data=draft_data.draft_data,
        ai_model_used=draft_data.ai_model_used,
        ai_generation_metadata=draft_data.ai_generation_metadata,
        conversation_history=draft_data.conversation_history,
        status=DraftStatus.PENDING,
    )

    # TODO: Trigger validation agent asynchronously
    # For now, return the draft without validation

    return await build_draft_response(draft)


@router.get("/", response_model=list[DraftListResponse])
async def list_my_drafts(
    status: Optional[DraftStatus] = Query(None, description="Filter by status"),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    current_user: User = Depends(get_current_user),
):
    """List current user's drafts."""
    query = MarketDraft.filter(creator=current_user)

    if status:
        query = query.filter(status=status)

    drafts = await query.order_by("-created_at").limit(limit).offset(offset).prefetch_related(
        "assigned_curator"
    )

    results = []
    for draft in drafts:
        question_text = draft.draft_data.get("question_text", "Untitled") if draft.draft_data else "Untitled"

        assigned_curator_name = None
        if draft.assigned_curator:
            assigned_curator_name = (
                draft.assigned_curator.username or draft.assigned_curator.wallet_address[:8]
            )

        results.append(
            DraftListResponse(
                id=draft.id,
                creator_wallet=current_user.wallet_address,
                question_text=question_text,
                status=draft.status,
                assigned_curator_name=assigned_curator_name,
                quality_score=float(draft.quality_score) if draft.quality_score else None,
                version=draft.version,
                created_at=draft.created_at,
                submitted_at=draft.submitted_at,
            )
        )

    return results


@router.get("/{draft_id}", response_model=DraftResponse)
async def get_draft(
    draft_id: UUID,
    current_user: User = Depends(get_current_user),
):
    """Get draft details. Only accessible by creator or curators."""
    draft = await MarketDraft.get_or_none(id=draft_id).prefetch_related(
        "creator", "assigned_curator"
    )

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found",
        )

    # Check permissions
    if draft.creator.id != current_user.id and not current_user.is_curator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this draft",
        )

    return await build_draft_response(draft)


@router.patch("/{draft_id}", response_model=DraftResponse)
async def update_draft(
    draft_id: UUID,
    update_data: DraftUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Update draft (creator edits after changes requested).
    Creates a new version.
    """
    draft = await MarketDraft.get_or_none(id=draft_id).prefetch_related("creator")

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found",
        )

    # Only creator can update
    if draft.creator.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can update this draft",
        )

    # Can only update if changes were requested
    if draft.status != DraftStatus.CHANGES_REQUESTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Draft is not in changes_requested state",
        )

    # Create new version
    new_draft = await MarketDraft.create(
        creator=draft.creator,
        draft_data=update_data.draft_data,
        ai_model_used=draft.ai_model_used,
        ai_generation_metadata=draft.ai_generation_metadata,
        conversation_history=draft.conversation_history,
        status=DraftStatus.PENDING,
        version=draft.version + 1,
        parent_draft=draft,
    )

    # TODO: Trigger validation agent

    return await build_draft_response(new_draft)


@router.post("/{draft_id}/submit", response_model=DraftResponse)
async def submit_draft(
    draft_id: UUID,
    current_user: User = Depends(get_current_user),
):
    """Submit draft for curator review."""
    draft = await MarketDraft.get_or_none(id=draft_id).prefetch_related("creator")

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found",
        )

    if draft.creator.id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can submit this draft",
        )

    if draft.status != DraftStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Draft is not in pending state",
        )

    # Update status
    draft.status = DraftStatus.PENDING
    draft.submitted_at = datetime.utcnow()
    await draft.save()

    # TODO: Notify curators (websocket/notification system)

    return await build_draft_response(draft)


async def build_draft_response(draft: MarketDraft) -> DraftResponse:
    """Helper to build draft response."""
    await draft.fetch_related("creator", "assigned_curator")

    assigned_curator_id = None
    assigned_curator_name = None
    if draft.assigned_curator:
        assigned_curator_id = draft.assigned_curator.id
        assigned_curator_name = (
            draft.assigned_curator.username or draft.assigned_curator.wallet_address[:8]
        )

    return DraftResponse(
        id=draft.id,
        creator_id=draft.creator.id,
        creator_wallet=draft.creator.wallet_address,
        draft_data=draft.draft_data,
        status=draft.status,
        assigned_curator_id=assigned_curator_id,
        assigned_curator_name=assigned_curator_name,
        ai_model_used=draft.ai_model_used,
        ai_generation_metadata=draft.ai_generation_metadata,
        quality_score=float(draft.quality_score) if draft.quality_score else None,
        safety_score=float(draft.safety_score) if draft.safety_score else None,
        clarity_score=float(draft.clarity_score) if draft.clarity_score else None,
        validation_errors=draft.validation_errors,
        validation_warnings=draft.validation_warnings,
        curator_notes=draft.curator_notes,
        requested_changes=draft.requested_changes,
        version=draft.version,
        parent_draft_id=draft.parent_draft_id,
        created_at=draft.created_at,
        updated_at=draft.updated_at,
        submitted_at=draft.submitted_at,
        reviewed_at=draft.reviewed_at,
        approved_at=draft.approved_at,
        deployed_at=draft.deployed_at,
    )
