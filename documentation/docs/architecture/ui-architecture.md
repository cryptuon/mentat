# UI Architecture & Flows

This document defines Mentat’s front-end structure, key screens, and data flow to support AI-assisted market creation, curation, and discovery.

-## Technology Stack
- **Framework:** Vue 3 with Vite build pipeline and TypeScript support.
- **State Management:** Pinia for global store; Vue Query (TanStack Query) for server state caching.
- **Styling:** Tailwind CSS + Headless UI for accessible primitives.
- **Wallet Integration:** Solana wallet adapter (Phantom, Backpack, etc.).
- **Charting:** Recharts or TradingView widgets for price history.
- **Real-time Updates:** WebSockets or Supabase Realtime for market events; fallback to polling.

## Module Overview
1. **Creator Studio** — AI-assisted market authoring experience.
2. **Curator Console** — Review queue and decision interface.
3. **Discovery Hub** — Public landing page for browsing markets.
4. **Market Detail** — Deep-dive view with trading, proof status, and timeline.
5. **Proof Submission Panel** — Guided flow for proof providers.
6. **Account Dashboard** — Creator/LP analytics, rewards, and governance actions.

Shared components: navigation shell, notifications system, wallet panel, analytics widgets (KPIs, status badges), layout primitives implemented as Vue composables and single-file components (SFCs).

## Navigation & Routing
- Global navigation bar: `Discover`, `Create`, `Curate`, `My Markets`, `Submit Proof`.
- Auth: wallet connection or email-based session for curators (paired with wallet binding).
- Notification center (toast + inbox) for market approvals, proofs, disputes.

## Screen Specs

### 1. Creator Studio
- **Layout:** Two-column view (left: conversational prompt log; right: structured preview) built with responsive CSS grid.
- **Flow:**
  1. User selects topic (from Scout agent suggestions) or enters custom idea.
  2. AI chat returns proposed market; preview displays question, timeline, sources, fee summary.
  3. User can tweak parameters (sliders/forms) with AI re-drafting as needed.
  4. “Submit for Curation” packages JSON draft to backend.
- **Key Components:** Chat composer, prompt history, validation checklist (timestamp, source, ambiguity checks), fee summary widget.

### 2. Curator Console
- **Layout:** Queue table + detail panel.
- **Features:**
  - Filters by topic, risk category, AI score.
  - Diff view highlighting changes between AI draft and curator edits.
  - Actions: Approve (sign off), Request Changes (comment), Reject.
  - Metrics sidebar (acceptance rate, turnaround time).
  - Quick links to resolution sources for manual spot-check.

### 3. Discovery Hub
- **Layout:** Grid/Feed with hero section for featured markets.
- **Features:**
  - Sorting: Trending, New, Resolving Soon, Recently Settled.
  - Filters: Topic tags, source type, confidence rating, resolution date.
  - Market cards display: question, summary, odds snapshot, trading volume, proof timeline badge.
  - Search bar with typeahead.
  - “Series” sections linking related markets (e.g., election states).

### 4. Market Detail
- **Tabs:** Overview, Trade, Resolution, Activity.
- **Sections:**
  - Header: question, status chip (Active/Resolved/Invalid).
  - Odds/price chart with depth view.
  - Resolution criteria block (source list, trigger logic, fallback).
  - Proof timeline widget (expected SLA, submitted proof hash, verification status).
  - AI rationale accordion for transparency.
  - Discussion/comments module (optional).
  - Liquidity panel: pool size, fee breakdown, add/remove liquidity CTA.

### 5. Proof Submission Panel
- **Access:** Limited to whitelisted wallets initially.
- **Flow:**
  1. Select market (search/list of pending resolutions).
  2. Upload proof artifact or provide reference (CID/hash).
  3. Form fields for source URI, fetch timestamp, SLA classification.
  4. Client-side validation (hash length, format).
  5. On success, trigger on-chain transaction via wallet adapter.
  6. Confirmation screen with transaction link and bounty estimate.

### 6. Account Dashboard
- **Tabs:** My Markets, Liquidity, Earnings, Notifications.
- **Widgets:** Creator fee earnings, outstanding stakes, proof bounties collected, dispute alerts.
- **Management:** Ability to withdraw fee shares, reclaim stake, update notification settings.

## Data Sources & APIs
- **GraphQL/REST Backend:** Market drafts, curation state, AI logs.
- **Indexer Service:** Market list, stats, price history, proof status.
- **Solana RPC/Websocket:** Real-time program events (trades, proof submissions, settlements).
- **Auth Service:** Curator roles, session tokens.

Use Vue Query to fetch/refresh data with caching; subscribe to indexer websocket for updates (e.g., market resolved).

## State Management Patterns
- Use Vue Query for server state composables (e.g., `useMarketQuery`, `useMarketListQuery`, `useCuratorQueueQuery`).
- Local UI state (open modals, form wizard steps) managed via Pinia modules or component-level refs.
- Feature flags via LaunchDarkly or simple config service to toggle experimental flows (e.g., auto-curation).

## UX Considerations
- Provide inline explanations/tooltips for fees, proof statuses, SLA deadlines.
- Accessibility: keyboard navigation, ARIA labels, color contrasts for status chips.
- Internationalization: prepare copy for localization; display times in both user locale and UTC.
- Error handling: friendly fallback screens for RPC failures, AI service downtime.
- Skeleton loaders for lists via Vue suspense; optimistic updates where safe (e.g., adding liquidity) using Vue Query mutation options.

## Analytics & Telemetry
- Instrument key funnels: Create → Submit, Curator review durations, Trade conversions, Proof submission times.
- Client events forwarded to analytics pipeline (e.g., Segment → BigQuery).
- Use feature-level dashboards for sticky metrics (e.g., markets per creator, proof SLA adherence).

## Security
- Wallet transactions signed client-side; never expose private keys.
- Harden inputs against XSS; sanitize any AI-generated HTML.
- Rate limit proof panel actions per wallet/IP.
- Use CAPTCHA or challenge for repeated failed curator logins.

## Roadmap Enhancements
- Mobile-optimized trading & discovery views.
- Social sharing cards with real-time odds snapshot.
- Notification subscriptions (email, push) for market updates.
- Embedded widgets for partners to host market previews.
- Dark mode and custom themes for community branding.
