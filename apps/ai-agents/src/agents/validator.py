"""Validator agent for quality and safety checks on market drafts."""
import dspy
from loguru import logger

from src.agents.base import BaseAgent
from src.config import get_settings
from src.types import MarketDraftData, ValidationResult

settings = get_settings()


class QualityCheckSignature(dspy.Signature):
    """Signature for quality assessment."""

    question = dspy.InputField(desc="Market question")
    criteria = dspy.InputField(desc="Resolution criteria and sources")

    reasoning = dspy.OutputField(desc="Reasoning for quality assessment")
    quality_score = dspy.OutputField(desc="Quality score 0-1 as decimal number")
    clarity_score = dspy.OutputField(desc="Clarity score 0-1 as decimal number")
    issues = dspy.OutputField(desc="List of quality issues as JSON array of strings")
    suggestions = dspy.OutputField(desc="List of improvement suggestions as JSON array")


class SafetyCheckSignature(dspy.Signature):
    """Signature for safety and content moderation."""

    question = dspy.InputField(desc="Market question")
    category = dspy.InputField(desc="Market category")
    context = dspy.InputField(desc="Full market context and rationale")

    reasoning = dspy.OutputField(desc="Reasoning for safety assessment")
    safety_score = dspy.OutputField(desc="Safety score 0-1 as decimal number")
    concerns = dspy.OutputField(desc="List of safety concerns as JSON array of strings")
    is_appropriate = dspy.OutputField(desc="true or false - whether market is appropriate")


class ComplianceCheckSignature(dspy.Signature):
    """Signature for checking compliance with market standards."""

    question = dspy.InputField(desc="Market question")
    resolution_criteria = dspy.InputField(desc="Resolution criteria details")
    sources = dspy.InputField(desc="Proposed data sources")

    reasoning = dspy.OutputField(desc="Reasoning for compliance check")
    compliant = dspy.OutputField(desc="true or false - whether draft is compliant")
    errors = dspy.OutputField(desc="Critical compliance errors as JSON array")
    warnings = dspy.OutputField(desc="Non-critical warnings as JSON array")


class ValidatorAgent(BaseAgent):
    """
    Validator agent performs quality, safety, and compliance checks.

    Responsibilities:
    - Assess question clarity and unambiguity
    - Check resolution criteria completeness
    - Verify data source appropriateness
    - Flag safety/moderation concerns
    - Validate compliance with market standards
    - Generate structured feedback for creators
    """

    def __init__(self):
        super().__init__()

        # DSPy modules for different check types
        self.quality_checker = dspy.ChainOfThought(QualityCheckSignature)
        self.safety_checker = dspy.ChainOfThought(SafetyCheckSignature)
        self.compliance_checker = dspy.ChainOfThought(ComplianceCheckSignature)

    def run(self, draft: MarketDraftData) -> ValidationResult:
        """
        Validate a market draft across quality, safety, and compliance.

        Args:
            draft: Market draft to validate

        Returns:
            ValidationResult with scores, errors, warnings, and suggestions
        """
        logger.info(f"Validating draft: {draft.question_text[:50]}...")

        # Run all checks
        quality_result = self._check_quality(draft)
        safety_result = self._check_safety(draft)
        compliance_result = self._check_compliance(draft)

        # Aggregate results
        validation = self._aggregate_results(
            quality_result, safety_result, compliance_result
        )

        logger.info(
            f"Validation complete - Quality: {validation.quality_score:.2f}, "
            f"Safety: {validation.safety_score:.2f}, "
            f"Valid: {validation.is_valid}"
        )

        return validation

    def _check_quality(self, draft: MarketDraftData) -> dict:
        """Check question quality and clarity."""
        criteria_str = (
            f"Trigger: {draft.trigger_condition}\n"
            f"Fallback: {draft.fallback_logic}\n"
            f"Invalidation: {draft.invalidation_clause}"
        )

        result = self.quality_checker(
            question=draft.question_text, criteria=criteria_str
        )

        import json

        try:
            issues = json.loads(result.issues) if result.issues else []
            suggestions = json.loads(result.suggestions) if result.suggestions else []
        except json.JSONDecodeError:
            issues = [result.issues] if result.issues else []
            suggestions = [result.suggestions] if result.suggestions else []

        try:
            quality_score = float(result.quality_score)
            clarity_score = float(result.clarity_score)
        except (ValueError, TypeError):
            quality_score = 0.5
            clarity_score = 0.5

        return {
            "quality_score": quality_score,
            "clarity_score": clarity_score,
            "issues": issues,
            "suggestions": suggestions,
            "reasoning": result.reasoning,
        }

    def _check_safety(self, draft: MarketDraftData) -> dict:
        """Check for safety and moderation concerns."""
        context = f"{draft.summary}\n\nRationale: {draft.ai_rationale}"

        result = self.safety_checker(
            question=draft.question_text,
            category=draft.topic_tags[0] if draft.topic_tags else "General",
            context=context,
        )

        import json

        try:
            concerns = json.loads(result.concerns) if result.concerns else []
        except json.JSONDecodeError:
            concerns = [result.concerns] if result.concerns else []

        try:
            safety_score = float(result.safety_score)
        except (ValueError, TypeError):
            safety_score = 0.5

        is_appropriate = result.is_appropriate.lower() == "true"

        return {
            "safety_score": safety_score,
            "concerns": concerns,
            "is_appropriate": is_appropriate,
            "reasoning": result.reasoning,
        }

    def _check_compliance(self, draft: MarketDraftData) -> dict:
        """Check compliance with market standards."""
        resolution_str = (
            f"Question: {draft.question_text}\n"
            f"Trigger: {draft.trigger_condition}\n"
            f"Fallback: {draft.fallback_logic}\n"
            f"Invalidation: {draft.invalidation_clause}\n"
            f"Deadline: {draft.resolution_deadline}\n"
            f"Dispute window: {draft.dispute_window_hours}h"
        )

        sources_str = "\n".join(f"- {s}" for s in draft.primary_sources)

        result = self.compliance_checker(
            question=draft.question_text,
            resolution_criteria=resolution_str,
            sources=sources_str,
        )

        import json

        try:
            errors = json.loads(result.errors) if result.errors else []
            warnings = json.loads(result.warnings) if result.warnings else []
        except json.JSONDecodeError:
            errors = []
            warnings = []

        compliant = result.compliant.lower() == "true"

        return {
            "compliant": compliant,
            "errors": errors,
            "warnings": warnings,
            "reasoning": result.reasoning,
        }

    def _aggregate_results(
        self, quality: dict, safety: dict, compliance: dict
    ) -> ValidationResult:
        """Aggregate all check results into final validation."""
        # Collect all errors and warnings
        errors = []
        warnings = []
        suggestions = quality["suggestions"]

        # Add quality issues
        errors.extend(quality["issues"])

        # Add safety concerns as errors if not appropriate
        if not safety["is_appropriate"]:
            errors.extend(safety["concerns"])
        elif safety["concerns"]:
            warnings.extend(safety["concerns"])

        # Add compliance errors and warnings
        errors.extend(compliance["errors"])
        warnings.extend(compliance["warnings"])

        # Check minimum scores
        quality_pass = quality["quality_score"] >= settings.validator_min_quality_score
        safety_pass = safety["safety_score"] >= settings.validator_min_safety_score
        compliance_pass = compliance["compliant"]

        is_valid = quality_pass and safety_pass and compliance_pass and len(errors) == 0

        # Generate detailed feedback
        feedback_parts = []
        if not quality_pass:
            feedback_parts.append(
                f"Quality score ({quality['quality_score']:.2f}) below threshold "
                f"({settings.validator_min_quality_score})"
            )
        if not safety_pass:
            feedback_parts.append(
                f"Safety score ({safety['safety_score']:.2f}) below threshold "
                f"({settings.validator_min_safety_score})"
            )
        if not compliance_pass:
            feedback_parts.append("Market does not comply with standards")

        feedback = "\n".join(feedback_parts) if feedback_parts else "Draft meets all validation criteria"

        return ValidationResult(
            is_valid=is_valid,
            quality_score=quality["quality_score"],
            safety_score=safety["safety_score"],
            clarity_score=quality["clarity_score"],
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
            feedback=feedback,
        )


# Example usage and testing
if __name__ == "__main__":
    # Configure logging
    logger.add("validator_agent.log", rotation="10 MB")

    # Test the validator
    validator = ValidatorAgent()

    # Create a test draft
    test_draft = MarketDraftData(
        question_text="Will Bitcoin reach $100,000 by December 31, 2025?",
        summary="Binary market on Bitcoin price milestone by end of 2025",
        ai_rationale="Using CoinGecko API for reliable price data with fallback to CoinMarketCap",
        topic_tags=["Crypto", "Bitcoin", "Price"],
        external_links=[],
        outcomes=[
            {"label": "YES", "payout_weight": 1.0, "display_order": 0},
            {"label": "NO", "payout_weight": 0.0, "display_order": 1},
        ],
        primary_sources=["https://api.coingecko.com/api/v3/simple/price"],
        trigger_condition="CoinGecko API shows BTC price >= $100,000 USD before deadline",
        fallback_logic="If CoinGecko unavailable, use CoinMarketCap API",
        invalidation_clause="If both APIs offline for >24h, resolve INVALID",
        resolution_sources=[
            {
                "source_url": "https://api.coingecko.com/api/v3/simple/price",
                "source_type": "api",
                "priority": 0,
                "min_confirmations": 1,
            }
        ],
        resolution_deadline="2025-12-31T23:59:59Z",
    )

    validation = validator.run(test_draft)

    print("\n=== Validator Results ===")
    print(f"\nValid: {validation.is_valid}")
    print(f"Quality Score: {validation.quality_score:.2f}")
    print(f"Safety Score: {validation.safety_score:.2f}")
    print(f"Clarity Score: {validation.clarity_score:.2f}")

    if validation.errors:
        print(f"\nErrors:")
        for error in validation.errors:
            print(f"  ❌ {error}")

    if validation.warnings:
        print(f"\nWarnings:")
        for warning in validation.warnings:
            print(f"  ⚠️  {warning}")

    if validation.suggestions:
        print(f"\nSuggestions:")
        for suggestion in validation.suggestions:
            print(f"  💡 {suggestion}")

    if validation.feedback:
        print(f"\nFeedback:\n{validation.feedback}")
