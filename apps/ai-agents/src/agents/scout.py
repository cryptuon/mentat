"""Scout agent for researching zkTLS-verifiable data sources."""
import dspy
from loguru import logger

from src.agents.base import BaseAgent
from src.config import get_settings
from src.types import DataSource, MarketTopic

settings = get_settings()


class SourceResearchSignature(dspy.Signature):
    """Signature for researching data sources."""

    topic = dspy.InputField(desc="Market topic and context")
    category = dspy.InputField(desc="Market category (Politics, Crypto, etc.)")
    requirements = dspy.InputField(
        desc="Requirements for the data source (zkTLS compatible, reliable, etc.)"
    )

    reasoning = dspy.OutputField(desc="Reasoning about suitable data sources")
    sources = dspy.OutputField(
        desc="List of recommended data sources as JSON array with url, type, reliability, verification_method, notes"
    )
    recommended_primary = dspy.OutputField(desc="URL of the most recommended primary source")


class ScoutAgent(BaseAgent):
    """
    Scout agent researches zkTLS-verifiable data sources for market resolution.

    Responsibilities:
    - Identify reliable, verifiable data sources (APIs, official websites)
    - Assess source reliability and zkTLS compatibility
    - Recommend primary and fallback sources
    - Document verification methods
    """

    def __init__(self):
        super().__init__()
        self.researcher = dspy.ChainOfThought(SourceResearchSignature)

    def run(self, topic: MarketTopic) -> list[DataSource]:
        """
        Research data sources for a given market topic.

        Args:
            topic: Market topic with category, keywords, and context

        Returns:
            List of recommended data sources with reliability scores
        """
        logger.info(f"Scout researching sources for topic: {topic.category}")

        # Build requirements string
        requirements = self._build_requirements(topic)

        # Run DSPy chain of thought
        result = self.researcher(
            topic=topic.context or " ".join(topic.keywords),
            category=topic.category,
            requirements=requirements,
        )

        # Parse and structure results
        sources = self._parse_sources(result.sources, result.reasoning)

        logger.info(f"Scout found {len(sources)} data sources")
        return sources[:settings.scout_max_sources]

    def _build_requirements(self, topic: MarketTopic) -> str:
        """Build requirements string for the LLM."""
        requirements = [
            "Must be zkTLS-verifiable (public APIs with HTTPS, official websites)",
            "Must provide programmatic access (API preferred over webpage scraping)",
            "Must be reliable and authoritative for this topic",
            "Should have historical uptime and credibility",
            "Prefer sources with clear, unambiguous data formats",
        ]

        if topic.category.lower() == "crypto":
            requirements.append("CoinGecko, CoinMarketCap, or exchange APIs preferred")
        elif topic.category.lower() == "politics":
            requirements.append("Official government sites, Reuters, AP News preferred")
        elif topic.category.lower() == "sports":
            requirements.append("Official league APIs, ESPN API preferred")

        return "\n".join(f"- {req}" for req in requirements)

    def _parse_sources(self, sources_json: str, reasoning: str) -> list[DataSource]:
        """
        Parse LLM output into structured DataSource objects.

        The LLM returns sources as a JSON-like string. We need to parse it safely.
        """
        import json

        sources = []

        try:
            # Try to parse as JSON
            parsed = json.loads(sources_json)
            if not isinstance(parsed, list):
                parsed = [parsed]

            for item in parsed:
                if isinstance(item, dict) and "url" in item:
                    sources.append(
                        DataSource(
                            url=item.get("url", ""),
                            source_type=item.get("type", "api"),
                            reliability_score=float(item.get("reliability", 0.8)),
                            verification_method=item.get("verification_method"),
                            notes=item.get("notes"),
                        )
                    )
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Failed to parse sources JSON: {e}")

            # Fallback: extract URLs from text
            import re

            urls = re.findall(r"https?://[^\s<>\"]+", sources_json)
            for url in urls:
                sources.append(
                    DataSource(
                        url=url,
                        source_type="api",
                        reliability_score=0.7,
                        notes=f"Extracted from reasoning: {reasoning[:100]}",
                    )
                )

        return sources


# Example usage and testing
if __name__ == "__main__":
    # Configure logging
    logger.add("scout_agent.log", rotation="10 MB")

    # Test the scout agent
    scout = ScoutAgent()

    test_topic = MarketTopic(
        category="Crypto",
        keywords=["Bitcoin", "price", "$100,000"],
        context="Will Bitcoin reach $100,000 by end of 2025?",
    )

    sources = scout.run(test_topic)

    print("\n=== Scout Agent Results ===")
    for i, source in enumerate(sources, 1):
        print(f"\n{i}. {source.url}")
        print(f"   Type: {source.source_type}")
        print(f"   Reliability: {source.reliability_score}")
        if source.verification_method:
            print(f"   Verification: {source.verification_method}")
        if source.notes:
            print(f"   Notes: {source.notes}")
