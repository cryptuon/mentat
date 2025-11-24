import { PublicKey } from '@solana/web3.js';

/**
 * Trading type definitions for Mentat Protocol
 *
 * These types define the core trading data structures used across
 * the trading interface components and services.
 */

// ============================================================================
// Market Types
// ============================================================================

export interface Market {
  id: string;
  publicKey: PublicKey;
  creator: PublicKey;
  questionText: string;
  category: string;
  numOutcomes: number;
  state: MarketState;
  liquidity: bigint;
  tradingFeeBps: number;
  resolutionDeadline: Date;
  createdAt: Date;
  outcomes: Outcome[];
}

export enum MarketState {
  OPEN = 'open',
  LOCKED = 'locked',
  RESOLVED = 'resolved',
  DISPUTED = 'disputed',
  INVALID = 'invalid',
  CLOSED = 'closed',
}

export interface Outcome {
  index: number;
  label: string;
  currentPrice: number; // Price in USDC
  probability: number; // Implied probability (0-100)
  totalShares: bigint;
  liquidity: bigint;
}

// ============================================================================
// Trading Types
// ============================================================================

export interface TradeParams {
  marketId: string;
  marketPublicKey: PublicKey;
  outcomeIndex: number;
  isBuy: boolean;
  amount: bigint; // Amount in lamports (USDC)
  maxSlippage: number; // Maximum slippage percentage (0-100)
  priorityFee?: number; // Optional priority fee in microlamports
}

export interface TradeResult {
  signature: string;
  marketId: string;
  outcomeIndex: number;
  isBuy: boolean;
  amount: bigint;
  shares: bigint;
  price: bigint;
  fee: bigint;
  timestamp: Date;
}

export interface TradeEstimate {
  expectedShares: bigint;
  expectedPrice: number;
  priceImpact: number; // Percentage
  tradingFee: bigint;
  totalCost: bigint;
  minShares: bigint; // Minimum shares accounting for slippage
}

// ============================================================================
// Position Types
// ============================================================================

export interface Position {
  marketId: string;
  marketPublicKey: PublicKey;
  outcomeIndex: number;
  outcomeLabel: string;
  shares: bigint;
  avgEntryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercentage: number;
  currentValue: bigint;
  investedAmount: bigint;
}

export interface PositionSummary {
  totalValue: bigint;
  totalInvested: bigint;
  totalUnrealizedPnL: number;
  totalUnrealizedPnLPercentage: number;
  positions: Position[];
  numPositions: number;
}

export interface PositionSnapshot {
  timestamp: Date;
  shares: bigint;
  price: number;
  value: bigint;
  pnl: number;
}

// ============================================================================
// Liquidity Types
// ============================================================================

export interface LiquidityParams {
  marketId: string;
  marketPublicKey: PublicKey;
  amount: bigint; // Amount in lamports (USDC)
  priorityFee?: number;
}

export interface RemoveLiquidityParams {
  marketId: string;
  marketPublicKey: PublicKey;
  lpTokens: bigint; // Amount of LP tokens to burn
  priorityFee?: number;
}

export interface LiquidityResult {
  signature: string;
  marketId: string;
  amount: bigint;
  lpTokens: bigint;
  timestamp: Date;
}

export interface LiquidityPosition {
  marketId: string;
  marketPublicKey: PublicKey;
  lpTokens: bigint;
  poolShare: number; // Percentage of pool owned
  currentValue: bigint;
  investedAmount: bigint;
  unrealizedPnL: number;
  feesEarned: bigint;
  apy: number; // Estimated APY
}

// ============================================================================
// Order Book Types
// ============================================================================

export interface Trade {
  signature: string;
  marketId: string;
  trader: PublicKey;
  outcomeIndex: number;
  isBuy: boolean;
  amount: bigint;
  price: bigint;
  shares: bigint;
  fee: bigint;
  timestamp: Date;
}

export interface OrderLevel {
  price: number;
  volume: bigint;
  numOrders: number;
}

export interface OrderBook {
  marketId: string;
  buyOrders: OrderLevel[];
  sellOrders: OrderLevel[];
  recentTrades: Trade[];
  spread: number;
  midPrice: number;
}

// ============================================================================
// Portfolio Types
// ============================================================================

export interface Portfolio {
  walletAddress: PublicKey;
  totalValue: bigint;
  totalInvested: bigint;
  totalPnL: number;
  totalPnLPercentage: number;
  positions: Position[];
  liquidityPositions: LiquidityPosition[];
  numMarkets: number;
  numWins: number;
  numLosses: number;
  winRate: number;
}

export interface PortfolioSnapshot {
  timestamp: Date;
  totalValue: bigint;
  totalPnL: number;
  numPositions: number;
}

// ============================================================================
// Transaction Types
// ============================================================================

export interface PendingTransaction {
  signature: string;
  type: TransactionType;
  marketId: string;
  status: TransactionStatus;
  timestamp: Date;
  error?: string;
}

export enum TransactionType {
  TRADE = 'trade',
  ADD_LIQUIDITY = 'add_liquidity',
  REMOVE_LIQUIDITY = 'remove_liquidity',
  CLAIM_WINNINGS = 'claim_winnings',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

// ============================================================================
// Error Types
// ============================================================================

export interface TradingError {
  code: TradingErrorCode;
  message: string;
  details?: any;
}

export enum TradingErrorCode {
  WALLET_NOT_CONNECTED = 'wallet_not_connected',
  INSUFFICIENT_BALANCE = 'insufficient_balance',
  SLIPPAGE_EXCEEDED = 'slippage_exceeded',
  MARKET_CLOSED = 'market_closed',
  MARKET_LOCKED = 'market_locked',
  INVALID_AMOUNT = 'invalid_amount',
  TRANSACTION_FAILED = 'transaction_failed',
  SIMULATION_FAILED = 'simulation_failed',
  PROGRAM_ERROR = 'program_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error',
}

// ============================================================================
// UI Types
// ============================================================================

export interface TradeFormData {
  outcomeIndex: number;
  isBuy: boolean;
  amount: string; // String for input binding
  maxSlippage: number;
}

export interface LiquidityFormData {
  amount: string; // String for input binding
}

export interface RemoveLiquidityFormData {
  lpTokens: string; // String for input binding
  percentage: number; // Percentage of LP tokens to remove (0-100)
}

// ============================================================================
// Constants
// ============================================================================

export const USDC_DECIMALS = 6;
export const LAMPORTS_PER_USDC = 10 ** USDC_DECIMALS;
export const DEFAULT_SLIPPAGE = 1; // 1%
export const MAX_SLIPPAGE = 10; // 10%
export const DEFAULT_PRIORITY_FEE = 5000; // 5000 microlamports

// ============================================================================
// Utility Types
// ============================================================================

export interface PriceCalculation {
  currentPrice: number;
  newPrice: number;
  priceImpact: number;
  averagePrice: number;
}

export interface FeeBreakdown {
  tradingFee: bigint;
  lpShare: bigint;
  creatorShare: bigint;
  treasuryShare: bigint;
}

export interface SlippageCheck {
  expectedPrice: number;
  actualPrice: number;
  slippage: number;
  withinTolerance: boolean;
}
