"""Market models aligned with the canonical market standard."""
from enum import Enum

from tortoise import fields
from tortoise.models import Model


class MarketState(str, Enum):
    """Market lifecycle states."""

    DRAFT = "draft"
    PENDING_LAUNCH = "pending_launch"
    ACTIVE = "active"
    LOCKED = "locked"
    RESOLVED = "resolved"
    INVALID = "invalid"
    DISPUTED = "disputed"


class Market(Model):
    """
    Core market entity following the standard market specification.
    Designed for both on-chain deployment and off-chain metadata storage.
    """

    id = fields.UUIDField(pk=True)

    # Market Identity
    market_id = fields.BigIntField(unique=True, null=True, index=True)  # Solana program ID
    version = fields.IntField(default=1)
    creator = fields.ForeignKeyField("models.User", related_name="markets_created")

    # Question & Outcomes
    question_text = fields.TextField()
    summary = fields.TextField(null=True)  # 1-2 sentence AI-generated summary
    ai_rationale = fields.TextField(null=True)  # Full AI rationale
    ai_rationale_hash = fields.CharField(max_length=64, null=True)  # Blake2 hash

    # Topic & Discovery
    topic_tags = fields.JSONField(default=list)  # ["Politics", "US", "Elections"]
    external_links = fields.JSONField(default=list)  # Trusted references

    # Resolution Configuration
    primary_sources = fields.JSONField(default=list)  # Ordered list of domains/endpoints
    trigger_condition = fields.TextField(null=True)  # JSONPath query or pattern
    fallback_logic = fields.TextField(null=True)
    invalidation_clause = fields.TextField(null=True)

    # Economic Parameters (in lamports/smallest units)
    creator_stake = fields.BigIntField(default=0)
    trading_fee_bps = fields.IntField(default=200)  # 2% default
    settlement_fee_bps = fields.IntField(default=100)  # 1% default
    proof_bounty = fields.BigIntField(default=0)
    dispute_bond_minimum = fields.BigIntField(default=0)

    # Fee distribution (basis points, must sum to trading_fee_bps)
    fee_split_lp_bps = fields.IntField(default=100)  # 50% to LP
    fee_split_creator_bps = fields.IntField(default=50)  # 25% to creator
    fee_split_treasury_bps = fields.IntField(default=50)  # 25% to treasury

    # Lifecycle State
    state = fields.CharEnumField(MarketState, default=MarketState.DRAFT, index=True)

    # Timestamps (all UTC)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    open_at = fields.DatetimeField(null=True)
    lock_at = fields.DatetimeField(null=True)
    resolution_deadline = fields.DatetimeField(null=True)
    dispute_window_hours = fields.IntField(default=72)  # 3 days default
    resolved_at = fields.DatetimeField(null=True)

    # On-chain references
    on_chain_address = fields.CharField(max_length=44, null=True, unique=True)  # Solana pubkey
    metadata_uri = fields.CharField(max_length=500, null=True)  # IPFS/Arweave

    # Denormalized stats (updated by indexer)
    total_volume = fields.DecimalField(max_digits=20, decimal_places=2, default=0)
    total_liquidity = fields.DecimalField(max_digits=20, decimal_places=2, default=0)
    unique_traders = fields.IntField(default=0)

    class Meta:
        table = "markets"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Market({self.market_id or 'draft'}: {self.question_text[:50]})"


class MarketOutcome(Model):
    """
    Possible outcomes for a market.
    Binary markets have YES/NO, multi-outcome markets have multiple entries.
    """

    id = fields.UUIDField(pk=True)
    market = fields.ForeignKeyField("models.Market", related_name="outcomes")

    label = fields.CharField(max_length=100)  # "YES", "NO", or custom
    payout_weight = fields.DecimalField(
        max_digits=10, decimal_places=4, default=1.0
    )  # Usually 1 or 0

    # Current state (denormalized from on-chain)
    current_probability = fields.DecimalField(max_digits=5, decimal_places=2, default=50.0)
    current_price = fields.DecimalField(max_digits=10, decimal_places=6, default=0.5)

    # Order for display
    display_order = fields.IntField(default=0)

    class Meta:
        table = "market_outcomes"
        ordering = ["display_order"]

    def __str__(self) -> str:
        return f"{self.label} ({self.current_probability}%)"


class MarketResolutionSource(Model):
    """
    zkTLS-verifiable data sources for market resolution.
    Ordered list with fallback priority.
    """

    id = fields.UUIDField(pk=True)
    market = fields.ForeignKeyField("models.Market", related_name="resolution_sources")

    source_url = fields.CharField(max_length=500)
    source_type = fields.CharField(max_length=50)  # "api", "webpage", "rss"
    priority = fields.IntField(default=0)  # Lower = higher priority

    # Proof requirements
    expected_data_pattern = fields.TextField(null=True)  # JSONPath or regex
    min_confirmations = fields.IntField(default=1)

    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "market_resolution_sources"
        ordering = ["priority"]

    def __str__(self) -> str:
        return f"Source({self.source_url}, priority={self.priority})"
