"""Market-related Pydantic schemas for API validation."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from src.models.market import MarketState


class MarketOutcomeCreate(BaseModel):
    """Schema for creating a market outcome."""

    label: str = Field(..., min_length=1, max_length=100)
    payout_weight: float = Field(1.0, ge=0, le=1)
    display_order: int = 0


class MarketOutcomeResponse(BaseModel):
    """Market outcome response."""

    id: UUID
    label: str
    payout_weight: float
    current_probability: float
    current_price: float
    display_order: int

    class Config:
        from_attributes = True


class ResolutionSourceCreate(BaseModel):
    """Schema for creating a resolution source."""

    source_url: str = Field(..., max_length=500)
    source_type: str = Field("api", max_length=50)
    priority: int = 0
    expected_data_pattern: Optional[str] = None
    min_confirmations: int = 1


class ResolutionSourceResponse(BaseModel):
    """Resolution source response."""

    id: UUID
    source_url: str
    source_type: str
    priority: int
    expected_data_pattern: Optional[str]
    min_confirmations: int

    class Config:
        from_attributes = True


class MarketCreateRequest(BaseModel):
    """Schema for creating a new market (usually from approved draft)."""

    question_text: str = Field(..., min_length=10)
    summary: Optional[str] = Field(None, max_length=500)
    ai_rationale: Optional[str] = None
    topic_tags: list[str] = Field(default_factory=list)
    external_links: list[str] = Field(default_factory=list)

    # Outcomes
    outcomes: list[MarketOutcomeCreate] = Field(..., min_items=2)

    # Resolution
    primary_sources: list[str] = Field(default_factory=list)
    trigger_condition: Optional[str] = None
    fallback_logic: Optional[str] = None
    invalidation_clause: Optional[str] = None
    resolution_sources: list[ResolutionSourceCreate] = Field(default_factory=list)

    # Economics
    creator_stake: int = Field(0, ge=0)
    trading_fee_bps: int = Field(200, ge=0, le=500)
    settlement_fee_bps: int = Field(100, ge=0, le=500)
    proof_bounty: int = Field(0, ge=0)
    dispute_bond_minimum: int = Field(0, ge=0)

    # Fee splits (must sum to trading_fee_bps)
    fee_split_lp_bps: int = Field(100, ge=0)
    fee_split_creator_bps: int = Field(50, ge=0)
    fee_split_treasury_bps: int = Field(50, ge=0)

    # Timestamps
    open_at: Optional[datetime] = None
    lock_at: Optional[datetime] = None
    resolution_deadline: Optional[datetime] = None
    dispute_window_hours: int = Field(72, ge=1)


class MarketUpdateRequest(BaseModel):
    """Schema for updating market metadata (pre-deployment only)."""

    summary: Optional[str] = None
    topic_tags: Optional[list[str]] = None
    external_links: Optional[list[str]] = None
    trigger_condition: Optional[str] = None
    fallback_logic: Optional[str] = None
    invalidation_clause: Optional[str] = None


class MarketListResponse(BaseModel):
    """Compact market response for list views (mobile/web discovery)."""

    id: UUID
    market_id: Optional[int]
    question_text: str
    summary: Optional[str]
    topic_tags: list[str]
    state: MarketState
    outcomes: list[MarketOutcomeResponse]
    total_volume: float
    total_liquidity: float
    unique_traders: int
    created_at: datetime
    resolution_deadline: Optional[datetime]
    creator_wallet: str

    class Config:
        from_attributes = True


class MarketDetailResponse(BaseModel):
    """Full market response with all details."""

    id: UUID
    market_id: Optional[int]
    version: int
    question_text: str
    summary: Optional[str]
    ai_rationale: Optional[str]
    ai_rationale_hash: Optional[str]
    topic_tags: list[str]
    external_links: list[str]

    # Resolution
    primary_sources: list[str]
    trigger_condition: Optional[str]
    fallback_logic: Optional[str]
    invalidation_clause: Optional[str]
    resolution_sources: list[ResolutionSourceResponse]

    # Economics
    creator_stake: int
    trading_fee_bps: int
    settlement_fee_bps: int
    proof_bounty: int
    dispute_bond_minimum: int
    fee_split_lp_bps: int
    fee_split_creator_bps: int
    fee_split_treasury_bps: int

    # State
    state: MarketState
    outcomes: list[MarketOutcomeResponse]

    # Timestamps
    created_at: datetime
    updated_at: datetime
    open_at: Optional[datetime]
    lock_at: Optional[datetime]
    resolution_deadline: Optional[datetime]
    dispute_window_hours: int
    resolved_at: Optional[datetime]

    # On-chain
    on_chain_address: Optional[str]
    metadata_uri: Optional[str]

    # Stats
    total_volume: float
    total_liquidity: float
    unique_traders: int

    # Creator info
    creator_wallet: str

    class Config:
        from_attributes = True
