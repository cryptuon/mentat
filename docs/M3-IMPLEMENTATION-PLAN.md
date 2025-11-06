# M3 - On-Chain Launch: Implementation Plan

**Milestone**: M3 - On-Chain Launch
**Status**: 🚧 In Progress
**Start Date**: October 30, 2025
**Target Completion**: 3-4 weeks

---

## Overview

M3 brings the Mentat Protocol to Solana, enabling on-chain market creation, trading, and settlement with zkTLS-verified resolution.

## Goals

- Deploy smart contracts to Solana for market creation and settlement
- Enable trading with real funds on-chain
- Index blockchain events for real-time updates
- Integrate crypto wallets for transaction signing
- Build trading interface for buying/selling positions

---

## Architecture

```
┌─────────────────┐
│   Web Frontend  │  Wallet Integration + Trading UI
│                 │
└────────┬────────┘
         │ WebSocket + HTTP
         │
┌────────▼────────┐
│  Backend API    │  Event Indexer + REST API
│                 │
└────────┬────────┘
         │ RPC
         │
┌────────▼────────┐
│ Solana Programs │  Market Factory + Settlement
│                 │
└─────────────────┘
```

---

## Components

### 1. Solana Programs (Anchor Framework)

#### Market Factory Program
- **Purpose**: Create and manage prediction markets
- **Features**:
  - Deploy new markets from curator-approved drafts
  - Store market metadata on-chain
  - Manage market state transitions (Open → Trading → Resolved → Settled)
  - Handle liquidity pool initialization
  - Collect trading fees

**Accounts**:
- `MarketAccount` - Market state and metadata
- `OutcomeAccount` - Individual outcome state
- `LiquidityPoolAccount` - AMM pool for trading
- `FeeVaultAccount` - Fee collection

**Instructions**:
- `initialize_market` - Deploy new market
- `add_liquidity` - LP provision
- `remove_liquidity` - LP withdrawal
- `update_market_state` - State transitions
- `close_market` - Finalize market

#### Market Settlement Program
- **Purpose**: Resolve markets and distribute payouts
- **Features**:
  - Accept zkTLS proofs for resolution
  - Verify proof validity
  - Calculate payouts based on outcomes
  - Distribute winnings to position holders
  - Handle dispute resolution

**Accounts**:
- `ResolutionAccount` - Resolution state
- `ProofAccount` - zkTLS proof data
- `PayoutAccount` - Payout calculations
- `DisputeAccount` - Dispute tracking

**Instructions**:
- `submit_proof` - Submit zkTLS proof
- `verify_proof` - Validate proof
- `resolve_market` - Finalize outcome
- `claim_payout` - User claims winnings
- `open_dispute` - Challenge resolution
- `settle_dispute` - Resolve dispute

### 2. Event Indexer Service

**Purpose**: Listen to Solana events and sync with PostgreSQL

**Features**:
- WebSocket connection to Solana RPC
- Event parsing and validation
- Database synchronization
- Real-time notifications
- Historical event replay

**Events to Index**:
- `MarketCreated` - New market deployed
- `TradeExecuted` - Position bought/sold
- `LiquidityAdded` - LP deposit
- `LiquidityRemoved` - LP withdrawal
- `MarketResolved` - Market outcome set
- `PayoutClaimed` - User claimed winnings
- `DisputeOpened` - Resolution challenged

**Implementation**:
```typescript
// apps/indexer/
├── src/
│   ├── listeners/
│   │   ├── marketFactory.ts
│   │   └── marketSettlement.ts
│   ├── parsers/
│   │   ├── eventParser.ts
│   │   └── accountParser.ts
│   ├── sync/
│   │   ├── databaseSync.ts
│   │   └── stateSync.ts
│   └── main.ts
```

### 3. Wallet Integration (Frontend)

**Wallets to Support**:
- Phantom
- Solflare
- Backpack
- Sollet (legacy)

**Features**:
- Auto-detect installed wallets
- Connect/disconnect wallet
- Sign transactions
- Sign messages (for authentication)
- Display balance and assets
- Transaction history

**Implementation**:
```typescript
// apps/web/src/lib/wallet/
├── walletAdapter.ts      // Main adapter
├── phantom.ts            // Phantom integration
├── solflare.ts           // Solflare integration
├── types.ts              // Type definitions
└── useWallet.ts          // Vue composable
```

**Store**:
```typescript
// apps/web/src/stores/wallet.ts
export const useWalletStore = defineStore('wallet', () => {
  const connected = ref(false);
  const publicKey = ref<PublicKey | null>(null);
  const balance = ref(0);
  const provider = ref<WalletProvider | null>(null);

  async function connect(walletName: string): Promise<void>;
  async function disconnect(): Promise<void>;
  async function signTransaction(tx: Transaction): Promise<Transaction>;
  async function sendTransaction(tx: Transaction): Promise<string>;
});
```

### 4. Trading Interface

**Components**:

#### OrderBook Component
- Display buy/sell orders
- Real-time updates via WebSocket
- Order depth visualization
- Bid-ask spread

#### TradeForm Component
- Buy/Sell toggle
- Amount input with balance check
- Price calculation (AMM-based)
- Slippage settings
- Transaction preview
- Confirm and sign

#### PositionManager Component
- Display user's positions
- Unrealized P&L
- Realized P&L
- Average entry price
- Current market price
- Close position action

#### Portfolio View
- Total portfolio value
- Position breakdown by market
- Historical P&L chart
- Trade history table
- Performance metrics

**Implementation**:
```vue
// apps/web/src/components/trading/
├── OrderBook.vue
├── TradeForm.vue
├── PositionManager.vue
├── Portfolio.vue
├── PriceChart.vue
└── TradeHistory.vue
```

### 5. WebSocket Real-Time Updates

**Server** (Backend):
```python
# apps/backend/src/websocket/
├── manager.py          # WebSocket connection manager
├── events.py           # Event broadcasting
└── handlers.py         # Message handlers
```

**Client** (Frontend):
```typescript
// apps/web/src/lib/websocket/
├── client.ts           # WebSocket client
├── handlers.ts         # Message handlers
└── useWebSocket.ts     # Vue composable
```

**Events**:
- `market:price_update` - Price changes
- `market:trade` - New trade executed
- `market:orderbook` - Order book updates
- `position:update` - User position changes
- `curator:queue_update` - New draft in queue
- `market:state_change` - Market state transition

---

## Implementation Phases

### Phase 1: Solana Programs (Week 1-2)

**Tasks**:
1. Set up Anchor workspace
2. Implement Market Factory program
3. Implement Market Settlement program
4. Write unit tests
5. Deploy to devnet
6. Integration tests on devnet

**Deliverables**:
- Working Solana programs on devnet
- Test suite with >80% coverage
- Program documentation

### Phase 2: Event Indexer (Week 2)

**Tasks**:
1. Set up indexer service
2. Implement event listeners
3. Implement event parsers
4. Database sync logic
5. Error handling and retry
6. Historical sync

**Deliverables**:
- Indexer service syncing events to PostgreSQL
- Real-time updates working
- Monitoring and logging

### Phase 3: Wallet Integration (Week 2-3)

**Tasks**:
1. Implement wallet adapter
2. Add Phantom support
3. Add Solflare support
4. Wallet selection UI
5. Transaction signing
6. Balance display

**Deliverables**:
- Wallet connection working
- Transaction signing functional
- Multi-wallet support

### Phase 4: Trading Interface (Week 3-4)

**Tasks**:
1. Build OrderBook component
2. Build TradeForm component
3. Build PositionManager component
4. Build Portfolio view
5. Implement AMM calculations
6. Add transaction confirmations

**Deliverables**:
- Full trading interface
- Position management
- Portfolio tracking

### Phase 5: WebSocket Updates (Week 4)

**Tasks**:
1. Implement WebSocket server
2. Implement WebSocket client
3. Event broadcasting
4. Real-time price updates
5. Order book updates
6. Position updates

**Deliverables**:
- Real-time updates working
- Low latency (<100ms)
- Stable connections

---

## Technical Specifications

### Solana Program Details

**Market Factory Program**:

```rust
// State Accounts
#[account]
pub struct MarketAccount {
    pub market_id: u64,
    pub creator: Pubkey,
    pub question_text: String,
    pub outcomes: Vec<OutcomeData>,
    pub state: MarketState,
    pub trading_fee_bps: u16,
    pub liquidity_pool: Pubkey,
    pub created_at: i64,
    pub resolution_deadline: i64,
    pub total_volume: u64,
    pub bump: u8,
}

#[account]
pub struct LiquidityPoolAccount {
    pub market: Pubkey,
    pub reserves: Vec<u64>,  // One per outcome
    pub lp_token_supply: u64,
    pub fee_vault: Pubkey,
    pub bump: u8,
}

// Instructions
pub fn initialize_market(
    ctx: Context<InitializeMarket>,
    market_id: u64,
    question_text: String,
    outcomes: Vec<OutcomeData>,
    trading_fee_bps: u16,
    initial_liquidity: u64,
) -> Result<()>;

pub fn execute_trade(
    ctx: Context<ExecuteTrade>,
    outcome_index: u8,
    amount: u64,
    is_buy: bool,
    max_slippage_bps: u16,
) -> Result<()>;
```

**Market Settlement Program**:

```rust
// State Accounts
#[account]
pub struct ResolutionAccount {
    pub market: Pubkey,
    pub resolver: Pubkey,
    pub proof_hash: [u8; 32],
    pub winning_outcome: u8,
    pub resolved_at: i64,
    pub dispute_window_end: i64,
    pub disputed: bool,
    pub bump: u8,
}

#[account]
pub struct ProofAccount {
    pub resolution: Pubkey,
    pub proof_data: Vec<u8>,  // zkTLS proof
    pub source_url: String,
    pub verified: bool,
    pub bump: u8,
}

// Instructions
pub fn submit_proof(
    ctx: Context<SubmitProof>,
    proof_data: Vec<u8>,
    source_url: String,
) -> Result<()>;

pub fn resolve_market(
    ctx: Context<ResolveMarket>,
    winning_outcome: u8,
) -> Result<()>;

pub fn claim_payout(
    ctx: Context<ClaimPayout>,
) -> Result<()>;
```

### Event Indexer Architecture

```typescript
class EventIndexer {
  private connection: Connection;
  private subscriptions: Map<string, number>;

  async start(): Promise<void> {
    // Connect to Solana WebSocket
    await this.connectWebSocket();

    // Subscribe to program logs
    await this.subscribeToPrograms();

    // Start event processing
    await this.processEvents();
  }

  async subscribeToPrograms(): Promise<void> {
    // Subscribe to Market Factory
    this.subscriptions.set(
      'marketFactory',
      this.connection.onLogs(
        MARKET_FACTORY_PROGRAM_ID,
        (logs) => this.handleMarketFactoryEvent(logs)
      )
    );

    // Subscribe to Market Settlement
    this.subscriptions.set(
      'marketSettlement',
      this.connection.onLogs(
        MARKET_SETTLEMENT_PROGRAM_ID,
        (logs) => this.handleMarketSettlementEvent(logs)
      )
    );
  }

  async handleMarketFactoryEvent(logs: Logs): Promise<void> {
    const events = parseMarketFactoryEvents(logs);
    for (const event of events) {
      await this.syncToDatabase(event);
      await this.broadcastToWebSocket(event);
    }
  }
}
```

### Wallet Adapter Implementation

```typescript
export class WalletAdapter {
  private provider: WalletProvider | null = null;

  async connect(walletName: string): Promise<void> {
    switch (walletName) {
      case 'phantom':
        this.provider = new PhantomProvider();
        break;
      case 'solflare':
        this.provider = new SolflareProvider();
        break;
      default:
        throw new Error(`Unsupported wallet: ${walletName}`);
    }

    await this.provider.connect();
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.provider) throw new Error('Wallet not connected');
    return await this.provider.signTransaction(transaction);
  }

  async sendTransaction(transaction: Transaction): Promise<string> {
    if (!this.provider) throw new Error('Wallet not connected');
    const signed = await this.signTransaction(transaction);
    return await this.connection.sendRawTransaction(signed.serialize());
  }
}
```

---

## Database Schema Updates

### New Tables for M3

```sql
-- On-chain market data
CREATE TABLE blockchain_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id BIGINT UNIQUE NOT NULL,
    program_address VARCHAR(44) NOT NULL,
    draft_id UUID REFERENCES market_drafts(id),
    tx_signature VARCHAR(88) NOT NULL,
    deployed_at TIMESTAMP NOT NULL,
    block_number BIGINT NOT NULL,
    slot BIGINT NOT NULL,
    INDEX idx_program_address (program_address),
    INDEX idx_market_id (market_id)
);

-- Trades
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id BIGINT NOT NULL REFERENCES blockchain_markets(market_id),
    trader_pubkey VARCHAR(44) NOT NULL,
    outcome_index INT NOT NULL,
    is_buy BOOLEAN NOT NULL,
    amount BIGINT NOT NULL,
    price NUMERIC(20, 8) NOT NULL,
    fee BIGINT NOT NULL,
    tx_signature VARCHAR(88) NOT NULL,
    block_time TIMESTAMP NOT NULL,
    INDEX idx_market_id (market_id),
    INDEX idx_trader (trader_pubkey),
    INDEX idx_block_time (block_time)
);

-- Positions
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id BIGINT NOT NULL REFERENCES blockchain_markets(market_id),
    user_pubkey VARCHAR(44) NOT NULL,
    outcome_index INT NOT NULL,
    shares BIGINT NOT NULL,
    average_price NUMERIC(20, 8) NOT NULL,
    realized_pnl BIGINT DEFAULT 0,
    unrealized_pnl BIGINT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (market_id, user_pubkey, outcome_index),
    INDEX idx_user (user_pubkey),
    INDEX idx_market_user (market_id, user_pubkey)
);

-- Resolutions
CREATE TABLE resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id BIGINT NOT NULL REFERENCES blockchain_markets(market_id),
    resolver_pubkey VARCHAR(44) NOT NULL,
    proof_hash VARCHAR(64) NOT NULL,
    winning_outcome INT NOT NULL,
    proof_data BYTEA,
    source_url TEXT,
    resolved_at TIMESTAMP NOT NULL,
    tx_signature VARCHAR(88) NOT NULL,
    disputed BOOLEAN DEFAULT FALSE,
    INDEX idx_market_id (market_id)
);
```

---

## Testing Strategy

### Unit Tests
- Solana program instructions
- Event parsers
- Wallet adapters
- Trading calculations

### Integration Tests
- End-to-end market creation
- Trading flow
- Resolution and payout
- Event indexing

### E2E Tests (Devnet)
- Deploy market from curator approval
- Execute trades via UI
- Submit proof and resolve
- Claim payouts

---

## Deployment Strategy

### Devnet Deployment
1. Deploy programs to Solana devnet
2. Configure frontend to use devnet
3. Test with devnet SOL
4. Validate all flows

### Testnet Deployment
1. Audit programs
2. Deploy to Solana testnet
3. Beta testing with users
4. Monitor performance

### Mainnet Deployment
1. Security audit report
2. Deploy to mainnet
3. Gradual rollout
4. 24/7 monitoring

---

## Success Criteria

- [ ] Markets deployable to Solana from curator approval
- [ ] Users can connect wallet and view balance
- [ ] Users can buy/sell positions with real SOL
- [ ] Real-time price updates working
- [ ] Position tracking accurate
- [ ] Resolution with zkTLS proof functional
- [ ] Payouts claimable
- [ ] All events indexed and synced
- [ ] <500ms latency for trades
- [ ] 99.9% uptime for indexer

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Solana RPC downtime | High | Multiple RPC endpoints, fallback logic |
| Program bugs | Critical | Thorough testing, security audit |
| Event indexer lag | Medium | Buffering, retry logic, monitoring |
| Wallet compatibility | Low | Support top 3 wallets, graceful fallback |
| zkTLS not ready | High | Manual resolution fallback for M3 |

---

## Timeline

**Week 1**: Solana programs development
**Week 2**: Event indexer + wallet integration
**Week 3**: Trading interface + WebSocket
**Week 4**: Testing + deployment to devnet

**Total**: 4 weeks to M3 completion

---

## Next Steps

1. Set up Anchor workspace
2. Implement Market Factory program
3. Write unit tests
4. Deploy to devnet
5. Begin event indexer

---

**Let's build! 🚀**
