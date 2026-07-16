# Mentat Roadmap

> Living document. Milestone scope and dates may shift as the protocol
> hardens. This roadmap describes intent, not a delivery guarantee, and makes
> no claims about financial returns.

## Vision

Mentat is building **AI-native, verifiably-resolved prediction markets on
Solana**. The thesis for 2026: prediction markets are only as trustworthy as
the mechanism that resolves them, and the two forces reshaping crypto this year
— **on-chain, verifiable AI** and **cryptographic attestation of real-world
data** — let us remove the trusted human arbiter from that mechanism entirely.

Three properties define the endpoint:

- **AI-drafted markets.** A Scout → Draft → Validator agent pipeline turns a
  one-line idea into a complete, well-specified market — question, outcomes,
  resolution criteria, and a candidate zkTLS-verifiable data source — in
  seconds, so market creation stops being a specialist skill.
- **Human-curated quality.** Agents draft; curators approve. A bulk-action
  curation console with diff view, version history, and an audit trail keeps a
  human accountable for what goes live, without making humans the bottleneck.
- **zkTLS-resolved settlement, no trusted arbiter.** Outcomes are settled by
  zkTLS proofs that cryptographically attest to what a real-world HTTPS source
  said, verified on-chain by the `market-settlement` program. The resolver is
  math and a public source, not a committee.

## Milestones

### Near term — Verifiable resolution (M4)

- zkTLS prover integration in `apps/proof-service/` (currently a stub): produce
  proofs that attest to the response of a named HTTPS data source.
- Wire the prover to the on-chain `submit_proof` / `verify_proof` /
  `resolve_market` instructions in `market-settlement`.
- Automated settlement path: resolution criteria → source fetch → proof →
  on-chain resolution → `claim_payout`, end to end on devnet.
- Dispute-window hardening around the existing `open_dispute` /
  `resolve_dispute` instructions for the cases a single proof cannot cover.

### Mid term — Depth and coverage

- Expand the Scout agent's catalogue of zkTLS-verifiable sources and
  per-category resolution templates (Politics, Crypto, Sports, Macro).
- Liquidity bootstrapping: LP incentives and market-maker tooling around the
  `market-factory` AMM instructions (`add_liquidity` / `remove_liquidity`).
- Curator reputation and staking so curation scales past a trusted core set.
- Observability: indexer-backed dashboards for market health, proof latency,
  and resolution outcomes.

### Long term — Production protocol

- Security audit of both Anchor programs and the settlement/proof path.
- Solana mainnet-beta launch with a conservative, curated market catalogue.
- Permissionless market creation with agent + curator guardrails.
- Mobile client, deeper discovery, and growth work.

## Cheapest path to production

The goal is a **live, credibly-resolved market catalogue on Solana
mainnet-beta** for the least capital and engineering risk — not a feature-
complete exchange. The scaffolding that already exists (agent pipeline,
FastAPI backend, both Anchor programs, indexer, wallet integration) means the
remaining spend is concentrated in a handful of production-viability risks:

1. **zkTLS prover reliability & coverage.** `apps/proof-service/` is the
   critical path. Ship a prover that reliably attests to a *small, curated set*
   of high-quality HTTPS sources (e.g. major exchanges, official results pages)
   before chasing breadth. Coverage of the long tail is where cost explodes —
   defer it. Measure proof success rate and latency per source and only
   promote sources that clear a reliability bar.
2. **Market-curation workflow.** The curator console exists; production needs
   throughput and accountability. Start with a **small trusted curator set** and
   a hard rule that nothing resolves on a source the Scout agent hasn't marked
   zkTLS-verifiable. Reputation/staking is a mid-term optimisation, not a
   launch blocker.
3. **Settlement + liquidity bootstrapping.** Prove the full
   draft → curate → trade → proof → resolve → payout loop on devnet, then launch
   mainnet-beta with **shallow, incentivised liquidity on a few flagship
   markets** rather than broad, thin coverage. Concentrated liquidity is
   cheaper to seed and gives cleaner prices.
4. **Oracle edge-case handling.** Budget explicitly for the cases where a
   single proof is insufficient — source outages, ambiguous outcomes, revised
   data, timezone/rounding disputes. The `open_dispute` / `resolve_dispute`
   path plus a bounded dispute window is the cheapest safety net; the fallback
   logic the Draft agent already emits per market is the first line.
5. **Monitoring.** Reuse the existing TypeScript indexer + WebSocket feed to
   watch proof submission, verification latency, resolution outcomes, and
   liquidity depth. Alerting on stuck resolutions and failed proofs is what
   makes a thin launch operable by a small team.

**Recommendation:** land M4 on **devnet** first — a reliable prover over a
handful of curated sources plus the automated settlement loop — then launch on
**mainnet-beta** with a curated catalogue and concentrated liquidity. Breadth
of sources and permissionless creation come after the core resolution loop is
provably trustworthy. This front-loads the one thing that is genuinely novel
and hard (verifiable resolution) and defers everything that merely scales.

---

See [`README.md`](./README.md) for architecture and setup, and
[`PROJECT-STATUS.md`](./PROJECT-STATUS.md) for current milestone detail.
