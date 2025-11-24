import { BorshCoder, Event, EventParser } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { createChildLogger } from '../logger';
import {
  EventType,
  ParsedEvent,
  MarketCreatedEvent,
  LiquidityAddedEvent,
  TradeExecutedEvent,
  ProofSubmittedEvent,
  DisputeOpenedEvent,
} from '../types/events';

const logger = createChildLogger('eventParser');

export class SolanaEventParser {
  private factoryParser: EventParser | null = null;
  private settlementParser: EventParser | null = null;

  constructor(
    private factoryProgramId: PublicKey,
    private settlementProgramId: PublicKey
  ) {}

  /**
   * Initialize parsers with program IDLs
   * Note: This requires the IDL files from the built programs
   */
  async initialize(factoryIdl: any, settlementIdl: any): Promise<void> {
    try {
      // Create event parsers from IDLs
      this.factoryParser = new EventParser(
        this.factoryProgramId,
        new BorshCoder(factoryIdl)
      );
      this.settlementParser = new EventParser(
        this.settlementProgramId,
        new BorshCoder(settlementIdl)
      );
      logger.info('Event parsers initialized');
    } catch (error) {
      logger.error('Failed to initialize event parsers', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Parse a log entry into an event
   */
  parseEvent(
    logs: string[],
    programId: PublicKey,
    signature: string,
    slot: number,
    blockTime: number | null
  ): ParsedEvent | null {
    try {
      const parser =
        programId.equals(this.factoryProgramId)
          ? this.factoryParser
          : programId.equals(this.settlementProgramId)
          ? this.settlementParser
          : null;

      if (!parser) {
        logger.warn('No parser found for program', {
          programId: programId.toBase58(),
        });
        return null;
      }

      // Parse events from logs
      const events = parser.parseLogs(logs);
      if (events.length === 0) {
        return null;
      }

      // Take the first event (assuming one event per transaction)
      const event = events[0];
      const parsedEvent = this.mapEventToType(event, signature, slot, blockTime);

      if (parsedEvent) {
        logger.debug('Event parsed successfully', {
          type: parsedEvent.type,
          signature,
        });
      }

      return parsedEvent;
    } catch (error) {
      logger.error('Failed to parse event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        signature,
      });
      return null;
    }
  }

  /**
   * Map Anchor event to our typed event structure
   */
  private mapEventToType(
    event: Event,
    signature: string,
    slot: number,
    blockTime: number | null
  ): ParsedEvent | null {
    try {
      const eventName = event.name;
      const data = event.data;

      // Map event name to EventType enum
      const eventType = this.getEventType(eventName);
      if (!eventType) {
        logger.warn('Unknown event type', { eventName });
        return null;
      }

      // Transform data based on event type
      const transformedData = this.transformEventData(eventType, data);

      return {
        type: eventType,
        data: transformedData,
        signature,
        slot,
        blockTime,
      };
    } catch (error) {
      logger.error('Failed to map event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventName: event.name,
      });
      return null;
    }
  }

  /**
   * Get EventType enum from event name
   */
  private getEventType(eventName: string): EventType | null {
    const mapping: Record<string, EventType> = {
      MarketCreated: EventType.MarketCreated,
      LiquidityAdded: EventType.LiquidityAdded,
      LiquidityRemoved: EventType.LiquidityRemoved,
      TradeExecuted: EventType.TradeExecuted,
      MarketStateChanged: EventType.MarketStateChanged,
      MarketResolved: EventType.MarketResolved,
      MarketClosed: EventType.MarketClosed,
      FeesWithdrawn: EventType.FeesWithdrawn,
      ProofSubmitted: EventType.ProofSubmitted,
      ProofVerified: EventType.ProofVerified,
      PayoutClaimed: EventType.PayoutClaimed,
      DisputeOpened: EventType.DisputeOpened,
      DisputeResolved: EventType.DisputeResolved,
    };

    return mapping[eventName] || null;
  }

  /**
   * Transform raw event data to typed structures
   */
  private transformEventData(eventType: EventType, data: any): any {
    // Convert BN (BigNumber) and PublicKey objects to appropriate types
    const transform = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;

      // Handle PublicKey
      if (obj?.toBase58) {
        return new PublicKey(obj.toBase58());
      }

      // Handle BN (BigNumber)
      if (obj?.toNumber) {
        return BigInt(obj.toString());
      }

      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map(transform);
      }

      // Handle objects
      if (typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          // Convert snake_case to camelCase
          const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
            letter.toUpperCase()
          );
          result[camelKey] = transform(value);
        }
        return result;
      }

      return obj;
    };

    return transform(data);
  }

  /**
   * Validate event data structure
   */
  validateEvent(event: ParsedEvent): boolean {
    try {
      // Basic validation
      if (!event.type || !event.data || !event.signature) {
        return false;
      }

      // Type-specific validation could be added here
      switch (event.type) {
        case EventType.MarketCreated:
          return this.validateMarketCreated(event.data);
        case EventType.TradeExecuted:
          return this.validateTradeExecuted(event.data);
        // Add more validations as needed
        default:
          return true;
      }
    } catch {
      return false;
    }
  }

  private validateMarketCreated(data: any): boolean {
    return !!(
      data.market &&
      data.creator &&
      data.questionText &&
      data.numOutcomes
    );
  }

  private validateTradeExecuted(data: any): boolean {
    return !!(
      data.market &&
      data.trader &&
      data.amount &&
      data.price
    );
  }
}
