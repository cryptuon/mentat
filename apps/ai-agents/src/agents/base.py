"""Base agent class for DSPy-based agents."""
import dspy
from loguru import logger

from src.config import get_settings

settings = get_settings()


class BaseAgent:
    """Base class for all Mentat AI agents."""

    def __init__(self, model: str | None = None, temperature: float | None = None):
        """Initialize agent with language model."""
        self.model = model or settings.default_model
        self.temperature = temperature or settings.temperature

        # Initialize DSPy language model
        self._setup_lm()

        logger.info(f"Initialized {self.__class__.__name__} with model {self.model}")

    def _setup_lm(self):
        """Set up the language model based on provider."""
        if settings.default_provider == "openai":
            lm = dspy.OpenAI(
                model=self.model,
                api_key=settings.openai_api_key,
                temperature=self.temperature,
                max_tokens=settings.max_tokens,
            )
        elif settings.default_provider == "anthropic":
            lm = dspy.Claude(
                model=self.model,
                api_key=settings.anthropic_api_key,
                temperature=self.temperature,
                max_tokens=settings.max_tokens,
            )
        else:
            raise ValueError(f"Unsupported provider: {settings.default_provider}")

        dspy.settings.configure(lm=lm)

    def run(self, *args, **kwargs):
        """Run the agent. Override in subclasses."""
        raise NotImplementedError("Subclasses must implement run()")


class ChainOfThought(dspy.Signature):
    """Generic chain of thought signature."""

    context = dspy.InputField(desc="Context and background information")
    question = dspy.InputField(desc="Question or task to complete")
    reasoning = dspy.OutputField(desc="Step-by-step reasoning")
    answer = dspy.OutputField(desc="Final answer or result")
