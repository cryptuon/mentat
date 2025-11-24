# Mentat Protocol Documentation

## Project Overview

Mentat is a prediction market platform built on Solana with AI-powered market creation and zkTLS-verified resolution.

## Documentation Index

### Current Milestone: M2 - Creator MVP ✅

**Completion Summary**
- [M2 Completion Summary](./M2-COMPLETION-SUMMARY.md) - Complete overview of M2 achievements, tech stack, and architecture

### Implementation Guides

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

- [Implementation Plan](./implementation-plan.md) - Milestone breakdown and timeline
- [Project Structure](./project-structure.md) - Codebase organization
- [Initial Brainstorm](./initial.md) - Original project concept

### Prototypes

- [Web Prototype](./web-prototype.md) - Initial web app prototype notes

## Quick Start Guides

### For Developers

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
npm install
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

### For Users

**Creating Markets**
1. Navigate to Creator Studio (`/create`)
2. Fill in topic form (category, keywords, context)
3. Click "Generate market with AI"
4. Review validation scores and draft
5. Submit for curator review

See [Creator Studio Enhancement](./CREATOR-STUDIO-ENHANCEMENT.md) for details.

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
| **Blockchain** | Solana (Anchor framework) |
| **Auth** | JWT with wallet + email/password |
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

- 🚧 **M3 - On-Chain Launch** (Next)
  - Solana programs (market-factory, settlement)
  - Event indexer
  - Wallet integration
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

### System Overview
```
┌─────────────┐
│ Web Frontend│  Vue 3 + Pinia
│             │  - Creator Studio
│             │  - Curator Console
│             │  - Discovery Hub
└──────┬──────┘
       │ HTTP (JWT)
       │
┌──────▼──────┐
│ Backend API │  FastAPI + TortoiseORM
│             │  - Auth endpoints
│             │  - Market CRUD
│             │  - Curator workflow
│             │  - AI generation
└──────┬──────┘
       │ Python
       │
┌──────▼──────┐
│  AI Agents  │  DSPy + OpenAI/Anthropic
│             │  - Scout (research)
│             │  - Draft (generate)
│             │  - Validator (check)
└─────────────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │  Database
└─────────────┘
```

### AI Agent Pipeline
```
Topic Input
    ↓
Scout Agent
    ↓ (sources)
Draft Agent
    ↓ (draft)
Validator Agent
    ↓ (validation)
Validated Draft
```

### Curation Workflow
```
Creator submits draft (v1)
    ↓
Curator reviews → Requests changes
    ↓
Creator revises (v2)
    ↓
Curator views diff → Approves
    ↓
Market created → Deployed to blockchain
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
   cd apps/backend
   pytest

   # Frontend tests
   cd apps/web
   npm run test
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

**Last Updated**: October 2025
**Current Version**: M2 Complete
**Next Milestone**: M3 - On-Chain Launch
