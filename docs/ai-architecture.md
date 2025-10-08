# AI Agent Architecture

This document outlines the design for Mentat’s AI-assisted market creation pipeline, covering agent roles, prompts, guardrails, and integration with human curation. Implementation leverages the DSPy framework running atop FastAPI services.

## Goals
- Automate drafting of market questions, resolution criteria, liquidity suggestions, and discovery metadata.
- Enforce standardized templates that match the market schema.
- Provide actionable outputs for curators while capturing feedback to improve subsequent drafts.
- Operate safely against prompt injection, hallucinations, and policy-sensitive categories.

## Agent Roles
1. **Scout Agent** — surfacing candidate topics/events worth a market.
2. **Draft Agent** — generating the detailed market specification.
3. **Validator Agent** — checking draft completeness, ambiguity, and compliance (self-critique).
4. **Summarizer Agent** — crafting concise copy for discovery surfaces (market cards, notifications).
5. **Reviewer Agent (optional)** — adversarial test that tries to identify exploitation vectors before human curation.

Each role can be orchestrated as separate DSPy programs composed of modules (retrievers, prompt templates, critics) executed sequentially via OpenAI/Anthropic APIs. For MVP, Scout + Draft + Validator may be sufficient; expand as volume increases.

## Workflow Overview
1. **Topic Intake**
   - Inputs: trending signals (news feeds, social APIs), manual creator prompt, or community request.
   - Scout Agent generates 3–5 candidate market concepts with metadata (topic tags, confidence score).
2. **Draft Generation**
   - Draft Agent receives selected concept, template definitions, and historical dispute dataset.
   - Output: structured JSON with fields: question_text, resolution_criteria, sources, timestamps, fee defaults, AI rationale, suggested liquidity terms.
3. **Validation Pass**
   - Validator Agent evaluates draft against rubric (clarity, verifiability, no policy violations).
   - Returns pass/fail plus commentary and required fixes (enforced via JSON schema).
   - If fail, iteratively refine draft (max 2 retries before escalating to human).
4. **Human Curation Interface**
   - Draft stored in Postgres; UI presents AI output + validator notes.
   - Curator can edit, accept, or request re-run with updated instructions.
5. **Feedback Loop**
   - Capture curator edits to update prompt heuristics (few-shot examples).
   - Log validator fail reasons to tune detection thresholds.

## Prompt Templates
Prompts split into system, instructions, and examples sections. Key considerations:
- Include the full market schema with explanations.
- Demand structured JSON; enforce with `response_format` (for models that support it).
- Remind agents to cite provable sources with accessible URLs/APIs.
- Require explicit timeframe phrasing and fallback logic.

Example (Draft Agent instruction snippet):
```
You are the Mentat Market Draft Agent. Produce a market spec in JSON.
Constraints:
- Question must reference a specific timeframe in UTC.
- For each source, provide domain, endpoint type, and why it is zkTLS-verifiable.
- Include `fallback_logic` even if it's explicitly "none".
Return fields: question_text, ai_rationale, outcomes, resolution_criteria, economics, timestamps, discovery_summary.
```

## Safety & Guardrails
- **Category Filters:** Block markets involving self-harm, explicit violence, hate speech, or illegal activities according to policy. Implement pre- and post-generation checks.
- **Prompt Injection Protection:** Sanitize user inputs (strip instructions that try to alter behavior), use context partitioning so model cannot read raw instructions beyond allowed scope.
- **Source Validation:** Restrict allowable domains to an allowlist; require Validator Agent to confirm presence of canonical sources.
- **Ambiguity Checks:** Validator ensures question contains explicit resolution deadline, measurable condition, and non-overlapping outcomes.
- **Rate Limits:** Per-user and global; throttle retries to prevent misuse.
- **Audit Logging:** Store prompts and outputs (with PII redaction) for incident analysis.

## Data Stores
- **Postgres:** Market drafts, curator edits, validator reports, agent run metadata.
- **Redis:** Short-lived cache for agent intermediate results, deduplication keys, rate limit counters.
- **Object Storage (S3/Arweave):** AI rationale documents and extended metadata accessible to UI and indexers.

## Evaluation Framework
- Maintain dataset of past disputes, successful markets, and curator feedback to fine-tune prompts.
- Implement automatic metrics:
  - Draft acceptance rate (% of AI drafts approved without major edits).
  - Average validator iterations per draft.
  - Time to generate final draft.
  - Safety violation rate (should be near zero).
- Weekly human audit of random samples to recalibrate rubric.

## Deployment & Ops
- Run orchestrator service as Python worker cluster (Celery/RedisQ) invoking DSPy pipelines; expose control plane via FastAPI.
- Environment variables (secrets manager) store model credentials; rotate regularly.
- Continuous integration tests for DSPy programs using recorded traces (via pytest harness).
- Monitor usage: track tokens consumed, cost per draft, and system latency.

## Roadmap Enhancements
- Introduce multi-agent debate (draft vs. critic) for higher-quality markets.
- Integrate retrieval augmented generation (RAG) pulling from knowledge base of past markets & legal guidelines.
- Add self-serve knobs for experienced creators (e.g., customizing fee splits) with AI guardrails.
- Eventually replace human curation for low-risk categories once acceptance metrics surpass threshold.
- Deploy DSPy’s `Compiler` tooling to optimize prompts based on curator feedback and dispute data.
