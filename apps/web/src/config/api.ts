/**
 * API configuration for Mentat Protocol backend
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/api/v1/auth/register',
  AUTH_LOGIN: '/api/v1/auth/login',
  AUTH_ME: '/api/v1/auth/me',

  // Markets
  MARKETS_LIST: '/api/v1/markets',
  MARKETS_DETAIL: (id: string) => `/api/v1/markets/${id}`,
  MARKETS_USER: (wallet: string) => `/api/v1/markets/user/${wallet}`,

  // Drafts
  DRAFTS_LIST: '/api/v1/drafts',
  DRAFTS_CREATE: '/api/v1/drafts',
  DRAFTS_DETAIL: (id: string) => `/api/v1/drafts/${id}`,
  DRAFTS_UPDATE: (id: string) => `/api/v1/drafts/${id}`,
  DRAFTS_SUBMIT: (id: string) => `/api/v1/drafts/${id}/submit`,

  // Curator
  CURATOR_QUEUE: '/api/v1/curator/queue',
  CURATOR_CLAIM: (id: string) => `/api/v1/curator/${id}/claim`,
  CURATOR_APPROVE: (id: string) => `/api/v1/curator/${id}/approve`,
  CURATOR_REQUEST_CHANGES: (id: string) => `/api/v1/curator/${id}/request-changes`,
  CURATOR_REJECT: (id: string) => `/api/v1/curator/${id}/reject`,
  CURATOR_ACTIONS: (id: string) => `/api/v1/curator/${id}/actions`,
};
