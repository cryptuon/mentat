/**
 * API types matching backend schema
 */

// User & Auth types
export interface User {
  id: string;
  wallet_address: string;
  email?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  is_curator: boolean;
  is_admin: boolean;
  total_markets_created: number;
  total_volume_generated: number;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterRequest {
  wallet_address: string;
  email?: string;
  password?: string;
  username?: string;
  display_name?: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
  wallet_address?: string;
  signature?: string;
}

// Market types
export type MarketState = 'draft' | 'pending_launch' | 'active' | 'locked' | 'resolved' | 'invalid' | 'disputed';

export interface MarketOutcome {
  id: string;
  label: string;
  payout_weight: number;
  current_probability: number;
  current_price: number;
  display_order: number;
}

export interface ResolutionSource {
  id: string;
  source_url: string;
  source_type: string;
  priority: number;
  expected_data_pattern?: string;
  min_confirmations: number;
}

export interface MarketListItem {
  id: string;
  market_id?: number;
  question_text: string;
  summary?: string;
  topic_tags: string[];
  state: MarketState;
  outcomes: MarketOutcome[];
  total_volume: number;
  total_liquidity: number;
  unique_traders: number;
  created_at: string;
  resolution_deadline?: string;
  creator_wallet: string;
}

export interface MarketDetail {
  id: string;
  market_id?: number;
  version: number;
  question_text: string;
  summary?: string;
  ai_rationale?: string;
  ai_rationale_hash?: string;
  topic_tags: string[];
  external_links: string[];

  // Resolution
  primary_sources: string[];
  trigger_condition?: string;
  fallback_logic?: string;
  invalidation_clause?: string;
  resolution_sources: ResolutionSource[];

  // Economics
  creator_stake: number;
  trading_fee_bps: number;
  settlement_fee_bps: number;
  proof_bounty: number;
  dispute_bond_minimum: number;
  fee_split_lp_bps: number;
  fee_split_creator_bps: number;
  fee_split_treasury_bps: number;

  // State
  state: MarketState;
  outcomes: MarketOutcome[];

  // Timestamps
  created_at: string;
  updated_at: string;
  open_at?: string;
  lock_at?: string;
  resolution_deadline?: string;
  dispute_window_hours: number;
  resolved_at?: string;

  // On-chain
  on_chain_address?: string;
  metadata_uri?: string;

  // Stats
  total_volume: number;
  total_liquidity: number;
  unique_traders: number;

  // Creator
  creator_wallet: string;
}

// Draft types
export type DraftStatus = 'pending' | 'in_review' | 'changes_requested' | 'approved' | 'rejected' | 'deployed';

export interface DraftListItem {
  id: string;
  creator_wallet: string;
  question_text: string;
  status: DraftStatus;
  assigned_curator_name?: string;
  quality_score?: number;
  version: number;
  created_at: string;
  submitted_at?: string;
}

export interface DraftDetail {
  id: string;
  creator_id: string;
  creator_wallet: string;
  draft_data: Record<string, any>;
  status: DraftStatus;
  assigned_curator_id?: string;
  assigned_curator_name?: string;

  // AI metadata
  ai_model_used?: string;
  ai_generation_metadata?: Record<string, any>;

  // Quality scores
  quality_score?: number;
  safety_score?: number;
  clarity_score?: number;

  // Validation
  validation_errors: Array<Record<string, any>>;
  validation_warnings: Array<Record<string, any>>;

  // Curator feedback
  curator_notes?: string;
  requested_changes?: Record<string, any>;

  // Version
  version: number;
  parent_draft_id?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  deployed_at?: string;
}

export interface DraftCreateRequest {
  draft_data: Record<string, any>;
  ai_model_used?: string;
  ai_generation_metadata?: Record<string, any>;
  conversation_history?: Array<Record<string, any>>;
}

export interface DraftUpdateRequest {
  draft_data: Record<string, any>;
  curator_response?: string;
}

// Curation types
export type CurationActionType = 'submit' | 'claim' | 'comment' | 'request_changes' | 'approve' | 'reject' | 'edit' | 'deploy';

export interface CurationAction {
  id: string;
  draft_id: string;
  actor_id: string;
  actor_wallet: string;
  action_type: CurationActionType;
  comment?: string;
  field_changes?: Record<string, Record<string, any>>;
  metadata?: Record<string, any>;
  created_at: string;
}
