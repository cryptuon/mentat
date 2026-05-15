# System Integration Blueprint

This document connects Mentat’s subsystems—AI agents, backend services, Solana programs, and UI—highlighting interfaces, data contracts, and event flows.

## High-Level Topology

```
External Signals ─┐
User Prompts ─────┼→ AI Orchestrator → Draft Store (Postgres)
Historical Market ┘                 ↘ Validator Reports

Creator UI ↔ Backend API ↔ Curator Workflow Service ↔ AI Orchestrator

Discovery UI ↔ Rust Indexer (rkyv + sled) ↔ Solana RPC

Proof Service ↔ zkTLS Provider ↔ Solana Settlement Program
```

## Services & Responsibilities
- **AI Orchestrator (Python + DSPy):** Executes agent pipelines using DSPy programs, stores drafts, handles retries, updates prompt configs.
- **Backend API (FastAPI):** Handles auth, CRUD for drafts, curator actions, interfaces with Solana client for market deployment.
- **Curator Workflow Service:** Specialized module (could live within FastAPI project) managing queues, notifications, and audit logs.
- **Solana Programs:** `MarketFactory`, `MarketSettlement`, liquidity/trading modules (e.g., orderbook or AMM).
- **Indexer:** Rust service consuming Solana events, persisting snapshots with `rkyv` + `sled`, and serving discovery analytics.
- **Proof Service:** Monitors resolution windows, generates zkTLS proofs, submits transactions to `MarketSettlement`.
- **Notifications Service:** Sends emails/push/Discord alerts based on events (optional MVP).

## Key Interfaces

### 1. AI Orchestrator ↔ Backend
- **Draft Submission:** `POST /v1/drafts` exposed by FastAPI with payload
```json
{
  "market_id": null,
  "schema_version": "1.0",
  "question_text": "...",
  "ai_rationale_uri": "ar://...",
  "outcomes": [...],
  "resolution": {...},
  "economics": {...},
  "timestamps": {...},
  "discovery_summary": "...",
  "validator_report": {...}
}
```
- **Feedback Loop:** `PATCH /v1/drafts/{draftId}/feedback` with curator edits (feeds back into DSPy training examples).
- **Status Updates:** Webhook or queue message from FastAPI when curator accepts/rejects; orchestrator records outcome.

### 2. Backend ↔ Solana Programs
- Uses Anchor client or custom SDK.
- **Launch Market Flow:**
  1. Curator approves draft.
  2. Backend constructs transaction: `initialize_market` + `deposit_creator_stake`.
  3. Signs with creator wallet (via front-end) and protocol authority (if required).
  4. On success, records `market_pubkey` and updates draft state.
- **Trading & Liquidity:** Front-end interacts directly with Solana programs via wallet; backend only used for analytics.
- **Settlement:** Proof service calls `submit_proof` → `settle_market`.

-### 3. Backend ↔ UI
- **REST endpoints served by FastAPI (optionally GraphQL via Strawberry/FastAPI integration):**
  - `GET /markets` (filter, pagination).
  - `GET /markets/{id}` (detailed view).
  - `POST /drafts` (creator UI).
  - `GET /curation/queue` (authenticated curators).
  - `POST /curation/{draftId}/decision`.
- Real-time updates via WebSocket channel (FastAPI WebSocket endpoints) broadcasting events:
  - `market_created`, `market_resolved`, `proof_submitted`, `dispute_opened`.

### 4. Indexer ↔ Solana RPC
- Rust service listens to program logs/events using `getProgramAccounts` + `onLogs`.
- Persists compact, zero-copy snapshots serialized with `rkyv` into `sled` key-value store.
- Maintains materialized views for:
  - Market metadata (IDs, state, timestamps).
  - Trade events (volume, price).
  - Proof submissions and outcomes.
- Exposes read APIs (REST/gRPC) that hydrate responses from `rkyv` archives without full deserialization when possible.

### 5. Proof Service ↔ zkTLS Provider
- Configured jobs monitor markets approaching resolution.
- Steps:
  1. Fetch source data (HTTP GET) at event timestamp.
  2. Generate zkTLS proof (TLSNotary/zkPass).
  3. Store proof artifact in IPFS/Arweave; compute hash.
  4. Call blockchain instruction with proof hash + metadata.
  5. Listen for transaction confirmation, update backend via webhook.
- Maintain ledger of proof SLA compliance for incentive payout calculations.

## Data Synchronization
- **Source of Truth:** Solana accounts for live markets, resolution state, fees. Postgres for drafts/curation history; indexer for derived analytics.
- **Consistency Strategy:** Backend listens to Solana events to reconcile state (e.g., after market launches). Draft IDs link to `market_pubkey`.
- **Failure Handling:**
  - If market launch transaction fails, backend marks draft as “needs retry”.
  - Proof submission failure triggers alert to proof ops team; market remains active until resolved.
  - Dispute outcomes propagate via events; backend updates stakeholder notifications.

## Security & Access Control
- **Auth:** JWT/session tokens for curator/admin routes; wallet signature challenge for creator actions.
- **Roles:** Creator, Curator, Proof Operator, Admin.
- **Secret Management:** AI keys and proof provider credentials stored in Vault/Parameter Store; rotated regularly.
- **Rate Limiting:** API gateway (e.g., Cloudflare, Nginx) enforces per-IP/per-account limits.

## Observability
- **Tracing:** Use OpenTelemetry across AI orchestrator, backend, and proof service to trace market lifecycle.
- **Metrics:** Publish Prometheus metrics (draft success rate, API latency, proof SLA).
- **Logging:** Structured JSON logs with correlation IDs (`market_id`, `draft_id`).
- **Alerts:** PagerDuty/Slack alerts for critical events (proof backlog, high dispute rate, RPC failures).

## Deployment Pipeline
- **AI Orchestrator:** Containerized (Docker), deployed via Kubernetes or serverless (e.g., AWS Fargate).
- **Backend & Curator Service:** FastAPI app deployed via Kubernetes with blue/green or rolling updates.
- **Indexer:** Stateful Rust service; manage sled backup/compaction routines and run redundant replicas for resiliency.
- **Front-end:** Vue 3 SPA built with Vite; deployed behind CDN (Cloudflare Pages, Netlify, or custom).
- **Proof Service:** Managed as separate deployment with access to secure enclaves (if required by zkTLS provider).

## Integration Testing
- Local environment with Solana test validator, mock zkTLS service, seeded AI responses.
- End-to-end test script: simulate draft → curator approval → market launch → trades → proof submission → settlement.
- Contract tests for API endpoints ensuring JSON schema compatibility with UI.

## Future Enhancements
- Event-driven architecture with Kafka/Redis Streams for decoupled processing.
- Data warehouse integration (BigQuery/Snowflake) for analytics.
- Auto-curation pipeline that bypasses human step for low-risk markets, triggered via confident validator scores.
- Graph-based market relationships for smarter discovery recommendations.
