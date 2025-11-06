# M3 - On-Chain Launch: Kickoff Summary

**Date**: October 30, 2025
**Milestone**: M3 - On-Chain Launch
**Status**: 🚀 Started
**Target**: 4 weeks

---

## 🎯 What We're Building

M3 brings Mentat Protocol to Solana blockchain, enabling:
- **On-chain market creation** from curator-approved drafts
- **Real trading** with crypto wallets
- **Automated settlement** with zkTLS proofs
- **Real-time updates** via WebSocket
- **Full position tracking** and portfolio management

---

## ✅ Setup Complete

### 1. **Anchor Workspace Initialized**
- Location: `apps/solana-programs/`
- Framework: Anchor 0.31.1
- Ready for Rust development

**Structure**:
```
apps/solana-programs/
├── programs/
│   └── market-factory/      # Renamed from default
├── tests/                   # Integration tests
├── migrations/              # Deployment scripts
├── Anchor.toml             # Workspace config
└── Cargo.toml              # Rust dependencies
```

###2. **Implementation Plan Created**
- Document: `docs/M3-IMPLEMENTATION-PLAN.md`
- **40+ pages** of detailed specifications
- Complete architecture diagrams
- API specifications
- Database schema updates
- Timeline and phases

---

## 📋 M3 Components

### 1. Solana Programs (Anchor/Rust)

#### Market Factory Program
**Purpose**: Create and manage prediction markets

**Features**:
- Deploy markets from approved drafts
- AMM-based liquidity pools
- Trading with dynamic pricing
- Fee collection and distribution
- Market state management

**Key Instructions**:
- `initialize_market` - Deploy new market
- `execute_trade` - Buy/sell positions
- `add_liquidity` - LP provision
- `remove_liquidity` - LP withdrawal
- `update_market_state` - State transitions

#### Market Settlement Program
**Purpose**: Resolve markets and distribute payouts

**Features**:
- Accept zkTLS proofs
- Verify proof validity
- Calculate payouts
- Distribute winnings
- Handle disputes

**Key Instructions**:
- `submit_proof` - Submit zkTLS proof
- `verify_proof` - Validate proof
- `resolve_market` - Finalize outcome
- `claim_payout` - User claims winnings
- `open_dispute` - Challenge resolution

### 2. Event Indexer Service (TypeScript)

**Purpose**: Sync blockchain events to PostgreSQL

**Features**:
- WebSocket connection to Solana RPC
- Real-time event processing
- Database synchronization
- Historical event replay
- Notification broadcasting

**Events Indexed**:
- `MarketCreated`
- `TradeExecuted`
- `LiquidityAdded/Removed`
- `MarketResolved`
- `PayoutClaimed`
- `DisputeOpened`

### 3. Wallet Integration (Vue 3)

**Wallets Supported**:
- Phantom (primary)
- Solflare
- Backpack
- Sollet

**Features**:
- Auto-detect installed wallets
- Connect/disconnect
- Sign transactions
- Sign messages (auth)
- Balance display
- Transaction history

### 4. Trading Interface (Vue 3)

**Components**:
- **OrderBook** - Buy/sell orders with depth
- **TradeForm** - Execute trades with slippage control
- **PositionManager** - View and close positions
- **Portfolio** - Total value and P&L tracking
- **PriceChart** - Historical price visualization
- **TradeHistory** - Past transactions

### 5. WebSocket Real-Time Updates (FastAPI + Vue)

**Server**:
- WebSocket manager
- Event broadcasting
- Connection management

**Client**:
- Auto-reconnect
- Message handling
- State synchronization

**Events**:
- Price updates (<100ms latency)
- Order book changes
- Position updates
- Market state changes
- Curator queue updates

---

## 🗂️ Project Structure (After M3)

```
mentat-protocol/
├── apps/
│   ├── backend/              # FastAPI (existing)
│   ├── web/                  # Vue 3 (existing)
│   ├── ai-agents/            # DSPy (existing)
│   ├── solana-programs/      # NEW: Anchor workspace
│   │   ├── programs/
│   │   │   ├── market-factory/
│   │   │   └── market-settlement/
│   │   ├── tests/
│   │   └── migrations/
│   └── indexer/              # NEW: Event indexer service
│       ├── src/
│       │   ├── listeners/
│       │   ├── parsers/
│       │   ├── sync/
│       │   └── main.ts
│       ├── package.json
│       └── tsconfig.json
├── docs/
│   ├── M3-IMPLEMENTATION-PLAN.md  # NEW
│   └── [other docs]
└── README.md
```

---

## 🛠️ Tech Stack Additions

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Solana Programs** | Anchor 0.31 | Smart contracts |
| | Rust 1.75+ | Program language |
| **Event Indexer** | TypeScript | Event processing |
| | @solana/web3.js | Solana RPC client |
| **Wallet** | @solana/wallet-adapter | Multi-wallet support |
| | @solana/spl-token | Token operations |
| **Trading** | AMM algorithms | Price calculations |
| | Chart.js | Price visualization |

---

## 📊 Database Schema Updates

### New Tables (4)

```sql
-- On-chain markets
blockchain_markets (
  id, market_id, program_address,
  draft_id, tx_signature, deployed_at
)

-- Trades
trades (
  id, market_id, trader_pubkey, outcome_index,
  is_buy, amount, price, fee, tx_signature
)

-- User positions
positions (
  id, market_id, user_pubkey, outcome_index,
  shares, average_price, realized_pnl, unrealized_pnl
)

-- Resolutions
resolutions (
  id, market_id, resolver_pubkey, proof_hash,
  winning_outcome, proof_data, resolved_at
)
```

---

## 🚀 Development Phases

### **Phase 1: Solana Programs** (Week 1-2)
- [ ] Implement Market Factory program
- [ ] Implement Market Settlement program
- [ ] Write unit tests (>80% coverage)
- [ ] Deploy to devnet
- [ ] Integration tests on devnet

### **Phase 2: Event Indexer** (Week 2)
- [ ] Set up indexer service
- [ ] Implement event listeners
- [ ] Database sync logic
- [ ] Error handling and retry
- [ ] Historical sync

### **Phase 3: Wallet Integration** (Week 2-3)
- [ ] Implement wallet adapter
- [ ] Add Phantom support
- [ ] Add Solflare support
- [ ] Wallet selection UI
- [ ] Transaction signing

### **Phase 4: Trading Interface** (Week 3-4)
- [ ] Build OrderBook component
- [ ] Build TradeForm component
- [ ] Build PositionManager component
- [ ] Build Portfolio view
- [ ] AMM calculations

### **Phase 5: WebSocket Updates** (Week 4)
- [ ] Implement WebSocket server
- [ ] Implement WebSocket client
- [ ] Event broadcasting
- [ ] Real-time updates
- [ ] Performance optimization

---

## 📈 Success Criteria

- [ ] Markets deployable to Solana from curator approval
- [ ] Users can connect wallet (Phantom/Solflare)
- [ ] Users can trade with real SOL
- [ ] Real-time price updates working (<100ms)
- [ ] Position tracking accurate
- [ ] Resolution with proof functional
- [ ] Payouts claimable
- [ ] All events indexed
- [ ] 99.9% indexer uptime

---

## 🎓 Getting Started

### For Solana Programs

```bash
cd apps/solana-programs

# Build programs
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### For Event Indexer

```bash
cd apps/indexer

# Install dependencies
npm install

# Start indexer
npm run dev
```

### For Wallet Integration

```bash
cd apps/web

# Install Solana dependencies
npm install @solana/web3.js @solana/wallet-adapter-react \
  @solana/wallet-adapter-wallets

# Start dev server
npm run dev
```

---

## 📚 Key Documentation

1. **[M3 Implementation Plan](docs/M3-IMPLEMENTATION-PLAN.md)** - Complete technical specifications
2. **[Solana Programs README](apps/solana-programs/README.md)** - Program development guide
3. **[Solana Market Schema](docs/solana-market-schema.md)** - On-chain account structures (existing)
4. **[M2 Completion Summary](docs/M2-COMPLETION-SUMMARY.md)** - What we built in M2

---

## 🔥 What's Next

### Immediate Actions

1. **Implement Market Factory Program**
   - Define account structures (`MarketAccount`, `LiquidityPoolAccount`)
   - Implement instructions (`initialize_market`, `execute_trade`)
   - Write unit tests
   - Deploy to devnet

2. **Implement Market Settlement Program**
   - Define account structures (`ResolutionAccount`, `ProofAccount`)
   - Implement instructions (`submit_proof`, `resolve_market`, `claim_payout`)
   - Write unit tests
   - Deploy to devnet

3. **Create Event Indexer**
   - Set up TypeScript project
   - Implement Solana WebSocket listener
   - Parse events and sync to database
   - Add error handling and retry logic

4. **Integrate Wallets**
   - Add @solana/wallet-adapter
   - Implement Phantom connection
   - Implement Solflare connection
   - Build wallet selection UI

5. **Build Trading Interface**
   - Create OrderBook component
   - Create TradeForm component
   - Create PositionManager component
   - Add price chart visualization

---

## ⚡ Quick Commands

```bash
# Start full stack (M3)
# Terminal 1: Backend
cd apps/backend && source venv/bin/activate && make run

# Terminal 2: Frontend
cd apps/web && npm run dev

# Terminal 3: Indexer (after implementation)
cd apps/indexer && npm run dev

# Terminal 4: Build Solana programs
cd apps/solana-programs && anchor build && anchor test
```

---

## 🎊 Progress Tracking

Track M3 progress in:
- GitHub Issues
- This document (update checkboxes)
- Todo list (via CLI)

---

## 🚀 Let's Build!

M3 is officially started. We have:
- ✅ Complete implementation plan (40+ pages)
- ✅ Anchor workspace set up
- ✅ Directory structure ready
- ✅ Clear phases and timeline

**Next step**: Implement Market Factory program in Rust using Anchor framework.

---

**Questions or blockers?** Check the implementation plan or open an issue.

**Ready to code?** Start with `apps/solana-programs/programs/market-factory/src/lib.rs`

🎯 **Target**: M3 Complete in 4 weeks
📅 **ETA**: End of November 2025

**Let's ship it!** 🚀
