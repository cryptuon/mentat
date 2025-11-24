import { PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

export interface IndexerConfig {
  solana: {
    rpcUrl: string;
    wsUrl: string;
    commitment: 'finalized' | 'confirmed' | 'processed';
  };
  programs: {
    marketFactory: PublicKey;
    marketSettlement: PublicKey;
  };
  database: {
    url: string;
    poolSize: number;
  };
  logging: {
    level: string;
    file: string;
  };
  retry: {
    maxRetries: number;
    delayMs: number;
    connectionRetryDelayMs: number;
  };
  monitoring: {
    healthCheckPort: number;
  };
}

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export const config: IndexerConfig = {
  solana: {
    rpcUrl: getEnvOrDefault('SOLANA_RPC_URL', 'https://api.devnet.solana.com'),
    wsUrl: getEnvOrDefault('SOLANA_WS_URL', 'wss://api.devnet.solana.com'),
    commitment: 'confirmed',
  },
  programs: {
    marketFactory: new PublicKey(
      getEnvOrDefault(
        'MARKET_FACTORY_PROGRAM_ID',
        '3sgfKweTHC5EZgGsh6CCcgP9Bqppb5UA6CwgAcHbF9va'
      )
    ),
    marketSettlement: new PublicKey(
      getEnvOrDefault(
        'MARKET_SETTLEMENT_PROGRAM_ID',
        'mktRU9S5U6cKzX6dvKeyUgm8g8VPRZxuzizfNX18cR1'
      )
    ),
  },
  database: {
    url: getEnvOrThrow('DATABASE_URL'),
    poolSize: parseInt(getEnvOrDefault('DATABASE_POOL_SIZE', '10'), 10),
  },
  logging: {
    level: getEnvOrDefault('LOG_LEVEL', 'info'),
    file: getEnvOrDefault('LOG_FILE', 'indexer.log'),
  },
  retry: {
    maxRetries: parseInt(getEnvOrDefault('MAX_RETRIES', '3'), 10),
    delayMs: parseInt(getEnvOrDefault('RETRY_DELAY_MS', '1000'), 10),
    connectionRetryDelayMs: parseInt(
      getEnvOrDefault('CONNECTION_RETRY_DELAY_MS', '5000'),
      10
    ),
  },
  monitoring: {
    healthCheckPort: parseInt(getEnvOrDefault('HEALTH_CHECK_PORT', '3001'), 10),
  },
};
