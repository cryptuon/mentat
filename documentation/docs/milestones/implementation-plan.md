# Implementation Plan & Milestones

## Workstreams
- **WS1 — Front-end Experience:** Creator studio, curator console, discovery hub, market detail, proof submission UI.
- **WS2 — Agent & Curation Backend:** Prompt orchestration, draft storage, curator workflow APIs, analytics.
- **WS3 — Solana Programs:** Market factory, market state accounts, settlement logic, proof ingestion.
- **WS4 — zkTLS Proof Service:** Integration with TLSNotary/zkTLS provider, proof lifecycle management, submission tooling.
- **WS5 — Observability & Ops:** Logging, metrics, alerting, and incident response for AI/curation/proof pipelines.

## Milestone Timeline (Indicative)
| Milestone | Target | Key Deliverables |
|-----------|--------|------------------|
| **M1 — Foundation** | Week 0-3 | Architecture docs finalized, contract schema draft, proof provider selected, scaffolding for front-end and backend repos. |
| **M2 — Creator MVP** | Week 4-7 | AI-assisted studio with template enforcement, curator queue with approval flow, mocked Solana deployment (record metadata off-chain). |
| **M3 — On-Chain Launch** | Week 8-11 | MarketFactory program deployed, basic market cards on-chain, discovery feed powered by indexer, manual proof hash submission. |
| **M4 — Proof Integration** | Week 12-15 | zkTLS proof generation pipeline live, settlement program verifies hashes or proofs, UI shows proof timeline/status, first end-to-end resolution. |
| **M5 — Quality & Scale** | Week 16-20 | Multi-source proofs support, automated dispute alerts, ranking algorithms for discovery, post-launch instrumentation. |

## Detailed Tasks
-### WS1 — Front-end Experience
- Set up Vue 3 + Vite project, shared UI kit, and Solana wallet integration.
- Build **Creator Studio**: chat-like prompt panel, structured preview, validation errors.
- Build **Curator Console**: queue list, diff view, approve/request changes/reject actions.
- Build **Discovery Hub**: leaderboard, filters, search, market cards with proof status badges.
- Build **Market Detail**: resolution criteria, AI rationale, liquidity, timeline, subscribe notifications.
- Build **Proof Submission Panel**: upload/enter proof details, validation feedback, submission history.

-### WS2 — Agent & Curation Backend
- Stand up Postgres (market drafts, curation trail) and Redis (session state, rate limits).
- Implement DSPy-based agent orchestrator: prompt templates, response parsing, safety checks, retry logic.
- Build FastAPI service exposing REST endpoints for drafts, curator actions, and market deployment triggers.
- Integrate human feedback loop: capture curator edits to refine DSPy prompt heuristics.
- Implement analytics dashboards for acceptance rate, turnaround time, dispute frequency.

### WS3 — Solana Programs
- Define account structures for markets (metadata, liquidity pools, resolution config).
- Implement `MarketFactory`: create markets, enforce staking, emit events for indexer.
- Implement `MarketSettlement`: accept proof submissions, verify or store references, execute payout distribution.
- Provide client SDK for front-end/back-end interactions (anchor or custom).

### WS4 — zkTLS Proof Service
- Choose initial provider stack (e.g., TLSNotary) and confirm proof format compatibility with Solana verifier.
- Implement proof generation pipeline triggered by resolution window events.
- Build submission tool/CLI that posts proof hash + metadata to Solana program.
- Plan fallback path (manual verification or INVALID resolution) if proof fails.
- Roadmap multi-source aggregation and dispute handling for later phases.

### WS5 — Observability & Ops
- Centralized logging (e.g., ELK/ClickHouse) with structured logs from agents, backend, and proof service.
- Metrics and alerts (Prometheus/Grafana) for key KPIs: market creation latency, curator throughput, proof latency.
- Incident playbooks for AI failures, proof errors, and contract anomalies.
- Security review: secret management for OpenAI/Anthropic keys, signer key custody for Solana.

## Cross-Cutting Concerns
- **Security:** Penetration test contracts before M3; implement role-based access for curator tools; monitor AI prompt injection.
- **Documentation:** Update README, API docs, and runbooks per milestone.
- **Testing:** Unit + integration tests for agent prompts, contract simulations, proof verification; nightly end-to-end run.
- **Feedback Loops:** Weekly curator retro to adjust guardrails; trader surveys post-launch.

## Risks & Mitigations
- **Proof verification complexity:** Start with hash recording (M3) before full on-chain verification (M4); engage zkTLS experts early.
- **AI quality drift:** Deploy evaluation suite and threshold alerts for acceptance rate; maintain versioned prompts.
- **Solana congestion:** Implement retry/backoff and monitor compute budget usage; consider priority fees for proof submissions.
