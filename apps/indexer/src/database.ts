import { Pool, PoolClient, QueryResult } from 'pg';
import { config } from './config';
import { createChildLogger } from './logger';

const logger = createChildLogger('database');

export class Database {
  private pool: Pool;
  private isConnected = false;

  constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
      max: config.database.poolSize,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected database pool error', { error: err.message });
    });

    this.pool.on('connect', () => {
      if (!this.isConnected) {
        logger.info('Database pool connected');
        this.isConnected = true;
      }
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      client.release();
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Failed to connect to database', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async query<T = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      logger.debug('Query executed', { duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Query failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: text,
      });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transaction rolled back', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database pool closed');
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}

export const db = new Database();
