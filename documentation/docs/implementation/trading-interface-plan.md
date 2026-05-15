# Phase 4: Trading Interface - Implementation Plan

> **Note:** This page is a point-in-time status snapshot and may be out of date relative to the current source. PRs welcome.

## Overview

Build a complete trading interface that allows users to:
- Place buy/sell orders for market outcomes
- View and manage their positions
- Add/remove liquidity
- Track portfolio performance
- Execute transactions via connected Solana wallet

**Status**: 📋 **PLANNING PHASE**
**Dependencies**:
- ✅ Wallet Integration (Phase 3) - Complete
- ⏳ Solana Programs deployed - Pending
- ⏳ Event Indexer running - Pending

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  MarketDetail View                                  │
│  ┌───────────────────┐  ┌────────────────────────┐ │
│  │  Market Info      │  │  Trading Panel         │ │
│  │  (existing)       │  │  - Buy/Sell tabs       │ │
│  │                   │  │  - Amount input        │ │
│  │  - Question       │  │  - Price display       │ │
│  │  - Odds           │  │  - Slippage settings   │ │
│  │  - Chart          │  │  - Execute button      │ │
│  │  - Timeline       │  └────────────────────────┘ │
│  └───────────────────┘                             │
│                                                      │
│  ┌───────────────────┐  ┌────────────────────────┐ │
│  │  Order Book       │  │  Your Positions        │ │
│  │  - Recent trades  │  │  - YES position        │ │
│  │  - Buy orders     │  │  - NO position         │ │
│  │  - Sell orders    │  │  - Unrealized PnL      │ │
│  │  - Depth chart    │  │  - Avg price           │ │
│  └───────────────────┘  └────────────────────────┘ │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Liquidity Pool                               │  │
│  │  - Add liquidity                              │  │
│  │  - Remove liquidity                           │  │
│  │  - LP token balance                           │  │
│  │  - APY estimate                               │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  Solana Program Service                             │
│  - executeTrade()                                   │
│  - addLiquidity()                                   │
│  - removeLiquidity()                                │
│  - getUserPositions()                               │
│  - getMarketData()                                  │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  Wallet Store (from Phase 3)                        │
│  - signTransaction()                                │
│  - publicKey                                        │
│  - connected                                        │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│  Solana Programs (on-chain)                         │
│  - market-factory                                   │
│  - market-settlement                                │
└─────────────────────────────────────────────────────┘
```

---

## Components to Build

### 1. TradingPanel Component ⭐ HIGH PRIORITY

**File**: `apps/web/src/components/trading/TradingPanel.vue`

**Features**:
- Buy/Sell toggle tabs
- Outcome selection (YES/NO)
- Amount input (USDC)
- Price display (shares received)
- Slippage tolerance setting
- Fee breakdown display
- Transaction confirmation modal
- Loading states during tx
- Success/error notifications

**Props**:
```typescript
interface TradingPanelProps {
  marketId: string;
  outcomes: Array<{
    index: number;
    label: string;
    currentPrice: number;
  }>;
  liquidity: number;
  tradingFee: number;
}
```

**Emits**:
```typescript
{
  'trade-executed': {
    outcomeIndex: number,
    isBuy: boolean,
    amount: bigint,
    signature: string
  }
}
```

### 2. PositionCard Component ⭐ HIGH PRIORITY

**File**: `apps/web/src/components/trading/PositionCard.vue`

**Features**:
- Display user positions for each outcome
- Show shares owned
- Calculate unrealized PnL
- Display average entry price
- Show current market value
- Close position button
- Position history timeline

**Props**:
```typescript
interface PositionCardProps {
  marketId: string;
  outcomeLabel: string;
  shares: bigint;
  avgPrice: number;
  currentPrice: number;
  walletAddress: string;
}
```

### 3. OrderBook Component

**File**: `apps/web/src/components/trading/OrderBook.vue`

**Features**:
- Recent trades list
- Buy/sell order depth
- Price levels visualization
- Volume at each price
- Real-time updates via indexer

**Props**:
```typescript
interface OrderBookProps {
  marketId: string;
  trades: Array<{
    timestamp: number;
    outcomeIndex: number;
    isBuy: boolean;
    amount: bigint;
    price: bigint;
    trader: string;
  }>;
}
```

### 4. LiquidityPanel Component

**File**: `apps/web/src/components/trading/LiquidityPanel.vue`

**Features**:
- Add liquidity form
- Remove liquidity form
- LP token balance display
- Current APY estimate
- Pool share percentage
- Fee earnings calculator
- Transaction execution

**Props**:
```typescript
interface LiquidityPanelProps {
  marketId: string;
  poolSize: bigint;
  lpTokenSupply: bigint;
  userLpTokens: bigint;
  currentApy: number;
}
```

### 5. PortfolioSummary Component

**File**: `apps/web/src/components/trading/PortfolioSummary.vue`

**Features**:
- Total portfolio value
- Unrealized PnL across all markets
- Win rate statistics
- Recent positions list
- Performance chart

**Props**:
```typescript
interface PortfolioSummaryProps {
  walletAddress: string;
}
```

---

## Services to Build

### 1. Solana Program Service ⭐ CRITICAL

**File**: `apps/web/src/services/solanaProgram.ts`

**Functions**:

```typescript
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';

class SolanaProgramService {
  private connection: Connection;
  private marketFactoryProgram: Program;
  private marketSettlementProgram: Program;

  /**
   * Execute a trade on a market
   */
  async executeTrade(
    marketId: PublicKey,
    outcomeIndex: number,
    isBuy: boolean,
    amount: bigint,
    maxSlippage: number
  ): Promise<string>;

  /**
   * Add liquidity to a market
   */
  async addLiquidity(
    marketId: PublicKey,
    amount: bigint
  ): Promise<string>;

  /**
   * Remove liquidity from a market
   */
  async removeLiquidity(
    marketId: PublicKey,
    lpTokens: bigint
  ): Promise<string>;

  /**
   * Get user positions for a market
   */
  async getUserPositions(
    marketId: PublicKey,
    userWallet: PublicKey
  ): Promise<{
    outcomeIndex: number;
    shares: bigint;
    avgPrice: number;
  }[]>;

  /**
   * Get market on-chain data
   */
  async getMarketData(
    marketId: PublicKey
  ): Promise<{
    creator: PublicKey;
    questionText: string;
    numOutcomes: number;
    liquidity: bigint;
    tradingFee: number;
    state: string;
  }>;

  /**
   * Calculate expected shares for a trade
   */
  calculateExpectedShares(
    amount: bigint,
    currentPrice: number,
    liquidity: bigint,
    isBuy: boolean
  ): bigint;

  /**
   * Calculate price impact
   */
  calculatePriceImpact(
    amount: bigint,
    liquidity: bigint
  ): number;

  /**
   * Get current outcome prices
   */
  async getOutcomePrices(
    marketId: PublicKey
  ): Promise<number[]>;
}

export const solanaProgramService = new SolanaProgramService();
```

### 2. Transaction Builder Service

**File**: `apps/web/src/services/transactionBuilder.ts`

**Functions**:

```typescript
import { Transaction, TransactionInstruction } from '@solana/web3.js';

class TransactionBuilder {
  /**
   * Build trade transaction
   */
  buildTradeTransaction(
    marketId: PublicKey,
    outcomeIndex: number,
    isBuy: boolean,
    amount: bigint,
    userWallet: PublicKey
  ): Transaction;

  /**
   * Build add liquidity transaction
   */
  buildAddLiquidityTransaction(
    marketId: PublicKey,
    amount: bigint,
    userWallet: PublicKey
  ): Transaction;

  /**
   * Build remove liquidity transaction
   */
  buildRemoveLiquidityTransaction(
    marketId: PublicKey,
    lpTokens: bigint,
    userWallet: PublicKey
  ): Transaction;

  /**
   * Add priority fee for faster execution
   */
  addPriorityFee(
    transaction: Transaction,
    microLamports: number
  ): Transaction;

  /**
   * Simulate transaction before sending
   */
  async simulateTransaction(
    transaction: Transaction
  ): Promise<{
    success: boolean;
    logs: string[];
    error?: string;
  }>;
}

export const transactionBuilder = new TransactionBuilder();
```

### 3. Position Tracker Service

**File**: `apps/web/src/services/positionTracker.ts`

**Functions**:

```typescript
class PositionTracker {
  /**
   * Get all positions for a wallet
   */
  async getWalletPositions(
    walletAddress: PublicKey
  ): Promise<Position[]>;

  /**
   * Calculate unrealized PnL
   */
  calculateUnrealizedPnL(
    position: Position,
    currentPrice: number
  ): number;

  /**
   * Get portfolio summary
   */
  async getPortfolioSummary(
    walletAddress: PublicKey
  ): Promise<{
    totalValue: number;
    totalPnL: number;
    positions: Position[];
    winRate: number;
  }>;

  /**
   * Track position history
   */
  async getPositionHistory(
    marketId: PublicKey,
    walletAddress: PublicKey
  ): Promise<PositionSnapshot[]>;
}

export const positionTracker = new PositionTracker();
```

---

## State Management

### Trading Store

**File**: `apps/web/src/stores/trading.ts`

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTradingStore = defineStore('trading', () => {
  // State
  const activeMarket = ref<string | null>(null);
  const pendingTransactions = ref<Map<string, Transaction>>(new Map());
  const positions = ref<Position[]>([]);
  const recentTrades = ref<Trade[]>([]);

  // Computed
  const hasOpenPositions = computed(() => positions.value.length > 0);
  const totalPortfolioValue = computed(() => {
    return positions.value.reduce((sum, pos) => sum + pos.currentValue, 0);
  });

  // Actions
  async function executeTrade(params: TradeParams): Promise<string>;
  async function addLiquidity(params: LiquidityParams): Promise<string>;
  async function removeLiquidity(params: LiquidityParams): Promise<string>;
  async function loadPositions(walletAddress: PublicKey): Promise<void>;
  async function loadRecentTrades(marketId: string): Promise<void>;
  function clearPositions(): void;

  return {
    activeMarket,
    pendingTransactions,
    positions,
    recentTrades,
    hasOpenPositions,
    totalPortfolioValue,
    executeTrade,
    addLiquidity,
    removeLiquidity,
    loadPositions,
    loadRecentTrades,
    clearPositions,
  };
});
```

---

## Integration with MarketDetail

### Update MarketDetail.vue

**Changes**:
1. Add TradingPanel to sidebar
2. Add PositionCard below trading panel
3. Add OrderBook to main content area
4. Add LiquidityPanel as collapsible section
5. Connect wallet check before trading
6. Real-time updates from indexer

**Layout**:
```vue
<template>
  <div class="market-detail">
    <PageHeader :title="market.question" />

    <div class="detail-layout">
      <!-- Left: Market info (existing) -->
      <div class="detail-left">
        <MarketOverview :market="market" />
        <PriceChart :marketId="market.id" />
        <OrderBook :marketId="market.id" />
        <MarketRationale :market="market" />
        <ResolutionRules :market="market" />
      </div>

      <!-- Right: Trading interface (NEW) -->
      <aside class="detail-sidebar">
        <!-- Wallet check -->
        <WalletRequiredCard v-if="!walletStore.connected" />

        <!-- Trading panel -->
        <TradingPanel
          v-else
          :marketId="market.id"
          :outcomes="market.outcomes"
          :liquidity="market.liquidity.poolSize"
          :tradingFee="market.feeBreakdown.tradingFee"
          @trade-executed="handleTradeExecuted"
        />

        <!-- User positions -->
        <PositionCard
          v-if="hasPosition"
          :marketId="market.id"
          :position="userPosition"
        />

        <!-- Liquidity panel -->
        <LiquidityPanel
          :marketId="market.id"
          :poolSize="market.liquidity.poolSize"
          :userLpTokens="userLpTokens"
        />

        <!-- Existing widgets -->
        <ProofTimeline :market="market" />
        <FeeBreakdown :market="market" />
      </aside>
    </div>
  </div>
</template>
```

---

## Implementation Steps

### Step 1: Solana Program Service (CRITICAL PATH) ⭐

**Priority**: HIGHEST
**Estimated Time**: 4-6 hours
**Blockers**: Requires program IDLs

**Tasks**:
1. ✅ Wait for Solana programs to be fixed and deployed
2. Generate program IDLs from deployed programs
3. Create `SolanaProgramService` class
4. Implement `executeTrade()` function
5. Implement `addLiquidity()` function
6. Implement `removeLiquidity()` function
7. Implement `getUserPositions()` function
8. Implement `getMarketData()` function
9. Add error handling and retries
10. Write unit tests

**Files to Create**:
- `apps/web/src/services/solanaProgram.ts`
- `apps/web/src/services/transactionBuilder.ts`
- `apps/web/src/types/program.ts`

### Step 2: Trading Store

**Priority**: HIGH
**Estimated Time**: 2-3 hours
**Dependencies**: Step 1

**Tasks**:
1. Create Pinia trading store
2. Define state (positions, trades, pending txs)
3. Implement trade execution action
4. Implement position loading
5. Add transaction tracking
6. Add error state management

**Files to Create**:
- `apps/web/src/stores/trading.ts`

### Step 3: TradingPanel Component

**Priority**: HIGH
**Estimated Time**: 4-5 hours
**Dependencies**: Step 1, Step 2

**Tasks**:
1. Create TradingPanel component structure
2. Build buy/sell toggle UI
3. Add amount input with validation
4. Calculate expected shares
5. Display price impact
6. Add slippage settings
7. Implement transaction confirmation modal
8. Add loading states
9. Handle success/error notifications
10. Test with wallet integration

**Files to Create**:
- `apps/web/src/components/trading/TradingPanel.vue`
- `apps/web/src/components/trading/TradeConfirmModal.vue`

### Step 4: PositionCard Component

**Priority**: MEDIUM
**Estimated Time**: 3-4 hours
**Dependencies**: Step 1, Step 2

**Tasks**:
1. Create PositionCard component
2. Display shares owned
3. Calculate and show PnL
4. Show average entry price
5. Display current value
6. Add close position button
7. Style with card design

**Files to Create**:
- `apps/web/src/components/trading/PositionCard.vue`

### Step 5: OrderBook Component

**Priority**: MEDIUM
**Estimated Time**: 3-4 hours
**Dependencies**: Event indexer running

**Tasks**:
1. Create OrderBook component
2. Fetch recent trades from indexer
3. Display trade list with filters
4. Add buy/sell order depth
5. Create depth chart visualization
6. Add real-time updates via WebSocket
7. Style with table design

**Files to Create**:
- `apps/web/src/components/trading/OrderBook.vue`
- `apps/web/src/services/indexerClient.ts`

### Step 6: LiquidityPanel Component

**Priority**: LOW
**Estimated Time**: 3-4 hours
**Dependencies**: Step 1, Step 2

**Tasks**:
1. Create LiquidityPanel component
2. Add liquidity form
3. Remove liquidity form
4. Display LP token balance
5. Calculate APY estimate
6. Show pool share percentage
7. Add transaction execution
8. Style with card design

**Files to Create**:
- `apps/web/src/components/trading/LiquidityPanel.vue`

### Step 7: Integration with MarketDetail

**Priority**: HIGH
**Estimated Time**: 2-3 hours
**Dependencies**: Step 3, Step 4

**Tasks**:
1. Update MarketDetail.vue layout
2. Add TradingPanel to sidebar
3. Add PositionCard below trading
4. Add wallet connection check
5. Handle trade events
6. Update position on trade
7. Add loading states
8. Test full flow

**Files to Modify**:
- `apps/web/src/views/MarketDetail.vue`

### Step 8: Portfolio View (Optional)

**Priority**: LOW
**Estimated Time**: 4-5 hours
**Dependencies**: Step 1, Step 2, Step 4

**Tasks**:
1. Create Portfolio view page
2. Display all positions
3. Show portfolio summary
4. Add PnL chart
5. Show win rate stats
6. Add position filtering

**Files to Create**:
- `apps/web/src/views/Portfolio.vue`
- `apps/web/src/components/trading/PortfolioSummary.vue`

---

## Data Flow

### Trade Execution Flow

```
User clicks "Buy YES" in TradingPanel
  ↓
TradingPanel validates input
  ↓
TradingPanel calls tradingStore.executeTrade()
  ↓
Trading Store calls solanaProgramService.executeTrade()
  ↓
Solana Program Service builds transaction
  ↓
Transaction sent to walletStore.signTransaction()
  ↓
User approves in wallet extension
  ↓
Signed transaction sent to Solana network
  ↓
Wait for confirmation
  ↓
Event Indexer picks up TradeExecutedEvent
  ↓
Update UI with new position
  ↓
Show success notification
```

### Position Loading Flow

```
User connects wallet
  ↓
MarketDetail component loads
  ↓
Check if wallet connected
  ↓
Load positions from tradingStore
  ↓
Trading Store calls solanaProgramService.getUserPositions()
  ↓
Fetch on-chain position data
  ↓
Calculate PnL with current prices
  ↓
Display in PositionCard
```

---

## Error Handling

### Common Errors to Handle

1. **Wallet not connected**
   - Show "Connect Wallet" prompt
   - Disable trading buttons

2. **Insufficient balance**
   - Display error before transaction
   - Show required amount

3. **Slippage exceeded**
   - Transaction fails on-chain
   - Offer to retry with higher slippage

4. **Transaction timeout**
   - Show retry button
   - Keep transaction pending state

5. **Program error**
   - Parse program error code
   - Display user-friendly message

6. **Network error**
   - Show connection error
   - Offer to switch RPC endpoint

---

## Testing Strategy

### Unit Tests
- Test trade calculation functions
- Test position PnL calculations
- Test transaction building
- Test store actions

### Integration Tests
- Test full trade flow
- Test wallet connection flow
- Test error handling
- Test real-time updates

### Manual Testing Checklist
- [ ] Connect wallet
- [ ] Place buy order
- [ ] Place sell order
- [ ] View updated position
- [ ] Close position
- [ ] Add liquidity
- [ ] Remove liquidity
- [ ] Check PnL calculations
- [ ] Test error states
- [ ] Test mobile responsive

---

## Performance Considerations

### Optimization Strategies

1. **Batch RPC calls** - Reduce Solana RPC requests
2. **Cache market data** - Cache frequently accessed data
3. **Debounce input** - Debounce amount input calculations
4. **Virtual scrolling** - For large order books
5. **WebSocket updates** - Real-time via indexer instead of polling
6. **Lazy loading** - Load components as needed

---

## Security Considerations

### Critical Security Measures

1. **Transaction simulation** - Always simulate before sending
2. **Slippage protection** - Enforce maximum slippage
3. **Amount validation** - Validate all inputs client-side
4. **Wallet approval** - Never auto-sign transactions
5. **Display warnings** - Show transaction details before signing
6. **Audit trails** - Log all transactions
7. **Error messages** - Never expose sensitive data in errors

---

## Dependencies

### External Packages (Already Installed)

- `@solana/web3.js` - Solana blockchain interaction
- `@coral-xyz/anchor` - Anchor framework support
- `@solana/wallet-adapter-base` - Wallet integration

### Internal Dependencies

- ✅ Wallet Integration (Phase 3) - COMPLETE
- ⏳ Solana Programs deployed - PENDING
- ⏳ Event Indexer running - PENDING
- ⏳ Program IDLs generated - PENDING

---

## Timeline Estimate

### Fast Track (Minimum Viable Product)
- **Week 1**: Solana Program Service + Trading Store
- **Week 2**: TradingPanel + PositionCard
- **Week 3**: Integration + Testing
- **Total**: 3 weeks

### Full Feature Set
- **Week 1**: Solana Program Service + Trading Store
- **Week 2**: TradingPanel + PositionCard
- **Week 3**: OrderBook + LiquidityPanel
- **Week 4**: Integration + Portfolio View
- **Week 5**: Testing + Bug Fixes
- **Total**: 5 weeks

---

## Success Criteria

### MVP Success Criteria

- [x] Wallet integration complete
- [ ] User can place buy order
- [ ] User can place sell order
- [ ] User can view positions
- [ ] User can see PnL
- [ ] Transactions confirm on-chain
- [ ] UI updates after trade
- [ ] Error handling works

### Full Feature Success Criteria

- [ ] All MVP criteria met
- [ ] User can add liquidity
- [ ] User can remove liquidity
- [ ] Order book displays trades
- [ ] Portfolio view shows all positions
- [ ] Real-time updates working
- [ ] Mobile responsive design
- [ ] Performance optimized
- [ ] Security audit passed

---

## Next Steps

1. ✅ **Complete Wallet Integration** - DONE
2. ⏳ **Fix Solana program compilation errors** - BLOCKING
3. ⏳ **Deploy programs to devnet** - BLOCKING
4. ⏳ **Generate program IDLs** - BLOCKING
5. 🔜 **Start Step 1: Solana Program Service** - READY TO START

---

**Status**: 📋 Planning Complete
**Ready to Implement**: ⏳ Waiting for program deployment
**Estimated Total Effort**: 3-5 weeks (1 developer)

**Next Action**: Fix Solana program compilation errors to unblock trading interface development.
