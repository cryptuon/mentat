import {
  Connection,
  PublicKey,
  LogsFilter,
  Context,
  Logs,
  Commitment,
} from '@solana/web3.js';
import { createChildLogger } from '../logger';
import { config } from '../config';
import { SolanaEventParser } from '../parsers/eventParser';
import { EventRepository, eventRepository } from '../repositories/eventRepository';

const logger = createChildLogger('logListener');

export class LogListener {
  private connection: Connection;
  private subscriptionIds: Map<string, number> = new Map();
  private isRunning = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  constructor(
    private eventParser: SolanaEventParser,
    private repository: EventRepository = eventRepository
  ) {
    this.connection = new Connection(config.solana.rpcUrl, {
      commitment: config.solana.commitment,
      wsEndpoint: config.solana.wsUrl,
    });
  }

  /**
   * Start listening to logs for both programs
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Log listener already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting log listener');

    try {
      // Subscribe to both programs
      await this.subscribeToProgramLogs(
        config.programs.marketFactory,
        'market-factory'
      );
      await this.subscribeToProgramLogs(
        config.programs.marketSettlement,
        'market-settlement'
      );

      logger.info('Log listener started successfully');
    } catch (error) {
      this.isRunning = false;
      logger.error('Failed to start log listener', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Subscribe to logs for a specific program
   */
  private async subscribeToProgramLogs(
    programId: PublicKey,
    name: string
  ): Promise<void> {
    const filter: LogsFilter = {
      mentions: [programId.toBase58()],
    };

    try {
      const subscriptionId = this.connection.onLogs(
        filter,
        (logs: Logs, ctx: Context) => this.handleLogs(logs, ctx, programId, name),
        config.solana.commitment as Commitment
      );

      this.subscriptionIds.set(name, subscriptionId);
      logger.info(`Subscribed to ${name} logs`, {
        programId: programId.toBase58(),
        subscriptionId,
      });
    } catch (error) {
      logger.error(`Failed to subscribe to ${name} logs`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Handle incoming logs
   */
  private async handleLogs(
    logs: Logs,
    ctx: Context,
    programId: PublicKey,
    programName: string
  ): Promise<void> {
    try {
      logger.debug('Received logs', {
        program: programName,
        signature: logs.signature,
        slot: ctx.slot,
      });

      // Skip if there was an error
      if (logs.err) {
        logger.debug('Transaction failed, skipping', {
          signature: logs.signature,
          error: logs.err,
        });
        return;
      }

      // Parse event from logs
      const parsedEvent = this.eventParser.parseEvent(
        logs.logs,
        programId,
        logs.signature,
        ctx.slot,
        null // Block time will be null for real-time logs
      );

      if (!parsedEvent) {
        logger.debug('No event parsed from logs', {
          signature: logs.signature,
        });
        return;
      }

      // Validate event
      if (!this.eventParser.validateEvent(parsedEvent)) {
        logger.warn('Invalid event structure', {
          type: parsedEvent.type,
          signature: logs.signature,
        });
        return;
      }

      // Save event to database
      await this.repository.saveEvent(parsedEvent);

      // Update indexer state
      await this.repository.updateIndexerState(
        programId.toBase58(),
        ctx.slot,
        logs.signature
      );

      logger.info('Event processed successfully', {
        type: parsedEvent.type,
        signature: logs.signature,
        slot: ctx.slot,
      });
    } catch (error) {
      logger.error('Failed to handle logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        signature: logs.signature,
      });
    }
  }

  /**
   * Stop listening to logs
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Log listener not running');
      return;
    }

    logger.info('Stopping log listener');

    // Unsubscribe from all programs
    for (const [name, subscriptionId] of this.subscriptionIds.entries()) {
      try {
        await this.connection.removeOnLogsListener(subscriptionId);
        logger.info(`Unsubscribed from ${name} logs`, { subscriptionId });
      } catch (error) {
        logger.error(`Failed to unsubscribe from ${name} logs`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.subscriptionIds.clear();
    this.isRunning = false;
    logger.info('Log listener stopped');
  }

  /**
   * Health check
   */
  isHealthy(): boolean {
    return this.isRunning && this.subscriptionIds.size > 0;
  }

  /**
   * Handle connection errors and reconnect
   */
  private async handleConnectionError(error: Error): Promise<void> {
    logger.error('Connection error', { error: error.message });

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = config.retry.connectionRetryDelayMs * this.reconnectAttempts;

      logger.info('Attempting to reconnect', {
        attempt: this.reconnectAttempts,
        delayMs: delay,
      });

      await this.sleep(delay);
      await this.stop();
      await this.start();
    } else {
      logger.error('Max reconnection attempts reached, stopping listener');
      await this.stop();
      throw new Error('Failed to maintain connection to Solana RPC');
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Reset reconnection counter on successful operation
   */
  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }
}
