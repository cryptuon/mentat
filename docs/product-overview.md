# Product Overview

## Mission
Deliver a prediction-market experience on Solana where AI agents propose markets, human curators ensure quality, and zkTLS proofs resolve outcomes without trusted third parties.

## User Segments
- **Creators:** Individuals or communities who want to spin up markets quickly using the AI-assisted studio.
- **Curators:** Human reviewers who validate AI proposals before they become immutable on-chain markets.
- **Traders & Liquidity Providers:** Participants who browse, evaluate, and trade based on transparent resolution criteria.
- **Proof Submitters:** Operators (initially core team) who generate zkTLS attestations and finalize markets.

## Experience Pillars
### AI-Assisted Market Studio
- Conversational flow powered by OpenAI/Anthropic models for drafting question, resolution criteria, timelines, and initial liquidity configuration.
- Guardrails surfaced to creators (template hints, required proof source selection, disallowed categories).
- Output: structured market spec ready for curator review, including proof expectations and discovery metadata.

### Human Curation
- Queue view showing pending AI proposals with diff view between AI suggestion and last human edit.
- Accept/Request changes/Reject actions; accepted markets trigger contract deployment.
- Feedback loop into the AI agent to improve future drafts (prompt tuning, heuristics).

### Market Discovery Hub
- Pump.fun inspired landing page with live leaderboard (volume, open interest, time since creation) dressed in Arrakis lore.
- Filters for topic tags, confidence rating, resolution window, and source category (API, news, social).
- Market detail card: question statement, resolution criteria, Mentat rationale, proof status, key timestamps, and liquidity snapshot.

### zkTLS Resolution Lifecycle
1. **Expectation:** Market spec records target sources and acceptable timestamp windows.
2. **Proof preparation:** Off-chain service generates zkTLS proof(s) once the outcome data is published.
3. **Submission:** Proof hash and metadata stored on-chain; complete proof either verified on-chain or referenced for later verification.
4. **Settlement:** Smart contract executes payout logic; disputes route through separate governance if implemented later.

## High-Level System Components
- **Front-end Web App (Vue 3 + Vite):** Creator studio, curator console, discovery feed, market detail pages, proof submission panel.
- **Agent Orchestrator (Python + DSPy):** Manages OpenAI/Anthropic interactions, enforces templates, and stores drafts in Postgres/Redis.
- **Curator API (FastAPI):** Persists human edits, logs decision trail, and triggers Solana contract calls after approval.
- **Solana Programs:**
  - `MarketFactory` for instantiating markets with metadata, staking, and proof configuration.
  - `MarketSettlement` for accepting proof artifacts, verifying them (or storing references), and distributing payouts.
- **Proof Service:** Integrates with zkTLS stack (e.g., TLSNotary), publishes proof artifacts, and submits results to Solana.
- **Data Indexer:** Rust service using `rkyv` + `sled` to index market events for discovery UI, analytics, and notifications.

## Key Flows
1. **Creation:** Creator opens studio → AI drafts market → creator tweaks → curator approves → market deployed on Solana.
2. **Discovery & Trading:** Traders browse feed → inspect market detail → enter positions → track proof timeline.
3. **Resolution:** Outcome occurs → proof service generates zkTLS proof → submission triggers on-chain verification → market settles → discovery feed updates status.

## Open Questions
- Level of on-chain vs. off-chain zkTLS verification in MVP.
- Incentive design for proof submitters and curators.
- Scalability limits of AI prompting versus cached templates.
- Future path to reduce human curation without losing quality.
