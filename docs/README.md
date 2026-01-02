# Mentat Protocol Documentation

## Project Overview

Mentat is a prediction market platform built on Solana with AI-powered market creation and zkTLS-verified resolution.

## Documentation Index

### Current Milestone: M3 - On-Chain Launch ✅

**M3 Completion Summary**
- [M3 Progress Summary](./M3-PROGRESS-SUMMARY.md) - Complete overview of M3 achievements (100% complete)
- [Phase 4 Trading Interface](./PHASE-4-TRADING-INTERFACE-COMPLETE.md) - Trading components implementation

**Previous Milestones**
- [M2 Completion Summary](./M2-COMPLETION-SUMMARY.md) - Creator MVP achievements

### M3 Implementation Guides

**Solana Programs**
- [Market Factory Implementation](./MARKET-FACTORY-IMPLEMENTATION.md) - Trading and liquidity program
- [Market Settlement Implementation](./MARKET-SETTLEMENT-IMPLEMENTATION.md) - Resolution and payout program

**Infrastructure**
- [Event Indexer Implementation](./EVENT-INDEXER-IMPLEMENTATION.md) - On-chain event indexer service
- [Wallet Integration Implementation](./WALLET-INTEGRATION-IMPLEMENTATION.md) - Multi-wallet support

**Trading Interface**
- [Phase 4 Trading Interface Plan](./PHASE-4-TRADING-INTERFACE-PLAN.md) - Original implementation plan
- [Phase 4 Complete](./PHASE-4-TRADING-INTERFACE-COMPLETE.md) - Final implementation details

**Configuration**
- [Network Configuration](./NETWORK-CONFIGURATION.md) - Devnet/Mainnet setup
- [Stores Usage Guide](./STORES-USAGE-GUIDE.md) - Pinia store patterns

### M2 Implementation Guides

**Backend & AI**
- [Integration Guide](./INTEGRATION.md) - Web-backend integration with API client, auth, and type adapters
- [AI Agents Summary](./AI-AGENTS-SUMMARY.md) - Scout, Draft, and Validator agents with DSPy

**Frontend Enhancements**
- [Creator Studio Enhancement](./CREATOR-STUDIO-ENHANCEMENT.md) - AI-powered market creation interface
- [Curator Console Enhancement](./CURATOR-CONSOLE-ENHANCEMENT.md) - Bulk actions, diff view, and version history

### Architecture & Design

**System Design**
- [AI Architecture](./ai-architecture.md) - AI agent design and workflow
- [System Integration](./system-integration.md) - Component integration overview
- [UI Architecture](./ui-architecture.md) - Frontend structure and components

**Blockchain & Smart Contracts**
- [Solana Market Schema](./solana-market-schema.md) - On-chain program design
- [Fee Model](./fee-model.md) - Platform economics and fee distribution

**Product & Business**
- [Product Overview](./product-overview.md) - Platform features and value proposition
- [Tokenomics](./tokenomics.md) - Token design and distribution
- [Market Standard](./market-standard.md) - Market specification format

### Project Management

- [Implementation Plan](./implementation-plan.md) - Milestone breakdown
- [Project Structure](./project-structure.md) - Codebase organization
- [Initial Brainstorm](./initial.md) - Original project concept

## Quick Start Guides

### For Developers

**Solana Programs**
```bash
cd apps/solana-programs
anchor build
# Programs built to target/deploy/
# IDLs generated to target/idl/

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

**Backend Setup**
```bash
cd apps/backend
uv sync
make migrate
make run
```
See `apps/backend/README.md` for details.

**Frontend Setup**
```bash
cd apps/web
npm install --legacy-peer-deps
npm run dev
```

**AI Agents Setup**
```bash
cd apps/ai-agents
uv sync
export OPENAI_API_KEY="your-key"  # or ANTHROPIC_API_KEY
uv run python examples/quickstart.py
```
See `apps/ai-agents/README.md` for details.

**Event Indexer Setup**
```bash
cd apps/indexer
npm install
npm run build
npm start
```
See `apps/indexer/README.md` for details.

### For Users

**Creating Markets**
1. Navigate to Creator Studio (`/create`)
2. Fill in topic form (category, keywords, context)
3. Click "Generate market with AI"
4. Review validation scores and draft
5. Submit for curator review

See [Creator Studio Enhancement](./CREATOR-STUDIO-ENHANCEMENT.md) for details.

**Trading on Markets**
1. Connect your Solana wallet (Phantom/Solflare)
2. Navigate to a market
3. Select outcome (YES/NO)
4. Enter amount in USDC
5. Review trade estimate (shares, fees, slippage)
6. Click Buy/Sell and confirm in wallet
7. View your positions

See [Phase 4 Complete](./PHASE-4-TRADING-INTERFACE-COMPLETE.md) for details.

**Curating Markets**
1. Navigate to Curator Console (`/curate`)
2. View queue of pending drafts
3. Select drafts to review (single or bulk)
4. Claim, approve, reject, or request changes
5. Use diff view to compare versions

See [Curator Console Enhancement](./CURATOR-CONSOLE-ENHANCEMENT.md) for details.

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Vue 3, Pinia, TypeScript, Vite |
| **Backend** | FastAPI, TortoiseORM, PostgreSQL |
| **AI Agents** | DSPy, OpenAI/Anthropic |
| **Blockchain** | Solana (Anchor 0.32.1) |
| **Wallets** | Phantom, Solflare adapters |
| **Auth** | JWT with wallet + email/password |
| **Indexer** | Node.js, PostgreSQL, WebSocket |
| **Verification** | zkTLS (future) |

## Milestones

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

- ✅ **M3 - On-Chain Launch** (Complete - January 2, 2026)
  - Solana programs (market-factory, settlement)
  - Event indexer service
  - Wallet integration (Phantom, Solflare)
  - Trading interface (TradingPanel, PositionCard, TradeConfirmModal)
  - Solana program service with IDL integration

- 📋 **M4 - zkTLS Integration** (Next)
  - zkTLS oracle implementation
  - Automated settlement
  - Resolution verification

- 📋 **M5 - Production Launch** (Future)
  - Security audit
  - Performance optimization
  - Mobile app
  - Marketing and onboarding

## API Documentation

### Base URL
- Development: `http://localhost:8000`
- Production: TBD

### Authentication
All protected endpoints require JWT token in `Authorization: Bearer <token>` header.

### Key Endpoints

**Authentication**
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login and get JWT
- `GET /api/v1/auth/me` - Get current user

**AI Generation**
- `POST /api/v1/ai/generate-draft` - Generate market draft with AI

**Curation**
- `GET /api/v1/curator/queue` - Get curator queue
- `POST /api/v1/curator/bulk/approve` - Bulk approve drafts
- `GET /api/v1/curator/{id}/diff` - Get version diff
- `GET /api/v1/curator/{id}/history` - Get version history

See [Integration Guide](./INTEGRATION.md) for complete API documentation.

## Architecture Diagrams

### System Overview (M3)
```
┌─────────────────────────────────────────────────────────────┐
│                      Web Frontend                           │
│  Vue 3 + Pinia + TypeScript                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │Creator      │  │Curator      │  │Trading Interface    │ │
│  │Studio       │  │Console      │  │- TradingPanel       │ │
│  │             │  │             │  │- PositionCard       │ │
│  └─────────────┘  └─────────────┘  │- TradeConfirmModal  │ │
│                                     └─────────────────────┘ │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
      ┌───────────┐   ┌─────────────┐   ┌───────────┐
      │Backend API│   │Wallet Store │   │Solana     │
      │FastAPI    │   │+ Adapters   │   │Program    │
      └─────┬─────┘   └──────┬──────┘   │Service    │
            │                │          └─────┬─────┘
            ▼                │                │
      ┌───────────┐          │                │
      │AI Agents  │          │                │
      │DSPy       │          │                │
      └───────────┘          │                │
            │                │                │
            ▼                ▼                ▼
      ┌───────────┐   ┌─────────────────────────────┐
      │PostgreSQL │   │      Solana Blockchain      │
      │           │   │  ┌─────────┐  ┌──────────┐  │
      └───────────┘   │  │Market   │  │Market    │  │
                      │  │Factory  │  │Settlement│  │
                      │  └─────────┘  └──────────┘  │
                      └─────────────────────────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │Event Indexer  │
                            │TypeScript     │
                            └───────┬───────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │PostgreSQL     │
                            │(Events DB)    │
                            └───────────────┘
```

### Trading Flow
```
User connects wallet
        │
        ▼
Selects market outcome (YES/NO)
        │
        ▼
Enters trade amount
        │
        ▼
Reviews estimate (shares, fees, slippage)
        │
        ▼
Clicks Buy/Sell
        │
        ▼
Confirms in wallet extension
        │
        ▼
Transaction submitted to Solana
        │
        ▼
Position updated in UI
```

### AI Agent Pipeline
```
Topic Input
    ↓
Scout Agent (3s)
    ↓ (sources)
Draft Agent (8s)
    ↓ (draft)
Validator Agent (4s)
    ↓ (validation)
Validated Draft (~15s total)
```

## File Structure

```
mentat-protocol/
├── apps/
│   ├── backend/              # FastAPI REST API
│   │   ├── src/
│   │   │   ├── api/v1/       # Route handlers
│   │   │   ├── models/       # Database models
│   │   │   └── schemas/      # Pydantic schemas
│   │   └── README.md
│   │
│   ├── web/                  # Vue 3 Frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── trading/  # Trading components ✅ NEW
│   │   │   │   └── wallet/   # Wallet components
│   │   │   ├── services/     # API & Solana services
│   │   │   ├── stores/       # Pinia stores
│   │   │   ├── idl/          # Program IDLs ✅ NEW
│   │   │   └── types/        # TypeScript types
│   │   └── package.json
│   │
│   ├── ai-agents/            # DSPy AI Agents
│   │   ├── src/agents/       # Scout, Draft, Validator
│   │   └── README.md
│   │
│   ├── indexer/              # Event Indexer Service
│   │   ├── src/              # TypeScript indexer
│   │   └── README.md
│   │
│   └── solana-programs/      # Solana Programs
│       ├── programs/
│       │   ├── market-factory/
│       │   └── market-settlement/
│       ├── target/
│       │   ├── idl/          # Generated IDLs
│       │   └── deploy/       # Compiled programs
│       └── Anchor.toml
│
├── docs/                     # Documentation
│   ├── README.md             # This file
│   ├── M3-PROGRESS-SUMMARY.md
│   ├── PHASE-4-TRADING-INTERFACE-COMPLETE.md
│   └── ...
│
└── README.md                 # Project root README
```

## Contributing

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**
   ```bash
   # Backend tests
   cd apps/backend && pytest

   # Frontend build
   cd apps/web && npm run build

   # Solana build
   cd apps/solana-programs && anchor build
   ```

3. **Commit and push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

4. **Create pull request**

### Code Style

- **Frontend**: ESLint + Prettier (configured in `apps/web`)
- **Backend**: Black + isort (run `make format`)
- **Solana**: Rust fmt
- **TypeScript**: Strict mode enabled
- **Python**: Type hints required

## Support & Resources

- **Repository**: [github.com/mentat-protocol](https://github.com/mentat-protocol)
- **Documentation**: This directory
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## License

TBD

---

**Last Updated**: January 2, 2026
**Current Version**: M3 Complete
**Next Milestone**: M4 - zkTLS Integration
