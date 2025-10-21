"""Curator console endpoints for market review and approval."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from tortoise.functions import Count

from src.middleware.auth import get_current_curator
from src.models.curation import CurationAction, CurationActionType, DraftStatus, MarketDraft
from src.models.market import Market, MarketOutcome, MarketResolutionSource, MarketState
from src.models.user import User
from src.schemas.curation import (
    CurationActionResponse,
    DraftApproveRequest,
    DraftListResponse,
    DraftResponse,
)

router = APIRouter()


@router.get("/queue", response_model=list[DraftListResponse])
async def get_curator_queue(
    status: Optional[DraftStatus] = Query(DraftStatus.PENDING, description="Filter by status"),
    assigned_to_me: bool = Query(False, description="Show only drafts assigned to me"),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    current_curator: User = Depends(get_current_curator),
):
    """Get curator review queue."""
    query = MarketDraft.filter(status__in=[DraftStatus.PENDING, DraftStatus.IN_REVIEW])

    if status:
        query = query.filter(status=status)

    if assigned_to_me:
        query = query.filter(assigned_curator=current_curator)

    drafts = await query.order_by("-submitted_at", "-created_at").limit(limit).offset(
        offset
    ).prefetch_related("creator", "assigned_curator")

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
                creator_wallet=draft.creator.wallet_address,
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


@router.post("/{draft_id}/claim", response_model=DraftResponse)
async def claim_draft(
    draft_id: UUID,
    current_curator: User = Depends(get_current_curator),
):
    """Claim a draft for review."""
    draft = await MarketDraft.get_or_none(id=draft_id).prefetch_related("creator")

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found",
        )

    if draft.status != DraftStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Draft is not available for claiming",
        )

    # Assign to curator
    draft.assigned_curator = current_curator
    draft.status = DraftStatus.IN_REVIEW
    await draft.save()

    # Record action
    await CurationAction.create(
        draft=draft,
        actor=current_curator,
        action_type=CurationActionType.CLAIM,
    )

    return await build_draft_response_curator(draft, current_curator)


@router.post("/{draft_id}/approve", response_model=DraftResponse)
async def approve_draft(
    draft_id: UUID,
    approval: DraftApproveRequest,
    current_curator: User = Depends(get_current_curator),
):
    """
    Approve draft for deployment.
    Optionally deploy immediately to on-chain.
    """
    draft = await MarketDraft.get_or_none(id=draft_id).prefetch_related("creator")

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found",
        )

    if draft.status != DraftStatus.IN_REVIEW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Draft must be in review to approve",
        )

    # Update draft
    draft.status = DraftStatus.APPROVED
    draft.approved_at = datetime.utcnow()
    draft.reviewed_at = datetime.utcnow()
    draft.curator_notes = approval.curator_notes
    await draft.save()

    # Record action
    await CurationAction.create(
        draft=draft,
        actor=current_curator,
        action_type=CurationActionType.APPROVE,
        comment=approval.curator_notes,
    )

    # Create Market from draft
    market = await create_market_from_draft(draft)

    # Link market to draft
    draft.market = market
    await draft.save()

    if approval.deploy_immediately:
        # TODO: Trigger on-chain deployment
        draft.status = DraftStatus.DEPLOYED
        draft.deployed_at = datetime.utcnow()
        await draft.save()

        await CurationAction.create(
            draft=draft,
            actor=current_curator,
            action_type=CurationActionType.DEPLOY,
        )

    return await build_draft_response_curator(draft, current_curator)


@router.post("/{draft_id}/request-changes", response_model=DraftResponse)
async def request_changes(
    draft_id: UUID,
    request: dict,
    current_curator: User = Depends(get_current_curator),
):
    """Request changes from creator."""
    draft = await MarketDraft.get_or_none(id=draft_id).prefetch_related("creator")

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found",
        )

    if draft.status != DraftStatus.IN_REVIEW:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Draft must be in review to request changes",
        )

    # Update draft
    draft.status = DraftStatus.CHANGES_REQUESTED
    draft.requested_changes = request.get("requested_changes", {})
    draft.curator_notes = request.get("curator_notes")
    draft.reviewed_at = datetime.utcnow()
    await draft.save()

    # Record action
    await CurationAction.create(
        draft=draft,
        actor=current_curator,
        action_type=CurationActionType.REQUEST_CHANGES,
        comment=request.get("curator_notes"),
        metadata={"requested_changes": request.get("requested_changes")},
    )

    # TODO: Notify creator

    return await build_draft_response_curator(draft, current_curator)


@router.post("/{draft_id}/reject", response_model=DraftResponse)
async def reject_draft(
    draft_id: UUID,
    rejection: dict,
    current_curator: User = Depends(get_current_curator),
):
    """Permanently reject draft."""
    draft = await MarketDraft.get_or_none(id=draft_id).prefetch_related("creator")

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found",
        )

    if draft.status not in [DraftStatus.IN_REVIEW, DraftStatus.PENDING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Draft cannot be rejected in current state",
        )

    # Update draft
    draft.status = DraftStatus.REJECTED
    draft.curator_notes = rejection.get("reason", "Rejected by curator")
    draft.reviewed_at = datetime.utcnow()
    await draft.save()

    # Record action
    await CurationAction.create(
        draft=draft,
        actor=current_curator,
        action_type=CurationActionType.REJECT,
        comment=rejection.get("reason"),
    )

    return await build_draft_response_curator(draft, current_curator)


@router.get("/{draft_id}/actions", response_model=list[CurationActionResponse])
async def get_draft_actions(
    draft_id: UUID,
    current_curator: User = Depends(get_current_curator),
):
    """Get action history for a draft."""
    draft = await MarketDraft.get_or_none(id=draft_id)

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found",
        )

    actions = await CurationAction.filter(draft=draft).order_by("-created_at").prefetch_related(
        "actor"
    )

    results = []
    for action in actions:
        results.append(
            CurationActionResponse(
                id=action.id,
                draft_id=action.draft_id,
                actor_id=action.actor.id,
                actor_wallet=action.actor.wallet_address,
                action_type=action.action_type,
                comment=action.comment,
                field_changes=action.field_changes,
                metadata=action.metadata,
                created_at=action.created_at,
            )
        )

    return results


async def build_draft_response_curator(draft: MarketDraft, curator: User) -> DraftResponse:
    """Helper to build draft response for curator."""
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


@router.post("/bulk/claim", response_model=dict)
async def bulk_claim_drafts(
    draft_ids: list[UUID],
    current_curator: User = Depends(get_current_curator),
):
    """Claim multiple drafts for review."""
    results = {"success": [], "failed": []}

    for draft_id in draft_ids:
        try:
            draft = await MarketDraft.get_or_none(id=draft_id)

            if not draft or draft.status != DraftStatus.PENDING:
                results["failed"].append({"id": str(draft_id), "reason": "Not available for claiming"})
                continue

            draft.assigned_curator = current_curator
            draft.status = DraftStatus.IN_REVIEW
            await draft.save()

            await CurationAction.create(
                draft=draft,
                actor=current_curator,
                action_type=CurationActionType.CLAIM,
            )

            results["success"].append(str(draft_id))
        except Exception as e:
            results["failed"].append({"id": str(draft_id), "reason": str(e)})

    return results


@router.post("/bulk/approve", response_model=dict)
async def bulk_approve_drafts(
    draft_ids: list[UUID],
    curator_notes: Optional[str] = None,
    current_curator: User = Depends(get_current_curator),
):
    """Approve multiple drafts for deployment."""
    results = {"success": [], "failed": []}

    for draft_id in draft_ids:
        try:
            draft = await MarketDraft.get_or_none(id=draft_id).prefetch_related("creator")

            if not draft or draft.status != DraftStatus.IN_REVIEW:
                results["failed"].append({"id": str(draft_id), "reason": "Not in review status"})
                continue

            draft.status = DraftStatus.APPROVED
            draft.approved_at = datetime.utcnow()
            draft.reviewed_at = datetime.utcnow()
            draft.curator_notes = curator_notes
            await draft.save()

            await CurationAction.create(
                draft=draft,
                actor=current_curator,
                action_type=CurationActionType.APPROVE,
                comment=curator_notes,
            )

            # Create market
            market = await create_market_from_draft(draft)
            draft.market = market
            await draft.save()

            results["success"].append(str(draft_id))
        except Exception as e:
            results["failed"].append({"id": str(draft_id), "reason": str(e)})

    return results


@router.post("/bulk/reject", response_model=dict)
async def bulk_reject_drafts(
    draft_ids: list[UUID],
    reason: Optional[str] = None,
    current_curator: User = Depends(get_current_curator),
):
    """Reject multiple drafts."""
    results = {"success": [], "failed": []}

    for draft_id in draft_ids:
        try:
            draft = await MarketDraft.get_or_none(id=draft_id)

            if not draft or draft.status not in [DraftStatus.IN_REVIEW, DraftStatus.PENDING]:
                results["failed"].append({"id": str(draft_id), "reason": "Cannot reject in current state"})
                continue

            draft.status = DraftStatus.REJECTED
            draft.curator_notes = reason or "Bulk rejected by curator"
            draft.reviewed_at = datetime.utcnow()
            await draft.save()

            await CurationAction.create(
                draft=draft,
                actor=current_curator,
                action_type=CurationActionType.REJECT,
                comment=reason,
            )

            results["success"].append(str(draft_id))
        except Exception as e:
            results["failed"].append({"id": str(draft_id), "reason": str(e)})

    return results


@router.get("/{draft_id}/diff", response_model=dict)
async def get_draft_diff(
    draft_id: UUID,
    compare_to: Optional[UUID] = Query(None, description="Draft ID to compare with (defaults to parent)"),
    current_curator: User = Depends(get_current_curator),
):
    """Get diff between draft versions."""
    draft = await MarketDraft.get_or_none(id=draft_id).prefetch_related("parent_draft")

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found",
        )

    # Determine comparison draft
    compare_draft = None
    if compare_to:
        compare_draft = await MarketDraft.get_or_none(id=compare_to)
    elif draft.parent_draft:
        compare_draft = draft.parent_draft

    if not compare_draft:
        return {
            "current": draft.draft_data,
            "previous": None,
            "changes": [],
            "message": "No previous version available",
        }

    # Calculate diff
    changes = calculate_draft_changes(compare_draft.draft_data, draft.draft_data)

    return {
        "current_draft_id": str(draft.id),
        "previous_draft_id": str(compare_draft.id),
        "current_version": draft.version,
        "previous_version": compare_draft.version,
        "current": draft.draft_data,
        "previous": compare_draft.draft_data,
        "changes": changes,
    }


@router.get("/{draft_id}/history", response_model=list[dict])
async def get_draft_history(
    draft_id: UUID,
    current_curator: User = Depends(get_current_curator),
):
    """Get version history for a draft."""
    draft = await MarketDraft.get_or_none(id=draft_id)

    if not draft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Draft not found",
        )

    # Get all versions (walk up the parent chain)
    versions = []
    current = draft

    while current:
        versions.append({
            "id": str(current.id),
            "version": current.version,
            "status": current.status,
            "created_at": current.created_at,
            "updated_at": current.updated_at,
            "quality_score": float(current.quality_score) if current.quality_score else None,
        })

        if current.parent_draft_id:
            current = await MarketDraft.get_or_none(id=current.parent_draft_id)
        else:
            current = None

    return versions


def calculate_draft_changes(old_data: dict, new_data: dict) -> list[dict]:
    """Calculate field-level changes between two draft versions."""
    changes = []

    # Check all fields in new data
    for key, new_value in new_data.items():
        old_value = old_data.get(key)

        if old_value != new_value:
            changes.append({
                "field": key,
                "old_value": old_value,
                "new_value": new_value,
                "change_type": "modified" if key in old_data else "added",
            })

    # Check for removed fields
    for key in old_data:
        if key not in new_data:
            changes.append({
                "field": key,
                "old_value": old_data[key],
                "new_value": None,
                "change_type": "removed",
            })

    return changes


async def create_market_from_draft(draft: MarketDraft) -> Market:
    """Helper to create Market entity from approved draft."""
    data = draft.draft_data

    # Create market
    market = await Market.create(
        creator=draft.creator,
        question_text=data.get("question_text"),
        summary=data.get("summary"),
        ai_rationale=data.get("ai_rationale"),
        topic_tags=data.get("topic_tags", []),
        external_links=data.get("external_links", []),
        primary_sources=data.get("primary_sources", []),
        trigger_condition=data.get("trigger_condition"),
        fallback_logic=data.get("fallback_logic"),
        invalidation_clause=data.get("invalidation_clause"),
        creator_stake=data.get("creator_stake", 0),
        trading_fee_bps=data.get("trading_fee_bps", 200),
        settlement_fee_bps=data.get("settlement_fee_bps", 100),
        proof_bounty=data.get("proof_bounty", 0),
        dispute_bond_minimum=data.get("dispute_bond_minimum", 0),
        fee_split_lp_bps=data.get("fee_split_lp_bps", 100),
        fee_split_creator_bps=data.get("fee_split_creator_bps", 50),
        fee_split_treasury_bps=data.get("fee_split_treasury_bps", 50),
        dispute_window_hours=data.get("dispute_window_hours", 72),
        state=MarketState.PENDING_LAUNCH,
    )

    # Create outcomes
    outcomes_data = data.get("outcomes", [])
    for outcome_data in outcomes_data:
        await MarketOutcome.create(
            market=market,
            label=outcome_data.get("label"),
            payout_weight=outcome_data.get("payout_weight", 1.0),
            display_order=outcome_data.get("display_order", 0),
            current_probability=50.0,  # Default 50/50
            current_price=0.5,
        )

    # Create resolution sources
    sources_data = data.get("resolution_sources", [])
    for source_data in sources_data:
        await MarketResolutionSource.create(
            market=market,
            source_url=source_data.get("source_url"),
            source_type=source_data.get("source_type", "api"),
            priority=source_data.get("priority", 0),
            expected_data_pattern=source_data.get("expected_data_pattern"),
            min_confirmations=source_data.get("min_confirmations", 1),
        )

    return market
