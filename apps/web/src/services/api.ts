/**
 * API service functions for Mentat Protocol backend
 * Replaces mockApi.ts with real backend calls
 */
import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api';
import { adaptMarketListItem, adaptMarketDetail } from './adapters';
import type { MarketSummary, MarketDetail as FrontendMarketDetail } from '@/types';
import type {
  MarketListItem,
  MarketDetail,
  DraftListItem,
  DraftDetail,
  DraftCreateRequest,
  DraftUpdateRequest,
  CurationAction,
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

export async function fetchUserMarkets(walletAddress: string): Promise<MarketListItem[]> {
  const response = await apiClient.get<MarketListItem[]>(
    API_ENDPOINTS.MARKETS_USER(walletAddress)
  );
  return response.data;
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

export async function fetchDraftDetail(id: string): Promise<DraftDetail> {
  const response = await apiClient.get<DraftDetail>(API_ENDPOINTS.DRAFTS_DETAIL(id));
  return response.data;
}

export async function createDraft(data: DraftCreateRequest): Promise<DraftDetail> {
  const response = await apiClient.post<DraftDetail>(API_ENDPOINTS.DRAFTS_CREATE, data);
  return response.data;
}

export async function updateDraft(id: string, data: DraftUpdateRequest): Promise<DraftDetail> {
  const response = await apiClient.patch<DraftDetail>(API_ENDPOINTS.DRAFTS_UPDATE(id), data);
  return response.data;
}

export async function submitDraft(id: string): Promise<DraftDetail> {
  const response = await apiClient.post<DraftDetail>(API_ENDPOINTS.DRAFTS_SUBMIT(id));
  return response.data;
}

// ============================================================================
// Curator API
// ============================================================================

export interface CuratorQueueParams {
  status?: string;
  assigned_to_me?: boolean;
  limit?: number;
  offset?: number;
}

export async function fetchCuratorQueue(params?: CuratorQueueParams): Promise<DraftListItem[]> {
  const response = await apiClient.get<DraftListItem[]>(API_ENDPOINTS.CURATOR_QUEUE, {
    params,
  });
  return response.data;
}

export async function claimDraft(id: string): Promise<DraftDetail> {
  const response = await apiClient.post<DraftDetail>(API_ENDPOINTS.CURATOR_CLAIM(id));
  return response.data;
}

export async function approveDraft(
  id: string,
  data: { curator_notes?: string; deploy_immediately?: boolean }
): Promise<DraftDetail> {
  const response = await apiClient.post<DraftDetail>(API_ENDPOINTS.CURATOR_APPROVE(id), data);
  return response.data;
}

export async function requestChanges(
  id: string,
  data: { requested_changes: Record<string, any>; curator_notes: string }
): Promise<DraftDetail> {
  const response = await apiClient.post<DraftDetail>(
    API_ENDPOINTS.CURATOR_REQUEST_CHANGES(id),
    data
  );
  return response.data;
}

export async function rejectDraft(id: string, reason: string): Promise<DraftDetail> {
  const response = await apiClient.post<DraftDetail>(API_ENDPOINTS.CURATOR_REJECT(id), {
    reason,
  });
  return response.data;
}

export async function fetchDraftActions(id: string): Promise<CurationAction[]> {
  const response = await apiClient.get<CurationAction[]>(API_ENDPOINTS.CURATOR_ACTIONS(id));
  return response.data;
}

// ============================================================================
// Legacy compatibility helpers
// ============================================================================

// These functions provide compatibility with the old mockApi interface
// They transform the new API types to match the old frontend expectations

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

export async function fetchProofJobs(): Promise<ProofJob[]> {
  // TODO: Implement proof jobs endpoint when available
  // For now, return empty array
  return [];
}

export async function fetchCreatorMetrics(): Promise<CreatorMetric[]> {
  // TODO: Implement creator metrics endpoint when available
  // For now, return mock data
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
