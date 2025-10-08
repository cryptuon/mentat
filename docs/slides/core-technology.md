---
marp: true
theme: default
paginate: true
class: lead
---

# Mentat Protocol  
### Core Tech Blueprint

---

## Architecture Snapshot

```
AI Orchestrator (DSPy) ─┐
                        ├─ FastAPI control plane ──► Solana Programs
Curator Console ────────┘                               │
                                                       ▼
Proof Service (zkTLS) ────────► Market Settlement ◄── Truth Timeline
Rust Indexer (rkyv + sled) ───► Vue Sietch UI & SDKs
```

---

## Solana Programs

- **MarketFactory**
  - PDA-based market IDs, creator stake vaults  
  - Configures fee splits, proof SLA, resolution schema
- **MarketSettlement**
  - Accepts proof hashes & metadata  
  - Verifies/records zkTLS outputs (optimistic, upgradeable)  
  - Triggers payouts, fee routing, slash logic
- Shared crate exports structs, enums, IDL for TypeScript/Python SDKs

---

## Market Account Schema

- Identity: `market_id`, creator, curator, version  
- Economics: trading fee bps, splits, bounty, dispute bond  
- Resolution: source hash, trigger logic hash, fallback, invalid clause  
- Lifecycle: timestamps, state machine (`Draft → Active → Resolved/Invalid`)  
- Proof slot: status, hash, verifier result, SLA  
- Social hooks: watchers, boosts, threads (off-chain but hashed)

---

## AI Mentat Stack

- **DSPy Programs**
  - Scout, Draft, Validator, Summarizer pipelines  
  - Prompt templates enforce schema & allowed sources  
  - Validator critiques for ambiguity / policy violations
- **Feedback loop**
  - Curator edits stored in Postgres, fed back as few-shot exemplars  
  - Metrics: acceptance %, retries, cost per draft, safety flags

---

## FastAPI Control Plane

- Auth (wallet + session) and role enforcement (creator, curator, proof ops)  
- REST/WebSocket endpoints:
  - `/drafts`, `/curation/queue`, `/markets`, `/proofs`  
  - Event streams: market_created, proof_submitted, dispute_opened
- Integrations:
  - Solana via Anchor client  
  - Postgres (drafts), Redis (queues, rate limits)

---

## Proof Ops Pipeline

1. Monitor markets via SLA schedule  
2. Capture HTTPS payload (e.g., Reuters API)  
3. Generate zkTLS proof (TLSNotary / zkPass)  
4. Persist artifact (IPFS/Arweave) + hash  
5. Submit `submit_proof` instruction  
6. Settlement program verifies or flags for dispute  
7. Bounty distributed per SLA tier

---

## Rust Indexer

- Written in async Rust  
- Parses Solana logs + account changes  
- Serializes snapshots with `rkyv` → persisted in `sled`  
- Exposes gRPC/REST for Vue front-end (Arrakeen feed, charts, social counters)  
- Supports rehydration, compaction, and replica nodes

---

## Front-End (Vue/Vite)

- **Arrakeen Feed**: live markets, filters, spice metrics  
- **Mentat Forge**: chat UI, structured preview, JSON export  
- **Sardaukar Gate**: queue, diffing, approval actions  
- **Truth Trance**: job table, proof submission forms  
- **Ledger**: earnings, stakes, alerts  
- Responsive design + share/boost interactions + sparkline charts

---

## Data & Telemetry

- Structured logs everywhere with correlation IDs (`market_id`, `draft_id`)  
- Prometheus metrics: creation latency, curator throughput, proof SLA performance  
- OpenTelemetry traces from DSPy → FastAPI → Solana RPC → Indexer  
- Alerting: proof backlog, dispute spikes, AI failure rate

---

## Security & Hardening

- Secrets via Vault/Parameter Store, rotating AI/zkTLS keys  
- Role-based access on curator/ops routes  
- Creator stake slashing for invalid markets  
- Continuous fuzzing of prompt templates + adversarial red teaming  
- Solana program audits, unit tests, simulated dispute flows

---

## Extensibility

- Pluggable proof systems (zkTLS today, oracle committees tomorrow)  
- Modular agent skills (news, DeFi, social, AI-simulated outcomes)  
- Governance-ready (treasury, parameter tweaks, sietch councils)  
- Cross-chain: mirror settlements or relays to other L2s  
- SDKs for partners to embed “spice” markets in their apps

---

# Mentat Core  
Arrakis-ready, cryptography-backed, AI-powered.  
`tech@mentat.markets`

