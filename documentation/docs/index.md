# Mentat Protocol

**AI-native prediction markets on Solana, resolved by zkTLS proofs and bootstrapped with curator-verified agent workflows.**

Mentat couples AI-assisted market creation with on-chain settlement so anyone can launch a high-quality prediction market quickly: AI agents draft the question, resolution criteria, and liquidity terms; human curators approve the draft; Solana programs handle trading and settlement; zkTLS proofs bridge real-world data on-chain without trusted arbiters.

## What you can do here

These docs are organized around how you'd actually approach the protocol:

- **[Overview](overview/product-overview.md)** &mdash; the product vision, user segments (creators, curators, traders, proof submitters), the experience pillars, and the original concept brief.
- **[Architecture](architecture/ai-architecture.md)** &mdash; the AI agent pipeline (Scout / Draft / Validator), end-to-end system integration, the Vue 3 front-end structure, and how the monorepo is laid out.
- **[Markets](markets/market-standard.md)** &mdash; the canonical market specification and the Solana account schemas (`MarketFactory`, `MarketAccount`, settlement records) that back it.
- **[Economics](economics/tokenomics.md)** &mdash; default fee splits, creator stakes, proof bounty SLAs, and a financial model that projects treasury revenue under various scenarios.
- **[Implementation](implementation/ai-agents.md)** &mdash; build notes for the AI agents, Creator Studio, Curator Console, Solana programs (market-factory, market-settlement), event indexer, wallet integration, and trading interface.
- **[Guides](guides/integration.md)** &mdash; how the web frontend talks to the backend, how to configure networks (devnet/mainnet), how the Pinia stores are organized, and how authentication flows.
- **[Milestones](milestones/implementation-plan.md)** &mdash; the milestone-by-milestone delivery plan (M1 through M5) and completion summaries for M2 and M3.
- **[Reference](reference/network-indicators.md)** &mdash; status snapshots, TODO tracking, and dead-code-cleanup notes kept for historical traceability.

## At a glance

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, Pinia, TypeScript, Vite |
| Backend | FastAPI, TortoiseORM, PostgreSQL |
| AI agents | DSPy, OpenAI / Anthropic |
| Blockchain | Solana, Anchor |
| Wallets | Phantom, Solflare |
| Auth | JWT (wallet + email/password) |
| Indexer | Node.js / TypeScript, PostgreSQL, WebSocket |
| Verification | zkTLS (planned for M4) |

## Source of truth

The canonical documentation lives in the [`docs/`](https://github.com/cryptuon/mentat/tree/main/docs) directory of the [cryptuon/mentat](https://github.com/cryptuon/mentat) repository. This site is a navigable, restructured view of that content. If you spot drift between a page here and the source code, please open an issue or a PR &mdash; the edit link in the top right of each page points at the file to change.
