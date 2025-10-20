"""Curation workflow models for human-in-the-loop market approval."""
from enum import Enum

from tortoise import fields
from tortoise.models import Model


class DraftStatus(str, Enum):
    """Market draft curation status."""

    PENDING = "pending"  # Awaiting curator review
    IN_REVIEW = "in_review"  # Curator is actively reviewing
    CHANGES_REQUESTED = "changes_requested"  # Needs creator edits
    APPROVED = "approved"  # Approved for deployment
    REJECTED = "rejected"  # Permanently rejected
    DEPLOYED = "deployed"  # Deployed on-chain


class CurationActionType(str, Enum):
    """Types of curator actions."""

    SUBMIT = "submit"  # Creator submits draft
    CLAIM = "claim"  # Curator claims for review
    COMMENT = "comment"  # Add feedback/notes
    REQUEST_CHANGES = "request_changes"  # Send back for edits
    APPROVE = "approve"  # Approve for deployment
    REJECT = "reject"  # Reject permanently
    EDIT = "edit"  # Curator makes direct edits
    DEPLOY = "deploy"  # Trigger on-chain deployment


class MarketDraft(Model):
    """
    Draft version of a market before on-chain deployment.
    Stores all market data in JSON for flexibility during curation.
    """

    id = fields.UUIDField(pk=True)

    # References
    creator = fields.ForeignKeyField("models.User", related_name="drafts_created")
    market = fields.OneToOneField(
        "models.Market", related_name="draft", null=True
    )  # Links to final market

    # Draft content (flexible JSON storage during curation)
    draft_data = fields.JSONField()  # Full market specification as JSON

    # AI Generation metadata
    ai_model_used = fields.CharField(max_length=100, null=True)  # "gpt-4", "claude-3"
    ai_generation_metadata = fields.JSONField(null=True)  # Token count, latency, etc.
    conversation_history = fields.JSONField(null=True)  # AI chat history for context

    # Curation workflow
    status = fields.CharEnumField(DraftStatus, default=DraftStatus.PENDING, index=True)
    assigned_curator = fields.ForeignKeyField(
        "models.User", related_name="drafts_assigned", null=True
    )

    # Quality scores (computed by validator agent)
    quality_score = fields.DecimalField(max_digits=5, decimal_places=2, null=True)
    safety_score = fields.DecimalField(max_digits=5, decimal_places=2, null=True)
    clarity_score = fields.DecimalField(max_digits=5, decimal_places=2, null=True)

    # Validation findings
    validation_errors = fields.JSONField(default=list)  # List of error objects
    validation_warnings = fields.JSONField(default=list)  # List of warning objects

    # Curator feedback
    curator_notes = fields.TextField(null=True)
    requested_changes = fields.JSONField(null=True)  # Structured change requests

    # Version tracking
    version = fields.IntField(default=1)
    parent_draft = fields.ForeignKeyField(
        "models.MarketDraft", related_name="revisions", null=True
    )

    # Timestamps
    created_at = fields.DatetimeField(auto_now_add=True, index=True)
    updated_at = fields.DatetimeField(auto_now=True)
    submitted_at = fields.DatetimeField(null=True)
    reviewed_at = fields.DatetimeField(null=True)
    approved_at = fields.DatetimeField(null=True)
    deployed_at = fields.DatetimeField(null=True)

    class Meta:
        table = "market_drafts"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        question = self.draft_data.get("question_text", "")[:50] if self.draft_data else "empty"
        return f"Draft({self.status.value}: {question})"


class CurationAction(Model):
    """
    Audit trail of all curator and creator actions on a draft.
    Enables transparency and feedback loop for AI improvement.
    """

    id = fields.UUIDField(pk=True)

    # References
    draft = fields.ForeignKeyField("models.MarketDraft", related_name="actions")
    actor = fields.ForeignKeyField("models.User", related_name="curation_actions")

    # Action details
    action_type = fields.CharEnumField(CurationActionType, index=True)
    comment = fields.TextField(null=True)

    # Field-level changes (for EDIT actions)
    field_changes = fields.JSONField(null=True)  # {"question_text": {"old": "...", "new": "..."}}

    # Metadata
    metadata = fields.JSONField(null=True)  # Additional context

    created_at = fields.DatetimeField(auto_now_add=True, index=True)

    class Meta:
        table = "curation_actions"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"CurationAction({self.action_type.value} by {self.actor})"
