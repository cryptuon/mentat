"""Draft agent for generating prediction market questions and criteria."""
import json
from datetime import datetime, timedelta

import dspy
from loguru import logger

from src.agents.base import BaseAgent
from src.agents.scout import ScoutAgent
from src.types import DataSource, MarketDraftData, MarketTopic


class MarketQuestionSignature(dspy.Signature):
    """Signature for generating market questions."""

    topic = dspy.InputField(desc="Market topic and context")
    category = dspy.InputField(desc="Category (Politics, Crypto, Sports, etc.)")
    sources = dspy.InputField(desc="Available data sources for verification")

    reasoning = dspy.OutputField(desc="Reasoning for question design")
    question = dspy.OutputField(
        desc="Clear, unambiguous prediction market question starting with 'Will' or 'Did'"
    )
    summary = dspy.OutputField(desc="1-2 sentence summary for discovery")
    outcomes = dspy.OutputField(desc="Possible outcomes as JSON array [{label, payout_weight}]")


class ResolutionCriteriaSignature(dspy.Signature):
    """Signature for generating resolution criteria."""

    question = dspy.InputField(desc="Market question")
    sources = dspy.InputField(desc="Primary data sources")
    category = dspy.InputField(desc="Market category")

    reasoning = dspy.OutputField(desc="Reasoning for resolution logic")
    trigger_condition = dspy.OutputField(
        desc="Exact, verifiable condition for resolution (JSONPath query or specific phrase)"
    )
    fallback_logic = dspy.OutputField(
        desc="Fallback logic if primary source unavailable"
    )
    invalidation_clause = dspy.OutputField(
        desc="Conditions that would force INVALID resolution"
    )


class MarketRationaleSignature(dspy.Signature):
    """Signature for generating market rationale."""

    question = dspy.InputField(desc="Market question")
    resolution_criteria = dspy.InputField(desc="Resolution criteria")
    sources = dspy.InputField(desc="Data sources")

    rationale = dspy.OutputField(
        desc="Detailed explanation of market design, source selection, and why this setup minimizes disputes"
    )


class DraftAgent(BaseAgent):
    """
    Draft agent generates complete market specifications.

    Responsibilities:
    - Create clear, unambiguous market questions
    - Define precise resolution criteria
    - Map questions to zkTLS-verifiable sources
    - Generate AI rationale for transparency
    - Ensure compliance with market standards
    """

    def __init__(self):
        super().__init__()
        self.scout = ScoutAgent()

        # DSPy modules
        self.question_generator = dspy.ChainOfThought(MarketQuestionSignature)
        self.criteria_generator = dspy.ChainOfThought(ResolutionCriteriaSignature)
        self.rationale_generator = dspy.ChainOfThought(MarketRationaleSignature)

    def run(
        self,
        topic: MarketTopic,
        sources: list[DataSource] | None = None,
        deadline_days: int = 30,
    ) -> MarketDraftData:
        """
        Generate a complete market draft from a topic.

        Args:
            topic: Market topic with category and context
            sources: Optional pre-researched sources (will scout if not provided)
            deadline_days: Days until resolution deadline

        Returns:
            Complete market draft ready for curator review
        """
        logger.info(f"Draft agent generating market for topic: {topic.category}")

        # Step 1: Scout data sources if not provided
        if not sources:
            logger.info("No sources provided, running scout agent...")
            sources = self.scout.run(topic)

        if not sources:
            raise ValueError("No suitable data sources found for this topic")

        # Step 2: Generate market question and outcomes
        question_result = self._generate_question(topic, sources)

        # Step 3: Generate resolution criteria
        criteria_result = self._generate_criteria(
            question_result["question"], sources, topic.category
        )

        # Step 4: Generate rationale
        rationale = self._generate_rationale(
            question_result["question"], criteria_result, sources
        )

        # Step 5: Assemble complete draft
        draft = self._assemble_draft(
            topic=topic,
            question_data=question_result,
            criteria_data=criteria_result,
            rationale=rationale,
            sources=sources,
            deadline_days=deadline_days,
        )

        logger.info(f"Draft complete: {draft.question_text[:50]}...")
        return draft

    def _generate_question(
        self, topic: MarketTopic, sources: list[DataSource]
    ) -> dict:
        """Generate market question and outcomes."""
        sources_str = "\n".join(f"- {s.url} ({s.source_type})" for s in sources[:3])

        result = self.question_generator(
            topic=topic.context or " ".join(topic.keywords),
            category=topic.category,
            sources=sources_str,
        )

        # Parse outcomes
        try:
            outcomes = json.loads(result.outcomes)
            if not isinstance(outcomes, list):
                outcomes = [{"label": "YES", "payout_weight": 1.0}, {"label": "NO", "payout_weight": 0.0}]
        except json.JSONDecodeError:
            # Default to binary YES/NO
            outcomes = [
                {"label": "YES", "payout_weight": 1.0, "display_order": 0},
                {"label": "NO", "payout_weight": 0.0, "display_order": 1},
            ]

        return {
            "question": result.question,
            "summary": result.summary,
            "outcomes": outcomes,
            "reasoning": result.reasoning,
        }

    def _generate_criteria(
        self, question: str, sources: list[DataSource], category: str
    ) -> dict:
        """Generate resolution criteria."""
        sources_str = "\n".join(
            f"- {s.url} (reliability: {s.reliability_score})" for s in sources[:3]
        )

        result = self.criteria_generator(
            question=question, sources=sources_str, category=category
        )

        return {
            "trigger_condition": result.trigger_condition,
            "fallback_logic": result.fallback_logic,
            "invalidation_clause": result.invalidation_clause,
            "reasoning": result.reasoning,
        }

    def _generate_rationale(
        self, question: str, criteria: dict, sources: list[DataSource]
    ) -> str:
        """Generate AI rationale explaining market design."""
        sources_str = "\n".join(f"- {s.url}: {s.notes or 'Verified source'}" for s in sources[:3])

        criteria_str = (
            f"Trigger: {criteria['trigger_condition']}\n"
            f"Fallback: {criteria['fallback_logic']}\n"
            f"Invalidation: {criteria['invalidation_clause']}"
        )

        result = self.rationale_generator(
            question=question, resolution_criteria=criteria_str, sources=sources_str
        )

        return result.rationale

    def _assemble_draft(
        self,
        topic: MarketTopic,
        question_data: dict,
        criteria_data: dict,
        rationale: str,
        sources: list[DataSource],
        deadline_days: int,
    ) -> MarketDraftData:
        """Assemble all components into a complete draft."""
        now = datetime.utcnow()
        resolution_deadline = (now + timedelta(days=deadline_days)).isoformat()

        # Build resolution sources
        resolution_sources = [
            {
                "source_url": source.url,
                "source_type": source.source_type,
                "priority": idx,
                "expected_data_pattern": None,  # Will be refined by curator
                "min_confirmations": 1,
            }
            for idx, source in enumerate(sources[:3])
        ]

        draft = MarketDraftData(
            question_text=question_data["question"],
            summary=question_data["summary"],
            ai_rationale=rationale,
            topic_tags=([topic.category] + topic.keywords)[:5],
            external_links=[],
            outcomes=question_data["outcomes"],
            primary_sources=[s.url for s in sources[:3]],
            trigger_condition=criteria_data["trigger_condition"],
            fallback_logic=criteria_data["fallback_logic"],
            invalidation_clause=criteria_data["invalidation_clause"],
            resolution_sources=resolution_sources,
            trading_fee_bps=200,  # 2%
            settlement_fee_bps=100,  # 1%
            creator_stake=0,
            proof_bounty=0,
            fee_split_lp_bps=100,
            fee_split_creator_bps=50,
            fee_split_treasury_bps=50,
            resolution_deadline=resolution_deadline,
            dispute_window_hours=72,
        )

        return draft


# Example usage and testing
if __name__ == "__main__":
    # Configure logging
    logger.add("draft_agent.log", rotation="10 MB")

    # Test the draft agent
    draft_agent = DraftAgent()

    test_topic = MarketTopic(
        category="Crypto",
        keywords=["Bitcoin", "price", "$100,000"],
        context="Will Bitcoin reach $100,000 by the end of 2025?",
    )

    try:
        draft = draft_agent.run(test_topic, deadline_days=60)

        print("\n=== Draft Agent Results ===")
        print(f"\nQuestion: {draft.question_text}")
        print(f"\nSummary: {draft.summary}")
        print(f"\nOutcomes: {draft.outcomes}")
        print(f"\nTrigger Condition: {draft.trigger_condition}")
        print(f"\nFallback Logic: {draft.fallback_logic}")
        print(f"\nInvalidation: {draft.invalidation_clause}")
        print(f"\nPrimary Sources:")
        for source in draft.primary_sources:
            print(f"  - {source}")
        print(f"\nRationale:\n{draft.ai_rationale}")
        print(f"\nResolution Deadline: {draft.resolution_deadline}")
    except Exception as e:
        logger.error(f"Draft generation failed: {e}")
        raise
