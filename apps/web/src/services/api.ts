/**
 * API service functions for Mentat Protocol backend
 * Replaces mockApi.ts with real backend calls
 */
import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { adaptMarketListItem, adaptMarketDetail } from './adapters';
import type {
  MarketSummary,
  MarketDetail as FrontendMarketDetail,
  ProofJob,
  CreatorMetric,
} from '@/types';
import type {
  MarketListItem,
  MarketDetail,
  DraftListItem,
  DraftDetail,
} from '@/types/api';

// ============================================================================
// Markets API
// ============================================================================

export interface MarketListParams {
  state?: string;
  tags?: string;
  search?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export async function fetchMarkets(params?: MarketListParams): Promise<MarketListItem[]> {
  const response = await apiClient.get<MarketListItem[]>(API_ENDPOINTS.MARKETS_LIST, {
    params,
  });
  return response.data;
}

export async function fetchActiveMarkets(): Promise<MarketSummary[]> {
  const markets = await fetchMarkets({ state: 'active', limit: 50 });
  return markets.map(adaptMarketListItem);
}

export async function fetchFeaturedMarkets(): Promise<MarketSummary[]> {
  // Featured markets are those with high volume (top 3)
  const markets = await fetchMarkets({ sort_by: 'total_volume', order: 'desc', limit: 3 });
  return markets.map((m) => ({ ...adaptMarketListItem(m), featured: true }));
}

export async function fetchMarketDetail(id: string): Promise<FrontendMarketDetail | undefined> {
  try {
    const response = await apiClient.get<MarketDetail>(API_ENDPOINTS.MARKETS_DETAIL(id));
    return adaptMarketDetail(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return undefined;
    }
    throw error;
  }
}

// ============================================================================
// Drafts API
// ============================================================================

export interface DraftListParams {
  status?: string;
  limit?: number;
  offset?: number;
}

export async function fetchDrafts(params?: DraftListParams): Promise<DraftListItem[]> {
  const response = await apiClient.get<DraftListItem[]>(API_ENDPOINTS.DRAFTS_LIST, {
    params,
  });
  return response.data;
}

export async function submitDraft(id: string): Promise<DraftDetail> {
  const response = await apiClient.post<DraftDetail>(API_ENDPOINTS.DRAFTS_SUBMIT(id));
  return response.data;
}

// ============================================================================
// Legacy compatibility helpers
// ============================================================================

// These functions provide compatibility with the old mockApi interface
// They transform the new API types to match the old frontend expectations

export async function fetchProofJobs(): Promise<ProofJob[]> {
  // MOCK: Example data showing proof job interface
  // TODO: Replace with actual backend endpoint /api/v1/proofs/jobs when implemented
  return [
    {
      marketId: 'btc_100k_2025',
      question: 'Will Bitcoin reach $100,000 by December 31, 2025?',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      bounty: 50,
      status: 'pending',
      source: 'https://coinmarketcap.com/currencies/bitcoin/'
    },
    {
      marketId: 'eth_tps_5000',
      question: 'Will Ethereum exceed 5,000 transactions per second in 2025?',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      bounty: 75,
      status: 'in_progress',
      source: 'https://etherscan.io/chart/tx'
    },
    {
      marketId: 'sol_uptime_30d',
      question: 'Will Solana network have zero outages for 30 consecutive days?',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      bounty: 100,
      status: 'pending',
      source: 'https://status.solana.com'
    },
    {
      marketId: 'ai_agi_2025',
      question: 'Will any AI system pass the Turing test by end of 2025?',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      bounty: 150,
      status: 'pending',
      source: 'https://openai.com/research'
    }
  ];
}

export async function fetchCreatorMetrics(): Promise<CreatorMetric[]> {
  // BLOCKED: Backend endpoint /api/v1/creator/metrics not yet implemented
  // Returns placeholder data until backend adds analytics
  return [
    {
      title: 'Markets launched (30d)',
      value: '0',
      delta: 0,
      deltaLabel: 'vs. prior 30d',
    },
    {
      title: 'Approval rate',
      value: '0%',
      delta: 0,
      deltaLabel: 'higher than target',
    },
    {
      title: 'Avg resolution time',
      value: '--',
      delta: 0,
      deltaLabel: 'vs. SLA',
    },
    {
      title: 'Fees earned',
      value: '0 USDC',
      delta: 0,
      deltaLabel: 'vs. last month',
    },
  ];
}

// Temporary wrapper for draft queue compatibility
export async function fetchDraftQueue(): Promise<DraftListItem[]> {
  return fetchDrafts();
}
