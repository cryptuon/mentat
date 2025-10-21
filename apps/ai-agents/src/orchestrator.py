"""Agent orchestrator for managing market creation workflow."""
import uuid
from typing import Any

import httpx
from loguru import logger

from src.agents import DraftAgent, ScoutAgent, ValidatorAgent
from src.config import get_settings
from src.types import MarketDraftData, MarketTopic, ValidationResult

settings = get_settings()


class MarketCreationOrchestrator:
    """
    Orchestrates the full market creation workflow with multiple agents.

    Workflow:
    1. Scout agent researches data sources
    2. Draft agent generates market specification
    3. Validator agent checks quality and compliance
    4. Submit to backend if validation passes
    """

    def __init__(self):
        self.scout = ScoutAgent()
        self.draft = DraftAgent()
        self.validator = ValidatorAgent()

        # HTTP client for backend API
        self.client = httpx.AsyncClient(
            base_url=settings.backend_api_url,
            timeout=30.0,
            headers={"Content-Type": "application/json"},
        )

    async def create_market_draft(
        self,
        topic: MarketTopic,
        user_id: str,
        deadline_days: int = 30,
        auto_submit: bool = False,
    ) -> dict[str, Any]:
        """
        Create a market draft through the full agent pipeline.

        Args:
            topic: Market topic with category and context
            user_id: Creator user ID
            deadline_days: Days until resolution deadline
            auto_submit: Whether to auto-submit if validation passes

        Returns:
            Dict with draft data, validation results, and submission status
        """
        job_id = str(uuid.uuid4())
        logger.info(f"[{job_id}] Starting market creation for topic: {topic.category}")

        result = {
            "job_id": job_id,
            "success": False,
            "draft": None,
            "validation": None,
            "submitted": False,
            "draft_id": None,
            "errors": [],
        }

        try:
            # Step 1: Scout data sources
            logger.info(f"[{job_id}] Running scout agent...")
            sources = self.scout.run(topic)

            if not sources:
                result["errors"].append("No suitable data sources found")
                return result

            logger.info(f"[{job_id}] Found {len(sources)} data sources")

            # Step 2: Generate draft
            logger.info(f"[{job_id}] Running draft agent...")
            draft = self.draft.run(topic, sources=sources, deadline_days=deadline_days)
            result["draft"] = draft.model_dump()

            logger.info(f"[{job_id}] Draft generated: {draft.question_text[:50]}...")

            # Step 3: Validate draft
            logger.info(f"[{job_id}] Running validator agent...")
            validation = self.validator.run(draft)
            result["validation"] = validation.model_dump()

            logger.info(
                f"[{job_id}] Validation complete - "
                f"Valid: {validation.is_valid}, "
                f"Quality: {validation.quality_score:.2f}"
            )

            # Step 4: Submit to backend if auto_submit and valid
            if auto_submit and validation.is_valid:
                logger.info(f"[{job_id}] Auto-submitting valid draft to backend...")
                draft_id = await self._submit_to_backend(draft, validation, user_id)
                result["submitted"] = True
                result["draft_id"] = draft_id
                logger.info(f"[{job_id}] Draft submitted with ID: {draft_id}")
            elif not validation.is_valid:
                logger.warning(
                    f"[{job_id}] Draft validation failed - not submitting. "
                    f"Errors: {validation.errors}"
                )
                result["errors"].extend(validation.errors)

            result["success"] = True

        except Exception as e:
            logger.error(f"[{job_id}] Market creation failed: {e}")
            result["errors"].append(str(e))

        return result

    async def _submit_to_backend(
        self, draft: MarketDraftData, validation: ValidationResult, user_id: str
    ) -> str:
        """
        Submit validated draft to backend API.

        Args:
            draft: Market draft data
            validation: Validation results
            user_id: Creator user ID

        Returns:
            Draft ID from backend
        """
        # Prepare draft submission
        draft_data = {
            "draft_data": draft.model_dump(),
            "ai_model_used": settings.default_model,
            "ai_generation_metadata": {
                "temperature": settings.temperature,
                "provider": settings.default_provider,
                "quality_score": validation.quality_score,
                "safety_score": validation.safety_score,
                "clarity_score": validation.clarity_score,
            },
        }

        # Submit to backend (requires authentication)
        # Note: In production, this would use service-to-service auth
        response = await self.client.post(
            "/api/v1/drafts",
            json=draft_data,
            # Add auth header if backend_api_key is configured
            headers=(
                {"Authorization": f"Bearer {settings.backend_api_key}"}
                if settings.backend_api_key
                else {}
            ),
        )

        response.raise_for_status()
        result = response.json()

        return result["id"]

    async def validate_existing_draft(self, draft_id: str) -> ValidationResult:
        """
        Validate an existing draft from the backend.

        Args:
            draft_id: Draft ID in backend

        Returns:
            Validation result
        """
        logger.info(f"Validating existing draft: {draft_id}")

        # Fetch draft from backend
        response = await self.client.get(f"/api/v1/drafts/{draft_id}")
        response.raise_for_status()
        draft_data = response.json()

        # Convert to MarketDraftData
        draft = MarketDraftData(**draft_data["draft_data"])

        # Run validation
        validation = self.validator.run(draft)

        logger.info(
            f"Draft {draft_id} validation: Valid={validation.is_valid}, "
            f"Quality={validation.quality_score:.2f}"
        )

        return validation

    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()


# Synchronous wrapper for easier use
class SyncOrchestrator:
    """Synchronous wrapper around MarketCreationOrchestrator."""

    def __init__(self):
        self._orchestrator = MarketCreationOrchestrator()

    def create_market_draft(
        self,
        topic: MarketTopic,
        user_id: str,
        deadline_days: int = 30,
        auto_submit: bool = False,
    ) -> dict[str, Any]:
        """Synchronous market creation."""
        import asyncio

        return asyncio.run(
            self._orchestrator.create_market_draft(
                topic, user_id, deadline_days, auto_submit
            )
        )

    def validate_existing_draft(self, draft_id: str) -> ValidationResult:
        """Synchronous draft validation."""
        import asyncio

        return asyncio.run(self._orchestrator.validate_existing_draft(draft_id))


# Example usage
if __name__ == "__main__":
    import asyncio

    from src.types import MarketTopic

    # Configure logging
    logger.add("orchestrator.log", rotation="10 MB")

    async def test_orchestration():
        orchestrator = MarketCreationOrchestrator()

        test_topic = MarketTopic(
            category="Crypto",
            keywords=["Bitcoin", "price", "$100,000"],
            context="Will Bitcoin reach $100,000 by the end of 2025?",
        )

        result = await orchestrator.create_market_draft(
            topic=test_topic,
            user_id="test-user-123",
            deadline_days=60,
            auto_submit=False,  # Don't submit in test
        )

        print("\n=== Orchestration Results ===")
        print(f"Success: {result['success']}")
        print(f"Job ID: {result['job_id']}")

        if result["draft"]:
            print(f"\nDraft Question: {result['draft']['question_text']}")
            print(f"Summary: {result['draft']['summary']}")

        if result["validation"]:
            val = result["validation"]
            print(f"\nValidation:")
            print(f"  Valid: {val['is_valid']}")
            print(f"  Quality: {val['quality_score']:.2f}")
            print(f"  Safety: {val['safety_score']:.2f}")

            if val["errors"]:
                print(f"  Errors: {val['errors']}")
            if val["warnings"]:
                print(f"  Warnings: {val['warnings']}")

        if result["errors"]:
            print(f"\nErrors: {result['errors']}")

        await orchestrator.close()

    # Run test
    asyncio.run(test_orchestration())
