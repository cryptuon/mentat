export type MarketState =
  | 'draft'
  | 'pending'
  | 'active'
  | 'locked'
  | 'resolved'
  | 'invalid'
  | 'disputed';

export interface Outcome {
  id: string;
  label: string;
  probability: number;
  price: number;
}

export interface MarketSummary {
  id: string;
  question: string;
  summary: string;
  state: MarketState;
  category: string[];
  creator: string;
  volume24h: number;
  totalVolume: number;
  openInterest: number;
  resolutionDeadline: string;
  proofSlaMinutes: number;
  oddsChange: number;
  featured?: boolean;
  outcomes: Outcome[];
}

export interface MarketDetail extends MarketSummary {
  aiRationale: string;
  resolutionCriteria: {
    primarySources: string[];
    triggerLogic: string;
    fallbackLogic: string;
    invalidationClause: string;
  };
  feeBreakdown: {
    tradingFee: number;
    creatorShare: number;
    treasuryShare: number;
    lpShare: number;
    settlementFee: number;
  };
  timeline: {
    createdAt: string;
    openAt: string;
    lockAt?: string;
    resolutionDeadline: string;
    disputeWindowHours: number;
  };
  liquidity: {
    poolSize: number;
    yesShares: number;
    noShares: number;
    apy: number;
  };
  proofStatus: {
    status: 'awaiting' | 'submitted' | 'verified' | 'disputed';
    submittedAt?: string;
    proofHash?: string;
    verifier?: string;
  };
  priceHistory: Array<{
    timestamp: string;
    yesPrice: number;
    noPrice: number;
    volume: number;
    liquidity: number;
  }>;
  social: {
    watchers: number;
    boosts: number;
    shares: number;
    comments: number;
    topBackers: string[];
    threads: Array<{
      id: string;
      author: string;
      avatar?: string;
      body: string;
      postedAt: string;
      reactions: number;
    }>;
  };
}

export interface DraftSummary {
  id: string;
  topic: string;
  sentiment: string;
  confidence: number;
  createdAt: string;
  lastUpdated: string;
  status: 'needs_review' | 'changes_requested' | 'approved';
}

export interface DraftDetail extends DraftSummary {
  question: string;
  aiNotes: string;
  validationFindings: string[];
  resolutionSuggestion: string;
  economics: {
    tradingFee: number;
    creatorStake: number;
    proofBounty: number;
  };
  tags: string[];
  timeline: {
    proposedOpen: string;
    resolutionDeadline: string;
  };
}

export interface ProofJob {
  marketId: string;
  question: string;
  deadline: string;
  bounty: number;
  status: 'pending' | 'in_progress' | 'submitted';
  source: string;
}

export interface CreatorMetric {
  title: string;
  value: string;
  delta: number;
  deltaLabel: string;
}
