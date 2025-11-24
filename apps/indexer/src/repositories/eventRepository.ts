import { PoolClient } from 'pg';
import { Database, db } from '../database';
import { createChildLogger } from '../logger';
import {
  ParsedEvent,
  EventType,
  MarketCreatedEvent,
  TradeExecutedEvent,
  LiquidityAddedEvent,
  LiquidityRemovedEvent,
  ProofSubmittedEvent,
  ProofVerifiedEvent,
  SettlementMarketResolvedEvent,
  PayoutClaimedEvent,
  DisputeOpenedEvent,
  DisputeResolvedEvent,
  MarketStateChangedEvent,
  MarketClosedEvent,
  FeesWithdrawnEvent,
} from '../types/events';

const logger = createChildLogger('eventRepository');

export class EventRepository {
  constructor(private db: Database = db) {}

  /**
   * Save parsed event to database
   */
  async saveEvent(event: ParsedEvent): Promise<void> {
    try {
      await this.db.transaction(async (client) => {
        switch (event.type) {
          case EventType.MarketCreated:
            await this.saveMarketCreated(
              client,
              event.data as MarketCreatedEvent,
              event
            );
            break;
          case EventType.TradeExecuted:
            await this.saveTradeExecuted(
              client,
              event.data as TradeExecutedEvent,
              event
            );
            break;
          case EventType.LiquidityAdded:
            await this.saveLiquidityAdded(
              client,
              event.data as LiquidityAddedEvent,
              event
            );
            break;
          case EventType.LiquidityRemoved:
            await this.saveLiquidityRemoved(
              client,
              event.data as LiquidityRemovedEvent,
              event
            );
            break;
          case EventType.ProofSubmitted:
            await this.saveProofSubmitted(
              client,
              event.data as ProofSubmittedEvent,
              event
            );
            break;
          case EventType.ProofVerified:
            await this.saveProofVerified(
              client,
              event.data as ProofVerifiedEvent,
              event
            );
            break;
          case EventType.SettlementMarketResolved:
            await this.saveMarketResolved(
              client,
              event.data as SettlementMarketResolvedEvent,
              event
            );
            break;
          case EventType.PayoutClaimed:
            await this.savePayoutClaimed(
              client,
              event.data as PayoutClaimedEvent,
              event
            );
            break;
          case EventType.DisputeOpened:
            await this.saveDisputeOpened(
              client,
              event.data as DisputeOpenedEvent,
              event
            );
            break;
          case EventType.DisputeResolved:
            await this.saveDisputeResolved(
              client,
              event.data as DisputeResolvedEvent,
              event
            );
            break;
          case EventType.MarketStateChanged:
            await this.saveMarketStateChanged(
              client,
              event.data as MarketStateChangedEvent,
              event
            );
            break;
          case EventType.MarketClosed:
            await this.saveMarketClosed(
              client,
              event.data as MarketClosedEvent,
              event
            );
            break;
          case EventType.FeesWithdrawn:
            await this.saveFeesWithdrawn(
              client,
              event.data as FeesWithdrawnEvent,
              event
            );
            break;
          default:
            logger.warn('Unknown event type', { type: event.type });
        }
      });

      logger.info('Event saved', { type: event.type, signature: event.signature });
    } catch (error) {
      logger.error('Failed to save event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        type: event.type,
        signature: event.signature,
      });
      throw error;
    }
  }

  private async saveMarketCreated(
    client: PoolClient,
    data: MarketCreatedEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO on_chain_markets
       (market_address, market_id, creator_address, question_text, num_outcomes,
        trading_fee_bps, resolution_deadline, created_at, signature, slot, block_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (market_address) DO NOTHING`,
      [
        data.market.toBase58(),
        data.marketId.toString(),
        data.creator.toBase58(),
        data.questionText,
        data.numOutcomes,
        data.tradingFeeBps,
        data.resolutionDeadline.toString(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
      ]
    );
  }

  private async saveTradeExecuted(
    client: PoolClient,
    data: TradeExecutedEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO trades
       (market_address, trader_address, outcome_index, is_buy, amount, price,
        fee, shares, timestamp, signature, slot, block_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        data.market.toBase58(),
        data.trader.toBase58(),
        data.outcomeIndex,
        data.isBuy,
        data.amount.toString(),
        data.price.toString(),
        data.fee.toString(),
        data.shares.toString(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
      ]
    );
  }

  private async saveLiquidityAdded(
    client: PoolClient,
    data: LiquidityAddedEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO liquidity_events
       (market_address, provider_address, event_type, amount, lp_tokens_minted,
        timestamp, signature, slot, block_time)
       VALUES ($1, $2, 'add', $3, $4, $5, $6, $7, $8)`,
      [
        data.market.toBase58(),
        data.provider.toBase58(),
        data.amount.toString(),
        data.lpTokensMinted.toString(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
      ]
    );
  }

  private async saveLiquidityRemoved(
    client: PoolClient,
    data: LiquidityRemovedEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO liquidity_events
       (market_address, provider_address, event_type, lp_tokens_burned, amount_received,
        timestamp, signature, slot, block_time)
       VALUES ($1, $2, 'remove', $3, $4, $5, $6, $7, $8)`,
      [
        data.market.toBase58(),
        data.provider.toBase58(),
        data.lpTokensBurned.toString(),
        data.amountReceived.toString(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
      ]
    );
  }

  private async saveProofSubmitted(
    client: PoolClient,
    data: ProofSubmittedEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO resolution_events
       (market_address, event_type, actor_address, timestamp, signature, slot,
        block_time, proof_id, outcome_index, proof_data)
       VALUES ($1, 'proof_submitted', $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        data.market.toBase58(),
        data.submitter.toBase58(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
        data.proofId.toString(),
        data.outcomeIndex,
        data.proofData,
      ]
    );
  }

  private async saveProofVerified(
    client: PoolClient,
    data: ProofVerifiedEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO resolution_events
       (market_address, event_type, actor_address, timestamp, signature, slot,
        block_time, proof_id, is_valid)
       VALUES ($1, 'proof_verified', $2, $3, $4, $5, $6, $7, $8)`,
      [
        data.market.toBase58(),
        data.verifier.toBase58(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
        data.proofId.toString(),
        data.isValid,
      ]
    );
  }

  private async saveMarketResolved(
    client: PoolClient,
    data: SettlementMarketResolvedEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO resolution_events
       (market_address, event_type, actor_address, timestamp, signature, slot,
        block_time, winning_outcome, total_payout, settlement_deadline)
       VALUES ($1, 'market_resolved', $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        data.market.toBase58(),
        data.resolver.toBase58(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
        data.winningOutcome,
        data.totalPayout.toString(),
        data.settlementDeadline.toString(),
      ]
    );
  }

  private async savePayoutClaimed(
    client: PoolClient,
    data: PayoutClaimedEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO resolution_events
       (market_address, event_type, actor_address, timestamp, signature, slot,
        block_time, position_address, amount_claimed, shares_used)
       VALUES ($1, 'payout_claimed', $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        data.market.toBase58(),
        data.claimer.toBase58(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
        data.position.toBase58(),
        data.amountClaimed.toString(),
        data.sharesUsed.toString(),
      ]
    );
  }

  private async saveDisputeOpened(
    client: PoolClient,
    data: DisputeOpenedEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO resolution_events
       (market_address, event_type, actor_address, timestamp, signature, slot,
        block_time, dispute_id, original_outcome, proposed_outcome, stake_amount, reason)
       VALUES ($1, 'dispute_opened', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        data.market.toBase58(),
        data.disputer.toBase58(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
        data.disputeId.toString(),
        data.originalOutcome,
        data.proposedOutcome,
        data.stakeAmount.toString(),
        data.reason,
      ]
    );
  }

  private async saveDisputeResolved(
    client: PoolClient,
    data: DisputeResolvedEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO resolution_events
       (market_address, event_type, actor_address, timestamp, signature, slot,
        block_time, dispute_id, resolution, final_outcome)
       VALUES ($1, 'dispute_resolved', $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        data.market.toBase58(),
        data.resolver.toBase58(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
        data.disputeId.toString(),
        data.resolution,
        data.finalOutcome,
      ]
    );
  }

  private async saveMarketStateChanged(
    client: PoolClient,
    data: MarketStateChangedEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO market_state_changes
       (market_address, old_state, new_state, authority_address, timestamp,
        signature, slot, block_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        data.market.toBase58(),
        data.oldState,
        data.newState,
        data.authority.toBase58(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
      ]
    );
  }

  private async saveMarketClosed(
    client: PoolClient,
    data: MarketClosedEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO market_closures
       (market_address, creator_address, fees_withdrawn, total_volume, total_trades,
        timestamp, signature, slot, block_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (market_address) DO NOTHING`,
      [
        data.market.toBase58(),
        data.creator.toBase58(),
        data.feesWithdrawn.toString(),
        data.totalVolume.toString(),
        data.totalTrades.toString(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
      ]
    );
  }

  private async saveFeesWithdrawn(
    client: PoolClient,
    data: FeesWithdrawnEvent,
    event: ParsedEvent
  ): Promise<void> {
    await client.query(
      `INSERT INTO fee_withdrawals
       (market_address, recipient_address, amount, timestamp, signature, slot, block_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        data.market.toBase58(),
        data.recipient.toBase58(),
        data.amount.toString(),
        data.timestamp.toString(),
        event.signature,
        event.slot,
        event.blockTime,
      ]
    );
  }

  /**
   * Update indexer state
   */
  async updateIndexerState(
    programId: string,
    slot: number,
    signature: string
  ): Promise<void> {
    await this.db.query(
      `UPDATE indexer_state
       SET last_processed_slot = $1, last_processed_signature = $2, last_updated_at = CURRENT_TIMESTAMP
       WHERE program_id = $3`,
      [slot, signature, programId]
    );
  }

  /**
   * Get last processed slot for a program
   */
  async getLastProcessedSlot(programId: string): Promise<number> {
    const result = await this.db.query<{ last_processed_slot: string }>(
      'SELECT last_processed_slot FROM indexer_state WHERE program_id = $1',
      [programId]
    );
    return result.rows[0]?.last_processed_slot
      ? parseInt(result.rows[0].last_processed_slot, 10)
      : 0;
  }
}

export const eventRepository = new EventRepository();
