import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PublicKey } from '@solana/web3.js';
import type {
  Position,
  PositionSummary,
  Trade,
  TradeParams,
  TradeResult,
  LiquidityParams,
  LiquidityPosition,
  RemoveLiquidityParams,
  PendingTransaction,
  TransactionType,
  TransactionStatus,
  TradingError,
  TradingErrorCode,
} from '@/types/trading';

/**
 * Trading Store
 *
 * Manages trading state, positions, and transactions for the Mentat Protocol.
 * This store handles all trading operations including:
 * - Executing trades
 * - Managing positions
 * - Adding/removing liquidity
 * - Tracking pending transactions
 * - Portfolio management
 *
 * Usage:
 * ```typescript
 * import { useTradingStore } from '@/stores/trading';
 *
 * const tradingStore = useTradingStore();
 * await tradingStore.executeTrade(params);
 * ```
 */
export const useTradingStore = defineStore('trading', () => {
  // ============================================================================
  // State
  // ============================================================================

  /**
   * Currently active market ID
   */
  const activeMarket = ref<string | null>(null);

  /**
   * User positions across all markets
   */
  const positions = ref<Position[]>([]);

  /**
   * User liquidity positions across all markets
   */
  const liquidityPositions = ref<LiquidityPosition[]>([]);

  /**
   * Recent trades for the active market
   */
  const recentTrades = ref<Trade[]>([]);

  /**
   * Pending transactions
   */
  const pendingTransactions = ref<Map<string, PendingTransaction>>(new Map());

  /**
   * Loading state
   */
  const loading = ref(false);

  /**
   * Error state
   */
  const error = ref<TradingError | null>(null);

  /**
   * Last refresh timestamp
   */
  const lastRefresh = ref<Date | null>(null);

  // ============================================================================
  // Computed Properties
  // ============================================================================

  /**
   * Check if user has any open positions
   */
  const hasOpenPositions = computed(() => positions.value.length > 0);

  /**
   * Check if user has any liquidity positions
   */
  const hasLiquidityPositions = computed(() => liquidityPositions.value.length > 0);

  /**
   * Total portfolio value in USDC
   */
  const totalPortfolioValue = computed(() => {
    const positionValue = positions.value.reduce(
      (sum, pos) => sum + Number(pos.currentValue),
      0
    );
    const liquidityValue = liquidityPositions.value.reduce(
      (sum, pos) => sum + Number(pos.currentValue),
      0
    );
    return positionValue + liquidityValue;
  });

  /**
   * Total unrealized PnL across all positions
   */
  const totalUnrealizedPnL = computed(() => {
    const positionPnL = positions.value.reduce(
      (sum, pos) => sum + pos.unrealizedPnL,
      0
    );
    const liquidityPnL = liquidityPositions.value.reduce(
      (sum, pos) => sum + pos.unrealizedPnL,
      0
    );
    return positionPnL + liquidityPnL;
  });

  /**
   * Total unrealized PnL percentage
   */
  const totalUnrealizedPnLPercentage = computed(() => {
    const totalInvested = positions.value.reduce(
      (sum, pos) => sum + Number(pos.investedAmount),
      0
    ) + liquidityPositions.value.reduce(
      (sum, pos) => sum + Number(pos.investedAmount),
      0
    );

    if (totalInvested === 0) return 0;
    return (totalUnrealizedPnL.value / totalInvested) * 100;
  });

  /**
   * Number of active markets with positions
   */
  const numActiveMarkets = computed(() => {
    const marketIds = new Set([
      ...positions.value.map(p => p.marketId),
      ...liquidityPositions.value.map(p => p.marketId),
    ]);
    return marketIds.size;
  });

  /**
   * Get positions for the active market
   */
  const activeMarketPositions = computed(() => {
    if (!activeMarket.value) return [];
    return positions.value.filter(p => p.marketId === activeMarket.value);
  });

  /**
   * Get liquidity position for the active market
   */
  const activeMarketLiquidityPosition = computed(() => {
    if (!activeMarket.value) return null;
    return liquidityPositions.value.find(p => p.marketId === activeMarket.value) || null;
  });

  /**
   * Check if there are any pending transactions
   */
  const hasPendingTransactions = computed(() => pendingTransactions.value.size > 0);

  /**
   * Get pending transactions as array
   */
  const pendingTransactionsArray = computed(() =>
    Array.from(pendingTransactions.value.values())
  );

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Execute a trade (buy or sell outcome shares)
   *
   * @param params - Trade parameters
   * @returns Trade result with transaction signature
   *
   * @example
   * ```typescript
   * const result = await tradingStore.executeTrade({
   *   marketId: 'market-123',
   *   marketPublicKey: new PublicKey('...'),
   *   outcomeIndex: 0,
   *   isBuy: true,
   *   amount: BigInt(10 * LAMPORTS_PER_USDC),
   *   maxSlippage: 1,
   * });
   * console.log('Trade signature:', result.signature);
   * ```
   */
  async function executeTrade(params: TradeParams): Promise<TradeResult> {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Implement trade execution using SolanaProgramService
      // This will be implemented once Solana programs are deployed

      // 1. Build transaction
      // 2. Sign with wallet
      // 3. Send transaction
      // 4. Wait for confirmation
      // 5. Update positions
      // 6. Return result

      throw new Error('Trade execution not yet implemented - waiting for Solana programs');
    } catch (err) {
      console.error('Trade execution failed:', err);
      error.value = {
        code: TradingErrorCode.TRANSACTION_FAILED,
        message: err instanceof Error ? err.message : 'Trade execution failed',
        details: err,
      };
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Add liquidity to a market
   *
   * @param params - Liquidity parameters
   * @returns Transaction signature
   */
  async function addLiquidity(params: LiquidityParams): Promise<string> {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Implement add liquidity using SolanaProgramService
      throw new Error('Add liquidity not yet implemented - waiting for Solana programs');
    } catch (err) {
      console.error('Add liquidity failed:', err);
      error.value = {
        code: TradingErrorCode.TRANSACTION_FAILED,
        message: err instanceof Error ? err.message : 'Add liquidity failed',
        details: err,
      };
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Remove liquidity from a market
   *
   * @param params - Remove liquidity parameters
   * @returns Transaction signature
   */
  async function removeLiquidity(params: RemoveLiquidityParams): Promise<string> {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Implement remove liquidity using SolanaProgramService
      throw new Error('Remove liquidity not yet implemented - waiting for Solana programs');
    } catch (err) {
      console.error('Remove liquidity failed:', err);
      error.value = {
        code: TradingErrorCode.TRANSACTION_FAILED,
        message: err instanceof Error ? err.message : 'Remove liquidity failed',
        details: err,
      };
      throw error.value;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Load user positions for a specific wallet
   *
   * @param walletAddress - User's wallet public key
   */
  async function loadPositions(walletAddress: PublicKey): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Implement position loading using SolanaProgramService
      // This will fetch on-chain position data

      // For now, clear positions
      positions.value = [];
      liquidityPositions.value = [];
      lastRefresh.value = new Date();
    } catch (err) {
      console.error('Load positions failed:', err);
      error.value = {
        code: TradingErrorCode.UNKNOWN_ERROR,
        message: err instanceof Error ? err.message : 'Failed to load positions',
        details: err,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Load recent trades for a specific market
   *
   * @param marketId - Market ID
   */
  async function loadRecentTrades(marketId: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Implement using indexer service
      // Fetch recent trades from the event indexer

      recentTrades.value = [];
    } catch (err) {
      console.error('Load recent trades failed:', err);
      error.value = {
        code: TradingErrorCode.UNKNOWN_ERROR,
        message: err instanceof Error ? err.message : 'Failed to load recent trades',
        details: err,
      };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get position summary for a wallet
   *
   * @param walletAddress - User's wallet public key
   * @returns Position summary with totals
   */
  async function getPositionSummary(walletAddress: PublicKey): Promise<PositionSummary> {
    await loadPositions(walletAddress);

    const totalValue = BigInt(totalPortfolioValue.value);
    const totalInvested = positions.value.reduce(
      (sum, pos) => sum + pos.investedAmount,
      BigInt(0)
    );

    return {
      totalValue,
      totalInvested,
      totalUnrealizedPnL: totalUnrealizedPnL.value,
      totalUnrealizedPnLPercentage: totalUnrealizedPnLPercentage.value,
      positions: positions.value,
      numPositions: positions.value.length,
    };
  }

  /**
   * Set the active market
   *
   * @param marketId - Market ID to set as active
   */
  function setActiveMarket(marketId: string | null): void {
    activeMarket.value = marketId;
    if (marketId) {
      loadRecentTrades(marketId);
    }
  }

  /**
   * Add a pending transaction
   *
   * @param signature - Transaction signature
   * @param type - Transaction type
   * @param marketId - Market ID
   */
  function addPendingTransaction(
    signature: string,
    type: TransactionType,
    marketId: string
  ): void {
    pendingTransactions.value.set(signature, {
      signature,
      type,
      marketId,
      status: TransactionStatus.PENDING,
      timestamp: new Date(),
    });
  }

  /**
   * Update transaction status
   *
   * @param signature - Transaction signature
   * @param status - New status
   * @param error - Optional error message
   */
  function updateTransactionStatus(
    signature: string,
    status: TransactionStatus,
    error?: string
  ): void {
    const tx = pendingTransactions.value.get(signature);
    if (tx) {
      tx.status = status;
      if (error) {
        tx.error = error;
      }

      // Remove completed or failed transactions after a delay
      if (status === TransactionStatus.CONFIRMED || status === TransactionStatus.FAILED) {
        setTimeout(() => {
          pendingTransactions.value.delete(signature);
        }, 5000); // Remove after 5 seconds
      }
    }
  }

  /**
   * Clear all positions
   */
  function clearPositions(): void {
    positions.value = [];
    liquidityPositions.value = [];
    recentTrades.value = [];
    lastRefresh.value = null;
  }

  /**
   * Clear error state
   */
  function clearError(): void {
    error.value = null;
  }

  /**
   * Refresh all data for active market and wallet
   *
   * @param walletAddress - User's wallet public key
   */
  async function refresh(walletAddress: PublicKey): Promise<void> {
    await loadPositions(walletAddress);
    if (activeMarket.value) {
      await loadRecentTrades(activeMarket.value);
    }
  }

  // ============================================================================
  // Return Store
  // ============================================================================

  return {
    // State
    activeMarket,
    positions,
    liquidityPositions,
    recentTrades,
    pendingTransactions,
    loading,
    error,
    lastRefresh,

    // Computed
    hasOpenPositions,
    hasLiquidityPositions,
    totalPortfolioValue,
    totalUnrealizedPnL,
    totalUnrealizedPnLPercentage,
    numActiveMarkets,
    activeMarketPositions,
    activeMarketLiquidityPosition,
    hasPendingTransactions,
    pendingTransactionsArray,

    // Actions
    executeTrade,
    addLiquidity,
    removeLiquidity,
    loadPositions,
    loadRecentTrades,
    getPositionSummary,
    setActiveMarket,
    addPendingTransaction,
    updateTransactionStatus,
    clearPositions,
    clearError,
    refresh,
  };
});
