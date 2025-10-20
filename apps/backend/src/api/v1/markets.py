"""Market endpoints for discovery, detail, and management."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from tortoise.expressions import Q

from src.middleware.auth import get_current_user, get_optional_user
from src.models.market import Market, MarketOutcome, MarketState
from src.models.user import User
from src.schemas.market import MarketDetailResponse, MarketListResponse

router = APIRouter()


@router.get("/", response_model=list[MarketListResponse])
async def list_markets(
    state: Optional[MarketState] = Query(None, description="Filter by state"),
    tags: Optional[str] = Query(None, description="Comma-separated topic tags"),
    search: Optional[str] = Query(None, description="Search in question text"),
    sort_by: str = Query("created_at", description="Sort field"),
    order: str = Query("desc", description="Sort order (asc/desc)"),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    List markets with filtering and pagination.
    Works for both authenticated and unauthenticated users (mobile/web).
    """
    query = Market.filter()

    # Filter by state
    if state:
        query = query.filter(state=state)
    else:
        # Default: show active markets
        query = query.filter(state__in=[MarketState.ACTIVE, MarketState.LOCKED])

    # Filter by tags
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        for tag in tag_list:
            query = query.filter(Q(topic_tags__contains=tag))

    # Search
    if search:
        query = query.filter(Q(question_text__icontains=search) | Q(summary__icontains=search))

    # Sort
    order_prefix = "-" if order == "desc" else ""
    query = query.order_by(f"{order_prefix}{sort_by}")

    # Paginate
    markets = await query.limit(limit).offset(offset).prefetch_related("outcomes", "creator")

    # Build response
    results = []
    for market in markets:
        outcomes = await market.outcomes.all()
        outcome_responses = [
            {
                "id": outcome.id,
                "label": outcome.label,
                "payout_weight": float(outcome.payout_weight),
                "current_probability": float(outcome.current_probability),
                "current_price": float(outcome.current_price),
                "display_order": outcome.display_order,
            }
            for outcome in outcomes
        ]

        results.append(
            MarketListResponse(
                id=market.id,
                market_id=market.market_id,
                question_text=market.question_text,
                summary=market.summary,
                topic_tags=market.topic_tags,
                state=market.state,
                outcomes=outcome_responses,
                total_volume=float(market.total_volume),
                total_liquidity=float(market.total_liquidity),
                unique_traders=market.unique_traders,
                created_at=market.created_at,
                resolution_deadline=market.resolution_deadline,
                creator_wallet=market.creator.wallet_address,
            )
        )

    return results


@router.get("/{market_id}", response_model=MarketDetailResponse)
async def get_market(
    market_id: UUID,
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Get full market details by ID.
    Supports both mobile and web clients.
    """
    market = await Market.get_or_none(id=market_id).prefetch_related(
        "outcomes", "resolution_sources", "creator"
    )

    if not market:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Market not found",
        )

    # Fetch related data
    outcomes = await market.outcomes.all().order_by("display_order")
    resolution_sources = await market.resolution_sources.all().order_by("priority")

    outcome_responses = [
        {
            "id": outcome.id,
            "label": outcome.label,
            "payout_weight": float(outcome.payout_weight),
            "current_probability": float(outcome.current_probability),
            "current_price": float(outcome.current_price),
            "display_order": outcome.display_order,
        }
        for outcome in outcomes
    ]

    source_responses = [
        {
            "id": source.id,
            "source_url": source.source_url,
            "source_type": source.source_type,
            "priority": source.priority,
            "expected_data_pattern": source.expected_data_pattern,
            "min_confirmations": source.min_confirmations,
        }
        for source in resolution_sources
    ]

    return MarketDetailResponse(
        id=market.id,
        market_id=market.market_id,
        version=market.version,
        question_text=market.question_text,
        summary=market.summary,
        ai_rationale=market.ai_rationale,
        ai_rationale_hash=market.ai_rationale_hash,
        topic_tags=market.topic_tags,
        external_links=market.external_links,
        primary_sources=market.primary_sources,
        trigger_condition=market.trigger_condition,
        fallback_logic=market.fallback_logic,
        invalidation_clause=market.invalidation_clause,
        resolution_sources=source_responses,
        creator_stake=market.creator_stake,
        trading_fee_bps=market.trading_fee_bps,
        settlement_fee_bps=market.settlement_fee_bps,
        proof_bounty=market.proof_bounty,
        dispute_bond_minimum=market.dispute_bond_minimum,
        fee_split_lp_bps=market.fee_split_lp_bps,
        fee_split_creator_bps=market.fee_split_creator_bps,
        fee_split_treasury_bps=market.fee_split_treasury_bps,
        state=market.state,
        outcomes=outcome_responses,
        created_at=market.created_at,
        updated_at=market.updated_at,
        open_at=market.open_at,
        lock_at=market.lock_at,
        resolution_deadline=market.resolution_deadline,
        dispute_window_hours=market.dispute_window_hours,
        resolved_at=market.resolved_at,
        on_chain_address=market.on_chain_address,
        metadata_uri=market.metadata_uri,
        total_volume=float(market.total_volume),
        total_liquidity=float(market.total_liquidity),
        unique_traders=market.unique_traders,
        creator_wallet=market.creator.wallet_address,
    )


@router.get("/user/{wallet_address}", response_model=list[MarketListResponse])
async def get_user_markets(
    wallet_address: str,
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    """Get all markets created by a specific user."""
    user = await User.get_or_none(wallet_address=wallet_address)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    markets = (
        await Market.filter(creator=user)
        .order_by("-created_at")
        .limit(limit)
        .offset(offset)
        .prefetch_related("outcomes", "creator")
    )

    # Build response (same as list_markets)
    results = []
    for market in markets:
        outcomes = await market.outcomes.all()
        outcome_responses = [
            {
                "id": outcome.id,
                "label": outcome.label,
                "payout_weight": float(outcome.payout_weight),
                "current_probability": float(outcome.current_probability),
                "current_price": float(outcome.current_price),
                "display_order": outcome.display_order,
            }
            for outcome in outcomes
        ]

        results.append(
            MarketListResponse(
                id=market.id,
                market_id=market.market_id,
                question_text=market.question_text,
                summary=market.summary,
                topic_tags=market.topic_tags,
                state=market.state,
                outcomes=outcome_responses,
                total_volume=float(market.total_volume),
                total_liquidity=float(market.total_liquidity),
                unique_traders=market.unique_traders,
                created_at=market.created_at,
                resolution_deadline=market.resolution_deadline,
                creator_wallet=market.creator.wallet_address,
            )
        )

    return results
