# Mentat Protocol

AI-native prediction markets on Solana, resolved by zkTLS proofs and bootstrapped with curator-verified agent workflows.

## Vision
- **Permissionless creation:** AI assistants draft market questions, resolution criteria, and liquidity terms so anyone can launch high-quality markets with minimal friction.
- **Cryptographic settlement:** zkTLS proofs bridge real-world data into Solana smart contracts, replacing trusted arbiters with verifiable outcomes.
- **Fanatical usability:** A Polymarket-inspired UX couples rapid deployment with transparent discovery, proof timelines, and curator guardrails.

## Current Status: M2 - Creator MVP ✅ COMPLETE

The platform now features:
- ✅ **AI-Powered Market Creation** - Generate markets from ideas in ~15 seconds
- ✅ **Human Curation Workflow** - Bulk actions, diff view, version history
- ✅ **Full-Stack Implementation** - Vue 3 frontend + FastAPI backend + PostgreSQL
- ✅ **AI Agent Pipeline** - Scout → Draft → Validator with DSPy
- ✅ **Authentication** - JWT with wallet + email/password support
- ✅ **Mobile-Ready API** - RESTful JSON endpoints

See [M2 Completion Summary](./docs/M2-COMPLETION-SUMMARY.md) for full details.

## Quick Start

### Backend Setup
```bash
cd apps/backend
uv sync
make migrate
make run  # Runs on http://localhost:8000
```

### Frontend Setup
```bash
cd apps/web
npm install
npm run dev  # Runs on http://localhost:5173
```

### AI Agents Setup
```bash
cd apps/ai-agents
uv sync
export OPENAI_API_KEY="your-key"  # or ANTHROPIC_API_KEY
uv run python examples/quickstart.py
```

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

See [`docs/README.md`](./docs/README.md) for complete documentation index.

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

- 🚧 **M3 - On-Chain Launch** (Next)
  - Solana programs (market-factory, settlement)
  - Event indexer
  - Wallet integration (Phantom, Solflare)
  - Trading interface
  - WebSocket real-time updates

- 📋 **M4 - zkTLS Integration** (Future)
  - zkTLS oracle implementation
  - Automated settlement
  - Resolution verification

- 📋 **M5 - Production Launch** (Future)
  - Security audit
  - Performance optimization
  - Mobile app
  - Marketing and onboarding

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vue 3, Pinia, TypeScript, Vite |
| **Backend** | FastAPI, TortoiseORM, PostgreSQL, Aerich |
| **AI** | DSPy, OpenAI GPT-4, Anthropic Claude |
| **Blockchain** | Solana, Anchor (M3) |
| **Auth** | JWT, bcrypt |
| **Verification** | zkTLS (M4) |

## Repository Structure

```
mentat-protocol/
├── apps/
│   ├── backend/          # FastAPI backend
│   ├── web/              # Vue 3 frontend
│   └── ai-agents/        # DSPy AI agents
├── docs/                 # Complete documentation
│   ├── README.md         # Documentation index
│   ├── M2-COMPLETION-SUMMARY.md
│   ├── CREATOR-STUDIO-ENHANCEMENT.md
│   ├── CURATOR-CONSOLE-ENHANCEMENT.md
│   ├── AI-AGENTS-SUMMARY.md
│   └── INTEGRATION.md
└── README.md            # This file
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

- **Documentation**: [`docs/`](./docs/)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Current Version**: M2 Complete
**Next Milestone**: M3 - On-Chain Launch
**Last Updated**: October 2025
