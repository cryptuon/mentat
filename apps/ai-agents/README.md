# Mentat Protocol - AI Agents

AI-powered agent system for automated prediction market creation using DSPy and large language models.

## Overview

The AI agents service orchestrates intelligent market creation through a multi-agent pipeline:

1. **Scout Agent** - Researches zkTLS-verifiable data sources
2. **Draft Agent** - Generates market questions and resolution criteria
3. **Validator Agent** - Validates quality, safety, and compliance

## Architecture

```
User Input (Topic)
    ↓
Scout Agent → Data Sources
    ↓
Draft Agent → Market Specification
    ↓
Validator Agent → Quality Check
    ↓
Backend API → Database
```

### Agent Details

#### Scout Agent
- **Purpose**: Research reliable, zkTLS-verifiable data sources
- **Inputs**: Market topic, category, keywords
- **Outputs**: List of recommended sources with reliability scores
- **Tech**: DSPy ChainOfThought with source verification logic

#### Draft Agent
- **Purpose**: Generate complete market specifications
- **Inputs**: Topic, data sources, deadline
- **Outputs**: Question, outcomes, resolution criteria, rationale
- **Tech**: Multi-step DSPy pipeline with structured output

#### Validator Agent
- **Purpose**: Quality, safety, and compliance checking
- **Inputs**: Market draft
- **Outputs**: Validation scores, errors, warnings, suggestions
- **Tech**: Three separate DSPy modules for different check types

## Installation

### Prerequisites

- Python 3.11+
- OpenAI or Anthropic API key
- Redis (optional, for job queue)

### Setup

```bash
cd apps/ai-agents

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### Configuration

Key environment variables in `.env`:

```bash
# Required
OPENAI_API_KEY=sk-...              # Or ANTHROPIC_API_KEY
DEFAULT_MODEL=gpt-4-turbo-preview
DEFAULT_PROVIDER=openai            # or anthropic

# Optional
TEMPERATURE=0.7
MAX_TOKENS=2000
VALIDATOR_MIN_QUALITY_SCORE=0.7
BACKEND_API_URL=http://localhost:8000
```

## Usage

### Quick Start

```python
from src.orchestrator import SyncOrchestrator
from src.types import MarketTopic

# Initialize orchestrator
orchestrator = SyncOrchestrator()

# Define topic
topic = MarketTopic(
    category="Crypto",
    keywords=["Bitcoin", "price", "$100,000"],
    context="Will Bitcoin reach $100,000 by end of 2025?"
)

# Create market draft
result = orchestrator.create_market_draft(
    topic=topic,
    user_id="user-123",
    deadline_days=60,
    auto_submit=False
)

# Check results
if result["success"]:
    print(f"Question: {result['draft']['question_text']}")
    print(f"Valid: {result['validation']['is_valid']}")
```

### Individual Agents

```python
from src.agents import ScoutAgent, DraftAgent, ValidatorAgent
from src.types import MarketTopic

# Scout for data sources
scout = ScoutAgent()
topic = MarketTopic(category="Crypto", keywords=["Bitcoin"])
sources = scout.run(topic)

# Generate draft
draft_agent = DraftAgent()
draft = draft_agent.run(topic, sources=sources)

# Validate draft
validator = ValidatorAgent()
validation = validator.run(draft)

print(f"Quality Score: {validation.quality_score}")
print(f"Errors: {validation.errors}")
```

### Async Orchestrator

```python
import asyncio
from src.orchestrator import MarketCreationOrchestrator

async def create_market():
    orchestrator = MarketCreationOrchestrator()

    result = await orchestrator.create_market_draft(
        topic=topic,
        user_id="user-123",
        auto_submit=True  # Submit to backend if valid
    )

    await orchestrator.close()
    return result

result = asyncio.run(create_market())
```

## Testing

### Test Individual Agents

Each agent module includes a `__main__` block for testing:

```bash
# Test Scout Agent
python -m src.agents.scout

# Test Draft Agent
python -m src.agents.draft

# Test Validator Agent
python -m src.agents.validator

# Test Orchestrator
python -m src.orchestrator
```

### Run Tests

```bash
pytest tests/ -v
```

## Agent Prompts

### Scout Agent Prompts

The Scout agent uses this signature:

```python
class SourceResearchSignature(dspy.Signature):
    topic = dspy.InputField(desc="Market topic and context")
    category = dspy.InputField(desc="Market category")
    requirements = dspy.InputField(desc="Data source requirements")

    reasoning = dspy.OutputField(desc="Reasoning about sources")
    sources = dspy.OutputField(desc="List of sources as JSON")
    recommended_primary = dspy.OutputField(desc="Primary source URL")
```

### Draft Agent Prompts

Three-stage generation:

1. **Question Generation**
```python
question = dspy.InputField(desc="Market question starting with 'Will' or 'Did'")
summary = dspy.OutputField(desc="1-2 sentence summary")
outcomes = dspy.OutputField(desc="Outcomes as JSON array")
```

2. **Resolution Criteria**
```python
trigger_condition = dspy.OutputField(desc="Exact verifiable condition")
fallback_logic = dspy.OutputField(desc="Fallback if primary unavailable")
invalidation_clause = dspy.OutputField(desc="Conditions for INVALID")
```

3. **Rationale Generation**
```python
rationale = dspy.OutputField(desc="Explanation of market design")
```

### Validator Agent Prompts

Three separate checks:

1. **Quality Check**
   - Assesses clarity and ambiguity
   - Scores question and criteria quality
   - Identifies improvement areas

2. **Safety Check**
   - Content moderation
   - Ethical concerns
   - Appropriateness assessment

3. **Compliance Check**
   - Market standard adherence
   - Resolution criteria completeness
   - Source verification requirements

## Integration with Backend

The orchestrator automatically integrates with the backend API:

```python
# Auto-submit creates draft in backend database
result = await orchestrator.create_market_draft(
    topic=topic,
    user_id="user-123",
    auto_submit=True  # Submits if validation passes
)

# Returns draft_id from backend
draft_id = result["draft_id"]
```

Backend submission requires:
- `BACKEND_API_URL` configured
- Optional `BACKEND_API_KEY` for service auth
- User authentication token

## Output Format

### Orchestrator Result

```python
{
    "job_id": "uuid",
    "success": True,
    "draft": {
        "question_text": "Will Bitcoin reach $100,000 by...",
        "summary": "Binary market on Bitcoin price milestone",
        "outcomes": [...],
        "trigger_condition": "CoinGecko API shows BTC >= $100k",
        "primary_sources": ["https://api.coingecko.com/..."],
        ...
    },
    "validation": {
        "is_valid": True,
        "quality_score": 0.85,
        "safety_score": 0.95,
        "clarity_score": 0.90,
        "errors": [],
        "warnings": ["Consider adding fallback source"],
        "suggestions": [...]
    },
    "submitted": True,
    "draft_id": "uuid-from-backend",
    "errors": []
}
```

## Performance & Costs

### Token Usage

Typical market creation:
- Scout: ~500-1000 tokens
- Draft: ~1500-2500 tokens
- Validator: ~1000-1500 tokens
- **Total**: ~3000-5000 tokens per market

### API Costs (GPT-4)

- Input: $10/1M tokens
- Output: $30/1M tokens
- **Average cost per market**: $0.10-$0.20

### Latency

- Scout: 2-5 seconds
- Draft: 5-10 seconds
- Validator: 3-7 seconds
- **Total pipeline**: 10-22 seconds

## Error Handling

Agents handle errors gracefully:

```python
try:
    result = orchestrator.create_market_draft(topic, user_id)
    if not result["success"]:
        print(f"Errors: {result['errors']}")
except Exception as e:
    logger.error(f"Fatal error: {e}")
```

Common error types:
- **No sources found**: Scout couldn't find verifiable sources
- **Validation failed**: Draft doesn't meet quality thresholds
- **API errors**: LLM provider issues
- **Backend errors**: Submission failures

## Logging

Structured logging with loguru:

```python
from loguru import logger

# Configure logging
logger.add(
    "agents.log",
    rotation="10 MB",
    retention="7 days",
    level="INFO"
)
```

Log format includes:
- Timestamp
- Log level
- Agent name
- Function name
- Message with context

## Advanced Configuration

### Custom Models

```python
# Use different models for different agents
scout = ScoutAgent()  # Uses default
draft = DraftAgent()  # Custom model
draft.model = "gpt-4o"
draft._setup_lm()
```

### Temperature Tuning

```python
# Lower temperature for more deterministic output
validator = ValidatorAgent()
validator.temperature = 0.3
validator._setup_lm()
```

### Quality Thresholds

Adjust in `.env`:
```bash
VALIDATOR_MIN_QUALITY_SCORE=0.8  # Stricter (default 0.7)
VALIDATOR_MIN_SAFETY_SCORE=0.9   # Stricter (default 0.8)
```

## Development

### Project Structure

```
apps/ai-agents/
├── src/
│   ├── agents/
│   │   ├── base.py           # Base agent class
│   │   ├── scout.py          # Scout agent
│   │   ├── draft.py          # Draft agent
│   │   └── validator.py      # Validator agent
│   ├── orchestrator.py       # Workflow orchestration
│   ├── types.py              # Type definitions
│   └── config.py             # Configuration
├── tests/
│   └── test_agents.py
├── pyproject.toml            # Dependencies & project config
├── .env.example
└── README.md
```

### Adding New Agents

1. Create new agent class inheriting `BaseAgent`
2. Define DSPy signature
3. Implement `run()` method
4. Add to orchestrator pipeline

Example:
```python
from src.agents.base import BaseAgent
import dspy

class CustomSignature(dspy.Signature):
    input_field = dspy.InputField(desc="...")
    output_field = dspy.OutputField(desc="...")

class CustomAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self.processor = dspy.ChainOfThought(CustomSignature)

    def run(self, input_data):
        result = self.processor(input_field=input_data)
        return result.output_field
```

## Roadmap

- [ ] Feedback loop from curator edits
- [ ] Multi-outcome market support
- [ ] Conditional market logic
- [ ] Historical dispute analysis
- [ ] Automated source testing
- [ ] Cost optimization strategies

## Support

For issues or questions:
- Check logs in `agents.log`
- Review DSPy documentation
- See main repo README

## License

See repository root for license information.
