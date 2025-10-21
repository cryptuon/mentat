"""AI generation endpoints for market creation."""
import asyncio
import sys
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

# Add AI agents to path
ai_agents_path = Path(__file__).parent.parent.parent.parent.parent / "ai-agents"
if str(ai_agents_path) not in sys.path:
    sys.path.insert(0, str(ai_agents_path))

try:
    from src.orchestrator import MarketCreationOrchestrator
    from src.types import MarketTopic as AIMarketTopic
except ImportError:
    # AI agents not available
    MarketCreationOrchestrator = None
    AIMarketTopic = None

from src.middleware.auth import get_current_user
from src.models.curation import MarketDraft, DraftStatus
from src.models.user import User

router = APIRouter()


class MarketTopicRequest(BaseModel):
    """Request to generate market from topic."""

    topic: dict  # {category, keywords, context}
    deadline_days: int = 30
    auto_submit: bool = False


class GenerateDraftResponse(BaseModel):
    """Response from draft generation."""

    success: bool
    job_id: str
    draft: dict | None = None
    validation: dict | None = None
    submitted: bool = False
    draft_id: str | None = None
    errors: list[str] = []


@router.post("/generate-draft", response_model=GenerateDraftResponse)
async def generate_draft(
    request: MarketTopicRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Generate a market draft using AI agents.

    This endpoint orchestrates the Scout, Draft, and Validator agents
    to create a complete market specification.
    """
    if MarketCreationOrchestrator is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI agents service not available",
        )

    try:
        # Create orchestrator
        orchestrator = MarketCreationOrchestrator()

        # Convert request to AI topic
        topic = AIMarketTopic(
            category=request.topic.get("category", ""),
            keywords=request.topic.get("keywords", []),
            context=request.topic.get("context", ""),
        )

        # Run agent pipeline
        result = await orchestrator.create_market_draft(
            topic=topic,
            user_id=str(current_user.id),
            deadline_days=request.deadline_days,
            auto_submit=False,  # We'll handle submission separately
        )

        # If successful and we have a draft, create it in the database
        if result["success"] and result["draft"]:
            draft = await MarketDraft.create(
                creator=current_user,
                draft_data=result["draft"],
                ai_model_used=result.get("ai_model_used", "gpt-4-turbo-preview"),
                ai_generation_metadata=result.get("ai_generation_metadata", {}),
                status=DraftStatus.PENDING,
                quality_score=result["validation"]["quality_score"] if result["validation"] else None,
                safety_score=result["validation"]["safety_score"] if result["validation"] else None,
                clarity_score=result["validation"]["clarity_score"] if result["validation"] else None,
                validation_errors=result["validation"]["errors"] if result["validation"] else [],
                validation_warnings=result["validation"]["warnings"] if result["validation"] else [],
            )

            result["draft_id"] = str(draft.id)
            result["submitted"] = True

        await orchestrator.close()

        return GenerateDraftResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate draft: {str(e)}",
        )


@router.post("/refine-draft")
async def refine_draft(
    draft_data: dict,
    feedback: str,
    current_user: User = Depends(get_current_user),
):
    """
    Refine an existing draft based on user feedback.

    TODO: Implement refinement logic with AI agents.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Draft refinement coming soon",
    )


@router.post("/validate-draft")
async def validate_draft(
    draft_data: dict,
    current_user: User = Depends(get_current_user),
):
    """
    Validate a draft without regenerating.

    TODO: Implement validation-only logic.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Validation-only endpoint coming soon",
    )
