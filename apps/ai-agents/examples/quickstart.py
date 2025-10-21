#!/usr/bin/env python3
"""
Quickstart example for Mentat AI Agents.

This script demonstrates how to use the agent system to create a prediction market.
"""
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from loguru import logger

from src.orchestrator import SyncOrchestrator
from src.types import MarketTopic


def main():
    """Run quickstart example."""
    # Configure logging
    logger.add("quickstart.log", rotation="10 MB", level="INFO")
    logger.info("Starting Mentat AI Agents Quickstart")

    # Initialize orchestrator
    orchestrator = SyncOrchestrator()

    # Define example topics
    topics = [
        MarketTopic(
            category="Crypto",
            keywords=["Bitcoin", "price", "$100,000"],
            context="Will Bitcoin reach $100,000 by December 31, 2025?",
        ),
        MarketTopic(
            category="Politics",
            keywords=["US", "election", "2024"],
            context="Will the incumbent party win the 2024 US presidential election?",
        ),
        MarketTopic(
            category="Tech",
            keywords=["AI", "GPT-5", "release"],
            context="Will OpenAI release GPT-5 before the end of 2025?",
        ),
    ]

    # Process each topic
    for i, topic in enumerate(topics, 1):
        print(f"\n{'='*80}")
        print(f"Example {i}/{len(topics)}: {topic.category}")
        print(f"{'='*80}")
        print(f"Context: {topic.context}\n")

        try:
            # Create market draft
            logger.info(f"Processing topic {i}: {topic.category}")

            result = orchestrator.create_market_draft(
                topic=topic,
                user_id="quickstart-demo",
                deadline_days=365,
                auto_submit=False,  # Don't submit in demo
            )

            # Display results
            if result["success"]:
                draft = result["draft"]
                validation = result["validation"]

                print("✅ Draft Generated Successfully\n")

                print(f"Question: {draft['question_text']}")
                print(f"Summary:  {draft['summary']}\n")

                print("Outcomes:")
                for outcome in draft["outcomes"]:
                    print(f"  • {outcome['label']}")

                print(f"\nTrigger Condition:")
                print(f"  {draft['trigger_condition']}\n")

                print(f"Primary Sources:")
                for source in draft["primary_sources"][:3]:
                    print(f"  • {source}")

                print(f"\nValidation Results:")
                print(f"  Valid:   {validation['is_valid']}")
                print(f"  Quality: {validation['quality_score']:.2f}")
                print(f"  Safety:  {validation['safety_score']:.2f}")
                print(f"  Clarity: {validation['clarity_score']:.2f}")

                if validation["errors"]:
                    print(f"\n  Errors:")
                    for error in validation["errors"]:
                        print(f"    ❌ {error}")

                if validation["warnings"]:
                    print(f"\n  Warnings:")
                    for warning in validation["warnings"]:
                        print(f"    ⚠️  {warning}")

                if validation["suggestions"]:
                    print(f"\n  Suggestions:")
                    for suggestion in validation["suggestions"][:3]:
                        print(f"    💡 {suggestion}")

                print(f"\nAI Rationale (excerpt):")
                rationale = draft["ai_rationale"]
                print(f"  {rationale[:200]}...")

            else:
                print("❌ Draft Generation Failed")
                print(f"Errors: {result['errors']}")

        except Exception as e:
            logger.error(f"Failed to process topic {i}: {e}")
            print(f"❌ Error: {e}")

        input("\nPress Enter to continue to next example...")

    print(f"\n{'='*80}")
    print("Quickstart Complete!")
    print(f"{'='*80}")
    print("\nNext steps:")
    print("1. Review the generated drafts above")
    print("2. Check 'quickstart.log' for detailed logs")
    print("3. Try modifying topics in this script")
    print("4. Set auto_submit=True to send to backend")
    print("\nSee apps/ai-agents/README.md for more examples.")


if __name__ == "__main__":
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                  Mentat AI Agents Quickstart                ║
    ║                                                              ║
    ║  This demo generates prediction markets using AI agents:    ║
    ║  • Scout Agent - Research data sources                      ║
    ║  • Draft Agent - Generate market questions                  ║
    ║  • Validator Agent - Check quality & safety                 ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

    print("\n⚠️  Note: This requires OPENAI_API_KEY or ANTHROPIC_API_KEY in .env\n")

    try:
        main()
    except KeyboardInterrupt:
        print("\n\nQuickstart interrupted by user.")
    except Exception as e:
        logger.error(f"Quickstart failed: {e}")
        print(f"\n❌ Fatal error: {e}")
        print("\nMake sure you have:")
        print("  1. Set OPENAI_API_KEY in .env")
        print("  2. Installed dependencies: pip install -r requirements.txt")
        sys.exit(1)
