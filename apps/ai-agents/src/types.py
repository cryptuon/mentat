"""Type definitions for AI agents."""
from typing import Any, Literal

from pydantic import BaseModel, Field


class MarketTopic(BaseModel):
    """Market topic/theme for generation."""

    category: str = Field(..., description="Main category (Politics, Crypto, Sports, etc.)")
    keywords: list[str] = Field(default_factory=list, description="Related keywords")
    context: str | None = Field(None, description="Additional context or requirements")


class DataSource(BaseModel):
    """Data source for market resolution."""

    url: str = Field(..., description="Source URL or API endpoint")
    source_type: Literal["api", "webpage", "rss"] = "api"
    reliability_score: float = Field(0.8, ge=0, le=1, description="Reliability rating")
    verification_method: str | None = Field(
        None, description="How to verify data from this source"
    )
    notes: str | None = Field(None, description="Additional notes about the source")


class MarketDraftData(BaseModel):
    """Complete market draft data structure."""

    # Core question
    question_text: str = Field(..., min_length=10)
    summary: str = Field(..., description="1-2 sentence summary")
    ai_rationale: str = Field(..., description="Detailed explanation of market design")

    # Classification
    topic_tags: list[str] = Field(default_factory=list)
    external_links: list[str] = Field(default_factory=list)

    # Outcomes
    outcomes: list[dict[str, Any]] = Field(
        ..., min_items=2, description="Possible outcomes (YES/NO or multi-choice)"
    )

    # Resolution criteria
    primary_sources: list[str] = Field(default_factory=list)
    trigger_condition: str = Field(..., description="Exact condition for resolution")
    fallback_logic: str | None = None
    invalidation_clause: str | None = None
    resolution_sources: list[dict[str, Any]] = Field(default_factory=list)

    # Economics
    trading_fee_bps: int = Field(200, ge=0, le=500)
    settlement_fee_bps: int = Field(100, ge=0, le=500)
    creator_stake: int = Field(0, ge=0)
    proof_bounty: int = Field(0, ge=0)

    # Fee distribution
    fee_split_lp_bps: int = 100
    fee_split_creator_bps: int = 50
    fee_split_treasury_bps: int = 50

    # Timeline
    proposed_open: str | None = None  # ISO datetime
    resolution_deadline: str | None = None  # ISO datetime
    dispute_window_hours: int = 72


class ValidationResult(BaseModel):
    """Result of market validation."""

    is_valid: bool
    quality_score: float = Field(ge=0, le=1)
    safety_score: float = Field(ge=0, le=1)
    clarity_score: float = Field(ge=0, le=1)

    errors: list[str] = Field(default_factory=list, description="Critical errors")
    warnings: list[str] = Field(default_factory=list, description="Non-critical warnings")
    suggestions: list[str] = Field(default_factory=list, description="Improvement suggestions")

    feedback: str | None = Field(None, description="Detailed feedback for creator")


class AgentJobInput(BaseModel):
    """Input for an agent job."""

    job_id: str
    job_type: Literal["scout", "draft", "validate", "summarize"]
    payload: dict[str, Any]
    metadata: dict[str, Any] = Field(default_factory=dict)


class AgentJobOutput(BaseModel):
    """Output from an agent job."""

    job_id: str
    success: bool
    result: dict[str, Any] | None = None
    error: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
