# Mentat Protocol

**[🌐 Site](https://mentat.cryptuon.com/) · [📚 Docs](https://docs.cryptuon.com/mentat/) · [🔬 Cryptuon Research](https://github.com/cryptuon)**

> **Active development.** Mentat is under active development. APIs,
> schemas, and on-chain layouts may change between releases.
> Production use at your own risk. Issues and PRs welcome.

**AI-native prediction markets on Solana.** Markets are *drafted by AI agents*,
*curated by humans*, and *resolved by zkTLS proofs* that cryptographically
attest to real-world data — so outcomes settle against a verifiable source
instead of a trusted arbiter.

- Website: [https://mentat.cryptuon.com/](https://mentat.cryptuon.com/)
- Documentation: [https://docs.cryptuon.com/mentat/](https://docs.cryptuon.com/mentat/)
- Source: [https://github.com/cryptuon/mentat](https://github.com/cryptuon/mentat)
- Roadmap: [`ROADMAP.md`](./ROADMAP.md) — including the cheapest path to production

## Why this matters in 2026

Two of the year's defining crypto narratives — **on-chain, verifiable AI** and
**cryptographic attestation of real-world data** — meet directly in the design
of a prediction market. A market is only as trustworthy as the mechanism that
resolves it, and today that mechanism is almost always a trusted oracle or a
human committee. Mentat removes both:

- **Agent-drafted markets.** A Scout → Draft → Validator agent pipeline turns a
  one-line idea into a fully specified market — question, outcomes, resolution
  criteria, and a candidate verifiable data source — in roughly 15 seconds.
  Verifiable AI here isn't a slogan: every draft is quality-, safety-, and
  clarity-scored, and a human curator approves it before it goes live.
- **zkTLS resolution, no trusted arbiter.** Outcomes are settled by zkTLS proofs
  that attest to what a real-world HTTPS source actually returned, verified
  on-chain by the `market-settlement` program. The resolver is math plus a
  public source — not a company, a multisig, or a vote.

## Vision
- **Permissionless creation:** AI agents draft market questions, resolution criteria, and liquidity terms so anyone can launch high-quality markets with minimal friction — and a human curator stays accountable for what ships.
- **Cryptographic settlement:** zkTLS proofs bridge real-world data into Solana smart contracts, replacing trusted arbiters with verifiable outcomes anyone can check.
- **Fanatical usability:** A Polymarket-inspired UX couples rapid deployment with transparent discovery, proof timelines, and curator guardrails.

## How Mentat compares

Honest positioning against the incumbents. Mentat's resolution and drafting
model is the differentiator; the incumbents are more mature and more liquid
today.

| Dimension | Mentat | Polymarket | Kalshi | Trusted-oracle markets |
|-----------|--------|-----------|--------|------------------------|
| **Market creation** | AI-drafted, human-curated | Team / community proposed | Exchange-listed only | Manual |
| **Resolution** | zkTLS proof of an HTTPS source, verified on-chain | UMA optimistic oracle (token-holder vote) | Regulated exchange (CFTC) | Oracle operator / committee |
| **Trusted arbiter?** | No — math + public source | Yes — dispute resolution by voters | Yes — the exchange | Yes — the oracle |
| **Chain** | Solana | Polygon | Off-chain / regulated | Various |
| **Liquidity & maturity** | Early, pre-production | Deep, live | Deep, regulated | Varies |
| **Verifiability** | Anyone can re-check the proof | Depends on the dispute vote | Trust the exchange | Trust the operator |

Tradeoffs to be clear about: zkTLS resolution only works when a market's
outcome is attestable from a real-world HTTPS source, and Mentat is early —
liquidity, source coverage, and audits are still ahead of us (see
[`ROADMAP.md`](./ROADMAP.md)).

## Current Status

Mentat is past its Creator MVP (M2) and on-chain launch (M3) milestones. The
codebase contains:

- **AI-Powered Market Creation** &mdash; generate markets from ideas in
  approximately 15 seconds via the Scout / Draft / Validator agent pipeline
- **Human Curation Workflow** &mdash; bulk actions, diff view, version history
- **Full-Stack Implementation** &mdash; Vue 3 frontend, FastAPI backend,
  PostgreSQL
- **Authentication** &mdash; JWT with wallet and email/password support
- **Solana Programs** &mdash; `market-factory` and `market-settlement` Anchor
  programs with generated IDLs
- **Event Indexer** &mdash; TypeScript indexer with PostgreSQL storage and a
  WebSocket feed
- **Wallet Integration** &mdash; Phantom and Solflare support, transaction
  signing, balance queries
- **Trading Interface** &mdash; trading panel, position cards, and trade
  confirmation modals wired to the on-chain programs

Up next: zkTLS oracle integration, automated settlement, and a hardening pass
ahead of a production launch.

See [`docs/M2-COMPLETION-SUMMARY.md`](./docs/M2-COMPLETION-SUMMARY.md) and
[`PROJECT-STATUS.md`](./PROJECT-STATUS.md) for milestone detail.

## Quick Start

### Backend Setup
```bash
cd apps/backend
uv sync
make upgrade       # apply database migrations
make dev           # runs on http://localhost:8000
```

### Frontend Setup
```bash
cd apps/web
npm install
npm run dev        # runs on http://localhost:5173
```

### AI Agents Setup
```bash
cd apps/ai-agents
uv sync
export OPENAI_API_KEY="your-key"   # or ANTHROPIC_API_KEY
uv run python examples/quickstart.py
```

For more detail, see [`QUICK-START.md`](./QUICK-START.md) and the per-app
READMEs under [`apps/`](./apps/).

## Architecture

```
┌─────────────┐
│ Web Frontend│  Vue 3 + Pinia + TypeScript
│             │  - Creator Studio (AI-powered)
│             │  - Curator Console (bulk operations)
│             │  - Discovery Hub
└──────┬──────┘
       │ HTTP (JWT)
┌──────▼──────┐
│ Backend API │  FastAPI + TortoiseORM + PostgreSQL
│             │  - Authentication (wallet/email)
│             │  - Market CRUD
│             │  - Curation workflow
│             │  - AI generation endpoints
└──────┬──────┘
       │ Python
┌──────▼──────┐
│  AI Agents  │  DSPy + OpenAI/Anthropic
│             │  - Scout Agent (source research)
│             │  - Draft Agent (market generation)
│             │  - Validator Agent (quality checks)
└─────────────┘
```

## Key Features

### For Creators
- **AI-Assisted Creation**: Describe your market idea, AI generates the full specification
- **Real-Time Progress**: Watch Scout, Draft, and Validator agents work
- **Validation Scores**: See quality, safety, and clarity scores before submission
- **Iterative Refinement**: Request AI improvements based on curator feedback

### For Curators
- **Bulk Operations**: Claim, approve, or reject multiple drafts at once
- **Diff View**: Side-by-side comparison of draft versions
- **Version History**: Track complete revision history
- **Validation Dashboard**: Quality scores and issues at a glance
- **Audit Trail**: Complete history of all curation actions

## Documentation

The published documentation site is at
[**docs.cryptuon.com/mentat**](https://docs.cryptuon.com/mentat/). The raw
source for that site lives in [`documentation/`](./documentation/); a
larger archive of design notes and milestone reports lives in
[`docs/`](./docs/README.md).

### Implementation Guides
- [M2 Completion Summary](./docs/M2-COMPLETION-SUMMARY.md) - Complete milestone overview
- [Creator Studio Enhancement](./docs/CREATOR-STUDIO-ENHANCEMENT.md) - AI-powered market creation
- [Curator Console Enhancement](./docs/CURATOR-CONSOLE-ENHANCEMENT.md) - Bulk actions and diff view
- [AI Agents Summary](./docs/AI-AGENTS-SUMMARY.md) - Scout, Draft, Validator agents
- [Integration Guide](./docs/INTEGRATION.md) - Web-backend integration

### Architecture & Design
- [Product Overview](./docs/product-overview.md) - Vision and user journeys
- [AI Architecture](./docs/ai-architecture.md) - AI agent design
- [System Integration](./docs/system-integration.md) - Component integration
- [Market Standard](./docs/market-standard.md) - Market specification format

### Blockchain & Economics
- [Solana Market Schema](./docs/solana-market-schema.md) - On-chain program design
- [Fee Model](./docs/fee-model.md) - Platform economics
- [Tokenomics](./docs/tokenomics.md) - Token design

## Roadmap

See [`ROADMAP.md`](./ROADMAP.md) for the full vision, near/mid/long-term
milestones, and the **cheapest path to production**. Milestone summary:

- ✅ **M1 - Research & Design** (Complete)
  - Market standard definition
  - AI architecture design
  - System integration plan

- ✅ **M2 - Creator MVP** (Complete)
  - Backend API with authentication
  - AI agents (Scout, Draft, Validator)
  - Creator Studio with AI generation
  - Curator Console with bulk operations
  - Web-backend integration

- ✅ **M3 - On-Chain Launch** (Complete)
  - Solana programs (`market-factory`, `market-settlement`)
  - Event indexer with WebSocket feed
  - Wallet integration (Phantom, Solflare)
  - Trading interface

- 🚧 **M4 - zkTLS Integration** (In Progress)
  - zkTLS oracle implementation
  - Automated settlement
  - Resolution verification

- 📋 **M5 - Production Launch** (Planned)
  - Security audit
  - Performance optimization
  - Mobile app
  - Onboarding and growth

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vue 3, Pinia, TypeScript, Vite |
| **Backend** | FastAPI, TortoiseORM, PostgreSQL, Aerich |
| **AI** | DSPy, OpenAI GPT-4, Anthropic Claude |
| **Blockchain** | Solana, Anchor |
| **Indexer** | Node.js, TypeScript, PostgreSQL, WebSocket |
| **Wallets** | Phantom, Solflare |
| **Auth** | JWT, bcrypt |
| **Verification** | zkTLS (planned, M4) |

## Repository Structure

```
mentat/
├── apps/
│   ├── backend/          # FastAPI backend + Aerich migrations
│   ├── web/              # Vue 3 frontend
│   ├── ai-agents/        # DSPy AI agents (Scout, Draft, Validator)
│   ├── indexer/          # Node.js/TypeScript Solana event indexer
│   ├── proof-service/    # zkTLS proof submission service
│   └── solana-programs/  # Anchor programs (market-factory, market-settlement)
├── documentation/        # MkDocs source for docs.cryptuon.com/mentat
├── docs/                 # Design notes, milestone reports, deep-dives
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes and test
4. Commit with clear messages (`git commit -m 'Add feature'`)
5. Push to your branch (`git push origin feature/your-feature`)
6. Open a Pull Request

See component READMEs for specific development guidelines:
- [Backend README](./apps/backend/README.md)
- [AI Agents README](./apps/ai-agents/README.md)

## Support

- **Documentation**: [docs.cryptuon.com/mentat](https://docs.cryptuon.com/mentat/)
- **Website**: [mentat.cryptuon.com](https://mentat.cryptuon.com/)
- **Issues**: [GitHub Issues](https://github.com/cryptuon/mentat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cryptuon/mentat/discussions)

## License

Mentat is released under the MIT license. See [`LICENSE`](./LICENSE) if
present in the repository.

---

**Current Milestone**: M3 - On-Chain Launch (complete)
**Next Milestone**: M4 - zkTLS Integration

---

## Part of Cryptuon Research

`mentat` is one of [20 open-source blockchain-infrastructure projects](https://www.cryptuon.com/projects) from **[Cryptuon Research](https://www.cryptuon.com)** — blockchain theory, shipped as protocols.

**Related projects:** [Moby Market](https://mobymarket.cryptuon.com/) · [PolyBot](https://polybot.cryptuon.com/) · [Sarpoy](https://sarpoy.cryptuon.com/)

Docs: [docs.cryptuon.com/mentat](https://docs.cryptuon.com/mentat/) · Contact: [contact@cryptuon.com](mailto:contact@cryptuon.com)
