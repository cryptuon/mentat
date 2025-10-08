# Mentat Protocol

AI-native prediction markets on Solana, resolved by zkTLS proofs and bootstrapped with curator-verified agent workflows.

## Vision
- **Permissionless creation:** AI assistants draft market questions, resolution criteria, and liquidity terms so anyone can launch high-quality markets with minimal friction.
- **Cryptographic settlement:** zkTLS proofs bridge real-world data into Solana smart contracts, replacing trusted arbiters with verifiable outcomes.
- **Fanatical usability:** A pump.fun-inspired, Arrakis-flavored UX couples rapid deployment with transparent discovery, proof timelines, and curator guardrails.

## Core Product Pillars
- **AI-assisted market studio:** Conversational UI backed by OpenAI/Anthropic models, with human-in-the-loop curation prior to on-chain deployment.
- **zkTLS resolution pipeline:** Off-chain proof generation, optional aggregation, and on-chain verification contracts that finalize markets once proofs land.
- **Discovery & trading hub:** Real-time feed, topic filters, and detail pages highlighting resolution rules, data sources, and proof status.

## Success Signals (v0)
- Time from AI prompt to on-chain market: ≤ 5 minutes.
- Human curator acceptance rate: ≥ 70 %.
- Markets launched per day: dozens without elevated dispute rates.
- Resolution latency after event settles: ≤ 30 minutes from proof submission.

## Phased Roadmap
1. **MVP (Solana-only, human-curated):** Ship creator studio, curator queue, base market program, and proof stub that records hashes.
2. **Scale:** Add multi-source proofs, automated proof ingestion, richer market taxonomy, and ranked discovery.
3. **Full permissionless:** Expand agent autonomy, enable dynamic source discovery, and harden dispute + governance loops.

## Repository Structure
- `docs/product-overview.md` — detailed narrative of the vision, user journeys, and UX priorities.
- `docs/implementation-plan.md` — implementation milestones, strike team ownership, and delivery timeline.
- `docs/tokenomics.md` — protocol fee flows, staking mechanics, and incentive design.
- `docs/market-standard.md` — canonical market data model and lifecycle rules.
- `docs/solana-market-schema.md` — on-chain account definitions aligned with the market standard.
- `docs/fee-model.md` — quantitative model illustrating fee splits and projected revenue.
- `docs/project-structure.md` — proposed repository layout and component responsibilities.
- `docs/web-prototype.md` — guide to the Vue-based UI prototype with mock data.
- `specs.md` — original ideation reference.

## Getting Started
1. Read the product overview for context on the end-to-end flow.
2. Align on implementation milestones and staffing.
3. Begin MVP execution: creator studio, curation, Solana program, and zkTLS proof stub.

---

Questions or clarifications? Open an issue describing the scenario and which pillar is impacted (AI studio, proofing, or discovery).
