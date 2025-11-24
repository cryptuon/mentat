import { PublicKey } from '@solana/web3.js';

/**
 * Market Factory Events
 */

export interface MarketCreatedEvent {
  marketId: bigint;
  market: PublicKey;
  creator: PublicKey;
  questionText: string;
  numOutcomes: number;
  tradingFeeBps: number;
  resolutionDeadline: bigint;
  timestamp: bigint;
}

export interface LiquidityAddedEvent {
  market: PublicKey;
  provider: PublicKey;
  amount: bigint;
  lpTokensMinted: bigint;
  timestamp: bigint;
}

export interface LiquidityRemovedEvent {
  market: PublicKey;
  provider: PublicKey;
  lpTokensBurned: bigint;
  amountReceived: bigint;
  timestamp: bigint;
}

export interface TradeExecutedEvent {
  market: PublicKey;
  trader: PublicKey;
  outcomeIndex: number;
  isBuy: boolean;
  amount: bigint;
  price: bigint;
  fee: bigint;
  shares: bigint;
  timestamp: bigint;
}

export interface MarketStateChangedEvent {
  market: PublicKey;
  oldState: string;
  newState: string;
  authority: PublicKey;
  timestamp: bigint;
}

export interface MarketResolvedEvent {
  market: PublicKey;
  winningOutcome: number;
  resolver: PublicKey;
  timestamp: bigint;
}

export interface MarketClosedEvent {
  market: PublicKey;
  creator: PublicKey;
  feesWithdrawn: bigint;
  totalVolume: bigint;
  totalTrades: bigint;
  timestamp: bigint;
}

export interface FeesWithdrawnEvent {
  market: PublicKey;
  recipient: PublicKey;
  amount: bigint;
  timestamp: bigint;
}

/**
 * Market Settlement Events
 */

export interface ProofSubmittedEvent {
  market: PublicKey;
  proofId: bigint;
  submitter: PublicKey;
  outcomeIndex: number;
  proofData: string;
  timestamp: bigint;
}

export interface ProofVerifiedEvent {
  market: PublicKey;
  proofId: bigint;
  verifier: PublicKey;
  isValid: boolean;
  timestamp: bigint;
}

export interface SettlementMarketResolvedEvent {
  market: PublicKey;
  resolver: PublicKey;
  winningOutcome: number;
  totalPayout: bigint;
  settlementDeadline: bigint;
  timestamp: bigint;
}

export interface PayoutClaimedEvent {
  market: PublicKey;
  claimer: PublicKey;
  position: PublicKey;
  amountClaimed: bigint;
  sharesUsed: bigint;
  timestamp: bigint;
}

export interface DisputeOpenedEvent {
  market: PublicKey;
  disputeId: bigint;
  disputer: PublicKey;
  originalOutcome: number;
  proposedOutcome: number;
  stakeAmount: bigint;
  reason: string;
  timestamp: bigint;
}

export interface DisputeResolvedEvent {
  market: PublicKey;
  disputeId: bigint;
  resolver: PublicKey;
  resolution: string;
  finalOutcome: number;
  timestamp: bigint;
}

/**
 * Union type of all events
 */
export type SolanaEvent =
  | MarketCreatedEvent
  | LiquidityAddedEvent
  | LiquidityRemovedEvent
  | TradeExecutedEvent
  | MarketStateChangedEvent
  | MarketResolvedEvent
  | MarketClosedEvent
  | FeesWithdrawnEvent
  | ProofSubmittedEvent
  | ProofVerifiedEvent
  | SettlementMarketResolvedEvent
  | PayoutClaimedEvent
  | DisputeOpenedEvent
  | DisputeResolvedEvent;

/**
 * Event type enum for discriminated unions
 */
export enum EventType {
  MarketCreated = 'MarketCreated',
  LiquidityAdded = 'LiquidityAdded',
  LiquidityRemoved = 'LiquidityRemoved',
  TradeExecuted = 'TradeExecuted',
  MarketStateChanged = 'MarketStateChanged',
  MarketResolved = 'MarketResolved',
  MarketClosed = 'MarketClosed',
  FeesWithdrawn = 'FeesWithdrawn',
  ProofSubmitted = 'ProofSubmitted',
  ProofVerified = 'ProofVerified',
  SettlementMarketResolved = 'SettlementMarketResolved',
  PayoutClaimed = 'PayoutClaimed',
  DisputeOpened = 'DisputeOpened',
  DisputeResolved = 'DisputeResolved',
}

/**
 * Parsed event with metadata
 */
export interface ParsedEvent {
  type: EventType;
  data: SolanaEvent;
  signature: string;
  slot: number;
  blockTime: number | null;
}
