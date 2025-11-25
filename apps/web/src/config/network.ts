import { clusterApiUrl } from '@solana/web3.js';

export type NetworkType = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';

export interface NetworkConfig {
  name: string;
  displayName: string;
  type: NetworkType;
  endpoint: string;
  isTestnet: boolean;
  color: string; // For UI indication
}

// Get network from environment or default to devnet
const VITE_SOLANA_NETWORK = (import.meta.env.VITE_SOLANA_NETWORK as NetworkType) || 'devnet';
const VITE_SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL as string | undefined;

export const AVAILABLE_NETWORKS: Record<NetworkType, NetworkConfig> = {
  'mainnet-beta': {
    name: 'mainnet-beta',
    displayName: 'Mainnet',
    type: 'mainnet-beta',
    endpoint: VITE_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta'),
    isTestnet: false,
    color: '#14F195', // Green
  },
  testnet: {
    name: 'testnet',
    displayName: 'Testnet',
    type: 'testnet',
    endpoint: VITE_SOLANA_RPC_URL || clusterApiUrl('testnet'),
    isTestnet: true,
    color: '#FF6B6B', // Red
  },
  devnet: {
    name: 'devnet',
    displayName: 'Devnet',
    type: 'devnet',
    endpoint: VITE_SOLANA_RPC_URL || clusterApiUrl('devnet'),
    isTestnet: true,
    color: '#FFA500', // Orange
  },
  localnet: {
    name: 'localnet',
    displayName: 'Localnet',
    type: 'localnet',
    endpoint: VITE_SOLANA_RPC_URL || 'http://localhost:8899',
    isTestnet: true,
    color: '#9B59B6', // Purple
  },
};

// Current network configuration
export const CURRENT_NETWORK: NetworkConfig = AVAILABLE_NETWORKS[VITE_SOLANA_NETWORK];

// Helper to get network badge text
export function getNetworkBadgeText(network: NetworkConfig): string {
  if (network.isTestnet) {
    return network.displayName.toUpperCase();
  }
  return '';
}

// Helper to check if we're on testnet
export function isTestnetEnvironment(): boolean {
  return CURRENT_NETWORK.isTestnet;
}
