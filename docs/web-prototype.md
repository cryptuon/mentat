# Web Prototype Guide

The Vue 3 playground under `apps/web` demonstrates the Mentat UI flows with mock data and abstractions aligned to the product spec. Use it to validate messaging, layout, and navigation before wiring real APIs.

## Features
- **Arrakeen Feed:** Featured carousel, trending grid, and KPI cards with spice-seasoned copy.
- **Mentat Forge:** Conversational draft interface with structured preview tied to the market schema.
- **Sardaukar Gate:** Review queue with status indicators, validation findings, and approval actions.
- **Market Detail:** Comprehensive breakdown of odds, liquidity, resolution criteria, fee economics, truth-trance proof timeline, live charts, and social signals.
- **Truth Trance:** Active job table and submission form illustrating zkTLS workflow messaging.
- **Ledger of Arrakis:** Creator metrics, stakes overview, and alert examples.
- **Help overlay:** Global quick tips (Dune-flavored) for creators, curators, traders, and proof ops.

All data is sourced from `src/services/mockApi.ts`, which exports promise-returning functions mimicking real backend calls.

## Project Layout
```
apps/web/
├── src/
│   ├── components/        # Shared UI primitives (navigation, cards, badges)
│   ├── router/            # Route definitions
│   ├── services/          # Mock API layer
│   ├── styles/            # Global styling tokens
│   ├── types/             # Shared TypeScript interfaces
│   └── views/             # Page-level views for each user flow
├── package.json           # Scripts and dependencies (Vue, Pinia, Vue Query)
├── vite.config.ts         # Vite aliases and dev server config
└── index.html             # Entry point referencing global styles
```

## Running Locally
1. Install dependencies (requires Node 18+):
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```
2. Open `http://localhost:5173` to explore the prototype.

No backend required—the mock API functions resolve immediately with deterministic data sets.

## Next Steps
- Swap `mockApi.ts` calls with real FastAPI endpoints when ready.
- Layer in responsive charts (e.g., TradingView) and wallet interactions.
- Connect Vue Query mutations to real actions (create draft, approve, submit proof).
- Iterate on copy and empty states based on stakeholder feedback.
