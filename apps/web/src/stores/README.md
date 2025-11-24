# Stores

This directory contains Pinia stores for state management in the Mentat Protocol Vue 3 application.

## Available Stores

### 1. Auth Store (`auth.ts`)
**Status**: ✅ Complete (M2)

Manages user authentication state including:
- JWT token management
- User session
- Login/logout operations
- Email/password and wallet authentication

**Usage**:
```typescript
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

// Check authentication
if (authStore.isAuthenticated) {
  console.log('User:', authStore.user);
}

// Login
await authStore.login(email, password);

// Logout
authStore.logout();
```

---

### 2. Wallet Store (`wallet.ts`)
**Status**: ✅ Complete (M3 Phase 3)

Manages Solana wallet connection state including:
- Multi-wallet support (Phantom, Solflare)
- Connection/disconnection
- Auto-connect on page load
- Transaction signing (single & batch)
- Message signing
- LocalStorage persistence

**Usage**:
```typescript
import { useWalletStore } from '@/stores/wallet';

const walletStore = useWalletStore();

// Check connection
if (walletStore.connected) {
  console.log('Address:', walletStore.publicKeyBase58);
  console.log('Short:', walletStore.shortAddress);
}

// Connect wallet
await walletStore.connect(walletAdapter);

// Disconnect
await walletStore.disconnect();

// Sign transaction
const signed = await walletStore.signTransaction(transaction);

// Sign message
const signature = await walletStore.signMessage(message);

// Open wallet modal
walletStore.openWalletModal();
```

**State**:
- `wallet` - Current wallet adapter
- `publicKey` - User's Solana public key
- `connected` - Connection status
- `connecting` - Connection in progress
- `disconnecting` - Disconnection in progress
- `walletModalOpen` - Modal visibility
- `autoConnect` - Auto-connect preference

**Computed**:
- `walletName` - Current wallet name
- `walletIcon` - Wallet icon URL
- `publicKeyBase58` - Public key as base58 string
- `shortAddress` - Truncated address (e.g., "Abc1...Xyz9")

**Actions**:
- `connect(wallet)` - Connect to wallet
- `disconnect()` - Disconnect wallet
- `signTransaction(tx)` - Sign single transaction
- `signAllTransactions(txs)` - Sign multiple transactions
- `signMessage(message)` - Sign arbitrary message
- `openWalletModal()` - Open wallet selection modal
- `closeWalletModal()` - Close modal
- `setAutoConnect(enabled)` - Enable/disable auto-connect

---

### 3. Trading Store (`trading.ts`)
**Status**: 🏗️ Skeleton (M3 Phase 4)

Manages trading state and operations including:
- Position management
- Liquidity positions
- Trade execution
- Transaction tracking
- Portfolio summary

**Usage** (once implemented):
```typescript
import { useTradingStore } from '@/stores/trading';

const tradingStore = useTradingStore();

// Execute trade
const result = await tradingStore.executeTrade({
  marketId: 'market-123',
  marketPublicKey: new PublicKey('...'),
  outcomeIndex: 0,
  isBuy: true,
  amount: BigInt(10 * LAMPORTS_PER_USDC),
  maxSlippage: 1,
});

// Load positions
await tradingStore.loadPositions(walletPublicKey);

// Get portfolio summary
const summary = await tradingStore.getPositionSummary(walletPublicKey);
console.log('Total value:', summary.totalValue);
console.log('Total PnL:', summary.totalUnrealizedPnL);

// Add liquidity
await tradingStore.addLiquidity({
  marketId: 'market-123',
  marketPublicKey: new PublicKey('...'),
  amount: BigInt(100 * LAMPORTS_PER_USDC),
});

// Set active market
tradingStore.setActiveMarket('market-123');

// Refresh all data
await tradingStore.refresh(walletPublicKey);
```

**State**:
- `activeMarket` - Currently active market ID
- `positions` - User positions across all markets
- `liquidityPositions` - User liquidity positions
- `recentTrades` - Recent trades for active market
- `pendingTransactions` - Pending transaction tracking
- `loading` - Loading state
- `error` - Error state
- `lastRefresh` - Last refresh timestamp

**Computed**:
- `hasOpenPositions` - Whether user has positions
- `hasLiquidityPositions` - Whether user has LP positions
- `totalPortfolioValue` - Total value across all positions
- `totalUnrealizedPnL` - Total unrealized profit/loss
- `totalUnrealizedPnLPercentage` - PnL percentage
- `numActiveMarkets` - Number of markets with positions
- `activeMarketPositions` - Positions for active market
- `activeMarketLiquidityPosition` - LP position for active market
- `hasPendingTransactions` - Whether there are pending txs
- `pendingTransactionsArray` - Pending txs as array

**Actions**:
- `executeTrade(params)` - Execute buy/sell trade
- `addLiquidity(params)` - Add liquidity to market
- `removeLiquidity(params)` - Remove liquidity from market
- `loadPositions(wallet)` - Load user positions
- `loadRecentTrades(marketId)` - Load recent trades
- `getPositionSummary(wallet)` - Get portfolio summary
- `setActiveMarket(marketId)` - Set active market
- `addPendingTransaction(...)` - Track pending transaction
- `updateTransactionStatus(...)` - Update transaction status
- `clearPositions()` - Clear all positions
- `clearError()` - Clear error state
- `refresh(wallet)` - Refresh all data

**Implementation Status**:
- ✅ Complete type-safe API
- ✅ Full reactive state management
- ✅ Transaction tracking
- ✅ Error handling
- ⏳ TODO: Implement with SolanaProgramService once programs deployed

---

## Store Architecture

```
┌─────────────────────────────────────────────────────┐
│  Vue 3 Components                                   │
│  ┌────────────────┐  ┌──────────────────────────┐  │
│  │  AuthModal     │  │  WalletConnectButton     │  │
│  │  UserProfile   │  │  WalletModal             │  │
│  └────────┬───────┘  └──────────┬───────────────┘  │
│           │                     │                   │
│           ▼                     ▼                   │
│  ┌────────────────┐   ┌────────────────────────┐  │
│  │  Auth Store    │   │  Wallet Store          │  │
│  │  (Pinia)       │   │  (Pinia)               │  │
│  └────────────────┘   └────────┬───────────────┘  │
│                                 │                   │
│  ┌────────────────┐             │                   │
│  │  Trading       │◄────────────┘                   │
│  │  Components    │                                 │
│  └────────┬───────┘                                 │
│           │                                          │
│           ▼                                          │
│  ┌────────────────────────────────────────────────┐│
│  │  Trading Store (Pinia)                         ││
│  │  - Uses Wallet Store for signing              ││
│  │  - Manages positions and trades                ││
│  └────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## Usage Patterns

### 1. Store Composition

Stores can use other stores:

```typescript
import { useWalletStore } from './wallet';

export const useTradingStore = defineStore('trading', () => {
  const walletStore = useWalletStore();

  async function executeTrade(params) {
    // Check wallet connected
    if (!walletStore.connected) {
      throw new Error('Wallet not connected');
    }

    // Use wallet to sign transaction
    const signed = await walletStore.signTransaction(tx);

    // ...
  }

  return { executeTrade };
});
```

### 2. Reactive State in Components

```vue
<script setup lang="ts">
import { useWalletStore } from '@/stores/wallet';

const walletStore = useWalletStore();

// Reactive - auto-updates when store changes
const isConnected = computed(() => walletStore.connected);
const address = computed(() => walletStore.shortAddress);
</script>

<template>
  <div v-if="isConnected">
    Connected: {{ address }}
  </div>
  <button v-else @click="walletStore.openWalletModal()">
    Connect Wallet
  </button>
</template>
```

### 3. Error Handling

```typescript
const tradingStore = useTradingStore();

try {
  await tradingStore.executeTrade(params);
} catch (error) {
  if (tradingStore.error) {
    console.error('Error code:', tradingStore.error.code);
    console.error('Error message:', tradingStore.error.message);

    // Handle specific errors
    switch (tradingStore.error.code) {
      case TradingErrorCode.WALLET_NOT_CONNECTED:
        walletStore.openWalletModal();
        break;
      case TradingErrorCode.INSUFFICIENT_BALANCE:
        // Show insufficient balance error
        break;
      // ...
    }
  }
}
```

### 4. State Persistence

The wallet store automatically persists to LocalStorage:

```typescript
// Stored in localStorage:
// - walletName: Last connected wallet
// - autoConnect: Auto-connect preference

// Automatically restored on page load
const walletStore = useWalletStore();
// If previously connected, will auto-reconnect
```

---

## Best Practices

### 1. Keep Stores Focused

Each store should have a single responsibility:
- **Auth Store**: User authentication only
- **Wallet Store**: Wallet connection only
- **Trading Store**: Trading operations only

### 2. Use Computed Properties

Don't duplicate logic in components:

```typescript
// ❌ Bad - logic in component
const portfolioValue = computed(() => {
  return positions.value.reduce((sum, p) => sum + p.value, 0);
});

// ✅ Good - logic in store
const portfolioValue = computed(() => tradingStore.totalPortfolioValue);
```

### 3. Handle Errors Properly

Always handle errors from store actions:

```typescript
// ❌ Bad
await tradingStore.executeTrade(params);

// ✅ Good
try {
  await tradingStore.executeTrade(params);
} catch (error) {
  // Handle error
  showNotification('Trade failed', 'error');
}
```

### 4. Clear State When Appropriate

```typescript
// When user disconnects wallet
walletStore.$patch({
  wallet: null,
  publicKey: null,
  connected: false,
});

// Clear trading state
tradingStore.clearPositions();
```

---

## Testing Stores

### Unit Testing

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { useWalletStore } from '@/stores/wallet';

describe('Wallet Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with disconnected state', () => {
    const store = useWalletStore();
    expect(store.connected).toBe(false);
    expect(store.publicKey).toBeNull();
  });

  it('should connect to wallet', async () => {
    const store = useWalletStore();
    const mockWallet = createMockWallet();

    await store.connect(mockWallet);

    expect(store.connected).toBe(true);
    expect(store.wallet).toBe(mockWallet);
  });
});
```

---

## Migration Guide

### From Local State to Store

**Before** (local component state):
```vue
<script setup>
const wallet = ref(null);
const connected = ref(false);

async function connect() {
  // connection logic
  connected.value = true;
}
</script>
```

**After** (using store):
```vue
<script setup>
import { useWalletStore } from '@/stores/wallet';

const walletStore = useWalletStore();

async function connect() {
  await walletStore.connect(walletAdapter);
}
</script>
```

---

## Documentation

For detailed documentation on each store:
- **Wallet Store**: See `docs/WALLET-INTEGRATION-IMPLEMENTATION.md`
- **Trading Store**: See `docs/PHASE-4-TRADING-INTERFACE-PLAN.md`
- **Auth Store**: See `docs/INTEGRATION.md` (M2)

---

**Last Updated**: November 24, 2025
