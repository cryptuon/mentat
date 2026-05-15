# Project Structure Proposal

Mentat is best managed as a mono-repo with language-specific subprojects grouped by responsibility. The layout below balances clear ownership, shared tooling, and future scalability.

```
mentat-protocol/
├── apps/
│   ├── web/                # Vue 3 (Vite) front-end
│   ├── backend/            # FastAPI core service (REST + WebSocket)
│   ├── ai-agents/          # DSPy pipelines orchestrating market drafts
│   ├── proof-service/      # zkTLS integration + on-chain submission jobs
│   └── indexer/            # Event indexer + analytics API
├── programs/
│   ├── market-factory/     # Solana Anchor program for market instantiation
│   ├── market-settlement/  # Solana Anchor program handling proofs/payouts
│   └── shared/             # Common Rust crates (errors, utils, IDL generation)
├── packages/
│   ├── ts-sdk/             # TypeScript client (used by web + external integrators)
│   └── py-sdk/             # Python client for FastAPI/AI services
├── infra/
│   ├── terraform/          # Cloud infrastructure definitions
│   ├── k8s/                # Kubernetes manifests / Helm charts
│   └── ci/                 # CI/CD pipelines, GitHub Actions workflows
├── scripts/                # One-off automation (seeding, migrations, linting)
├── docs/                   # Documentation (product, architecture, specs, runbooks)
├── config/                 # Shared configuration (lint rules, Prettier, Ruff, etc.)
├── tests/                  # Cross-service end-to-end tests
└── specs.md                # Ideation reference (legacy)
```

## Component Responsibilities

### `apps/web`
- Vue SPA with Tailwind, Pinia, Vue Query.
- Routes for Creator Studio, Curator Console, Discovery Hub, Market Detail, Proof Submission, Account Dashboard.
- Communicates with `apps/backend` REST/WebSocket APIs and `packages/ts-sdk` for Solana interactions.

### `apps/backend`
- FastAPI service exposing draft, curation, and market orchestration endpoints.
- Integrates with Postgres, Redis, and Solana client.
- Hosts curator workflow logic and authentication.

### `apps/ai-agents`
- Python DSPy programs for Scout, Draft, Validator, Summarizer agents.
- Uses message queues (e.g., Redis, RabbitMQ) to process jobs triggered by backend.
- Stores outputs/feedback in shared Postgres schemas.

### `apps/proof-service`
- zkTLS proof generation workers, proof artifact storage, and Solana transaction submission.
- SLA tracking and bounty allocation calculations.

### `apps/indexer`
- Rust service that listens to Solana events, serializes data via `rkyv`, and persists to `sled`.
- Exposes lightweight query endpoints (gRPC/REST) for UI discovery and analytics dashboards.

### `programs/*`
- Anchor-based programs compiled to deploy on Solana.
- `shared/` crate exports common structs, error codes, and IDLs used by both programs and `packages/ts-sdk`.

### `packages/ts-sdk`
- Typed client wrappers for interacting with Solana programs and backend endpoints.
- Reused by web app and potential external partners.

### `packages/py-sdk`
- Convenience library for Python services (backend, AI, proof) encapsulating Solana + REST calls and shared models.

### `infra/`
- Infrastructure-as-code, deployment manifests, and CI pipelines to ensure consistent environments across services.

### `scripts/`
- Task runner entrypoints (e.g., `seed_markets.py`, `run_local_validator.sh`).

### `tests/`
- System-level integration tests orchestrating multi-service e2e flows.
- Could leverage pytest/pytest-asyncio or Playwright + localnet harness.

## Development Workflow
- Language-specific tooling stays local to each subproject (e.g., `apps/web/package.json`, `apps/backend/pyproject.toml`).
- Shared conventions (lint, formatting) reside in `config/`.
- Root `Makefile` or `justfile` provides common tasks (`make dev`, `make test`, `make lint`).
- Local environment script launches Solana test validator, FastAPI, AI agents, indexer, and Vue dev server using Docker Compose.

## Future Extensions
- Add `apps/governance/` for DAO tools when protocol decentralizes.
- Add `packages/ui-kit/` if front-end components need to be shared with external widgets.
- Introduce `docs/runbooks/` for operational procedures per service.
