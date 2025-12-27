/**
 * Adapters to transform backend API types to frontend types
 *
 * Note: Some fields use placeholder values until backend API is enhanced.
 * These are marked with comments and will be replaced once backend provides:
 * - 24-hour volume tracking
 * - Real-time APY calculations
 * - Historical price data
 * - Social engagement metrics
 */
import type { MarketListItem, MarketDetail as ApiMarketDetail } from '@/types/api';
import type { MarketSummary, MarketDetail, Outcome } from '@/types';

/**
 * Transform API market list item to frontend MarketSummary
 */
export function adaptMarketListItem(apiMarket: MarketListItem): MarketSummary {
  return {
    id: apiMarket.id,
    question: apiMarket.question_text,
    summary: apiMarket.summary || '',
    state: apiMarket.state as any, // States match
    category: apiMarket.topic_tags,
    creator: apiMarket.creator_wallet,
    volume24h: apiMarket.total_volume, // PLACEHOLDER: Using total volume until backend adds 24h tracking
    totalVolume: apiMarket.total_volume,
    openInterest: apiMarket.total_liquidity,
    resolutionDeadline: apiMarket.resolution_deadline || '',
    proofSlaMinutes: 60, // PLACEHOLDER: Default 60 min until backend adds proof_sla_minutes field
    oddsChange: 0, // PLACEHOLDER: Need price history endpoint to calculate
    featured: false, // Will be set by caller (fetchFeaturedMarkets)
    outcomes: apiMarket.outcomes.map(adaptOutcome),
  };
}

/**
 * Transform API market detail to frontend MarketDetail
 */
export function adaptMarketDetail(apiMarket: ApiMarketDetail): MarketDetail {
  const baseMarket = adaptMarketListItem({
    id: apiMarket.id,
    market_id: apiMarket.market_id,
    question_text: apiMarket.question_text,
    summary: apiMarket.summary,
    topic_tags: apiMarket.topic_tags,
    state: apiMarket.state,
    outcomes: apiMarket.outcomes,
    total_volume: apiMarket.total_volume,
    total_liquidity: apiMarket.total_liquidity,
    unique_traders: apiMarket.unique_traders,
    created_at: apiMarket.created_at,
    resolution_deadline: apiMarket.resolution_deadline,
    creator_wallet: apiMarket.creator_wallet,
  });

  return {
    ...baseMarket,
    aiRationale: apiMarket.ai_rationale || '',
    resolutionCriteria: {
      primarySources: apiMarket.primary_sources,
      triggerLogic: apiMarket.trigger_condition || '',
      fallbackLogic: apiMarket.fallback_logic || '',
      invalidationClause: apiMarket.invalidation_clause || '',
    },
    feeBreakdown: {
      tradingFee: apiMarket.trading_fee_bps / 100, // Convert bps to percentage
      creatorShare: apiMarket.fee_split_creator_bps / 100,
      treasuryShare: apiMarket.fee_split_treasury_bps / 100,
      lpShare: apiMarket.fee_split_lp_bps / 100,
      settlementFee: apiMarket.settlement_fee_bps / 100,
    },
    timeline: {
      createdAt: apiMarket.created_at,
      openAt: apiMarket.open_at || apiMarket.created_at,
      lockAt: apiMarket.lock_at,
      resolutionDeadline: apiMarket.resolution_deadline || '',
      disputeWindowHours: apiMarket.dispute_window_hours,
    },
    liquidity: {
      poolSize: apiMarket.total_liquidity,
      yesShares: apiMarket.total_liquidity / 2, // PLACEHOLDER: Equal split until backend adds outcome shares
      noShares: apiMarket.total_liquidity / 2,
      apy: 12.5, // PLACEHOLDER: Static 12.5% until backend adds APY calculation
    },
    proofStatus: {
      status: apiMarket.state === 'resolved' ? 'verified' : 'awaiting',
      submittedAt: apiMarket.resolved_at,
      proofHash: apiMarket.on_chain_address,
      verifier: undefined,
    },
    priceHistory: [], // BLOCKED: Need backend price history endpoint
    social: {
      watchers: 0,
      boosts: 0,
      shares: 0,
      comments: 0,
      topBackers: [],
      threads: [],
    },
  };
}

/**
 * Transform API outcome to frontend Outcome
 */
function adaptOutcome(apiOutcome: any): Outcome {
  return {
    id: apiOutcome.id,
    label: apiOutcome.label,
    probability: apiOutcome.current_probability,
    price: apiOutcome.current_price,
  };
}
