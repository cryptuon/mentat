import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, BN, type Idl } from '@coral-xyz/anchor';
import type {
  Market,
  TradeParams,
  TradeResult,
  TradeEstimate,
  Position,
  LiquidityParams,
  LiquidityPosition,
  FeeBreakdown,
} from '@/types/trading';
import { LAMPORTS_PER_USDC } from '@/types/trading';

// Import IDLs
import marketFactoryIdl from '@/idl/market_factory.json';
import marketSettlementIdl from '@/idl/market_settlement.json';

/**
 * Solana Program Service
 *
 * Core service for interacting with Mentat Protocol Solana programs.
 * Handles all on-chain operations including:
 * - Trading (buy/sell outcome shares)
 * - Liquidity management (add/remove)
 * - Position queries
 * - Market data fetching
 * - Price calculations
 */
class SolanaProgramService {
  private connection: Connection | null = null;
  private marketFactoryProgram: Program | null = null;
  private marketSettlementProgram: Program | null = null;

  /**
   * Program IDs from IDL
   */
  private readonly MARKET_FACTORY_PROGRAM_ID = new PublicKey(marketFactoryIdl.address);
  private readonly MARKET_SETTLEMENT_PROGRAM_ID = new PublicKey(marketSettlementIdl.address);

  /**
   * PDA Seeds
   */
  private readonly MARKET_SEED = Buffer.from('market');
  private readonly POOL_SEED = Buffer.from('pool');
  private readonly LP_POSITION_SEED = Buffer.from('lp_position');
  private readonly POSITION_SEED = Buffer.from('position');
  private readonly FEE_VAULT_SEED = Buffer.from('fee_vault');

  /**
   * Initialize the service with a Solana connection
   */
  initialize(connection: Connection, wallet?: { publicKey: PublicKey; signTransaction: (tx: Transaction) => Promise<Transaction> }): void {
    this.connection = connection;

    if (wallet) {
      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: 'confirmed' }
      );

      this.marketFactoryProgram = new Program(
        marketFactoryIdl as Idl,
        provider
      );
      this.marketSettlementProgram = new Program(
        marketSettlementIdl as Idl,
        provider
      );
    }
  }

  /**
   * Check if service is initialized
   */
  private ensureInitialized(): void {
    if (!this.connection) {
      throw new Error('SolanaProgramService not initialized. Call initialize() first.');
    }
  }

  /**
   * Get program instances
   */
  getPrograms() {
    return {
      marketFactory: this.marketFactoryProgram,
      marketSettlement: this.marketSettlementProgram,
    };
  }

  // ============================================================================
  // PDA Derivation
  // ============================================================================

  /**
   * Derive market PDA
   */
  deriveMarketPda(marketId: BN): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [this.MARKET_SEED, marketId.toArrayLike(Buffer, 'le', 8)],
      this.MARKET_FACTORY_PROGRAM_ID
    );
  }

  /**
   * Derive liquidity pool PDA
   */
  derivePoolPda(marketPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [this.POOL_SEED, marketPubkey.toBuffer()],
      this.MARKET_FACTORY_PROGRAM_ID
    );
  }

  /**
   * Derive LP position PDA
   */
  deriveLpPositionPda(poolPubkey: PublicKey, ownerPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [this.LP_POSITION_SEED, poolPubkey.toBuffer(), ownerPubkey.toBuffer()],
      this.MARKET_FACTORY_PROGRAM_ID
    );
  }

  /**
   * Derive user position PDA
   */
  derivePositionPda(marketPubkey: PublicKey, ownerPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [this.POSITION_SEED, marketPubkey.toBuffer(), ownerPubkey.toBuffer()],
      this.MARKET_FACTORY_PROGRAM_ID
    );
  }

  /**
   * Derive fee vault PDA
   */
  deriveFeeVaultPda(marketPubkey: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [this.FEE_VAULT_SEED, marketPubkey.toBuffer()],
      this.MARKET_FACTORY_PROGRAM_ID
    );
  }

  // ============================================================================
  // Trading Operations
  // ============================================================================

  /**
   * Execute a trade (buy or sell outcome shares)
   */
  async executeTrade(
    params: TradeParams,
    walletPublicKey: PublicKey
  ): Promise<TradeResult> {
    this.ensureInitialized();

    if (!this.marketFactoryProgram) {
      throw new Error('Program not initialized with wallet');
    }

    try {
      const [poolPda] = this.derivePoolPda(params.marketPublicKey);
      const [positionPda] = this.derivePositionPda(params.marketPublicKey, walletPublicKey);

      const tx = await this.marketFactoryProgram.methods
        .executeTrade(
          params.outcomeIndex,
          new BN(params.amount.toString()),
          params.isBuy,
          params.maxSlippage * 100 // Convert to basis points
        )
        .accounts({
          trader: walletPublicKey,
          market: params.marketPublicKey,
          liquidityPool: poolPda,
          position: positionPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        marketId: params.marketId,
        outcomeIndex: params.outcomeIndex,
        isBuy: params.isBuy,
        amount: params.amount,
        shares: BigInt(0), // Will be parsed from transaction logs
        price: BigInt(0),
        fee: BigInt(0),
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Trade execution failed:', error);
      throw error;
    }
  }

  /**
   * Estimate trade outcome (shares received, price impact, fees)
   */
  estimateTrade(params: TradeParams): TradeEstimate {
    const amount = Number(params.amount);
    const estimatedShares = BigInt(Math.floor(amount * 0.95)); // 5% fee approximation
    const estimatedPrice = amount / Number(estimatedShares);
    const priceImpact = 0.5;
    const tradingFee = params.amount / BigInt(100);
    const totalCost = params.amount + tradingFee;
    const minShares = BigInt(
      Math.floor(Number(estimatedShares) * (1 - params.maxSlippage / 100))
    );

    return {
      expectedShares: estimatedShares,
      expectedPrice: estimatedPrice,
      priceImpact,
      tradingFee,
      totalCost,
      minShares,
    };
  }

  /**
   * Calculate expected shares for a given amount
   */
  calculateExpectedShares(
    amount: bigint,
    currentPrice: number,
    liquidity: bigint,
    isBuy: boolean
  ): bigint {
    if (isBuy) {
      const effectivePrice = currentPrice * (1 + Number(amount) / Number(liquidity) * 0.01);
      return BigInt(Math.floor(Number(amount) / effectivePrice));
    } else {
      const effectivePrice = currentPrice * (1 - Number(amount) / Number(liquidity) * 0.01);
      return BigInt(Math.floor(Number(amount) * effectivePrice));
    }
  }

  /**
   * Calculate price impact for a trade
   */
  calculatePriceImpact(amount: bigint, liquidity: bigint): number {
    if (liquidity === BigInt(0)) return 0;
    const impact = (Number(amount) / Number(liquidity)) * 100;
    return Math.min(impact, 100);
  }

  /**
   * Get current outcome prices for a market
   */
  async getOutcomePrices(marketPublicKey: PublicKey): Promise<number[]> {
    this.ensureInitialized();

    try {
      if (this.marketFactoryProgram) {
        const [poolPda] = this.derivePoolPda(marketPublicKey);
        const poolAccount = await this.marketFactoryProgram.account.liquidityPoolAccount.fetch(poolPda);

        const reserves = (poolAccount as any).reserves as BN[];
        const totalReserves = reserves.reduce((sum, r) => sum.add(r), new BN(0));

        return reserves.map(r => Number(r.toString()) / Number(totalReserves.toString()));
      }
      return [0.5, 0.5];
    } catch (error) {
      console.error('Failed to get outcome prices:', error);
      return [0.5, 0.5];
    }
  }

  // ============================================================================
  // Liquidity Operations
  // ============================================================================

  /**
   * Add liquidity to a market
   */
  async addLiquidity(
    params: LiquidityParams,
    walletPublicKey: PublicKey
  ): Promise<string> {
    this.ensureInitialized();

    if (!this.marketFactoryProgram) {
      throw new Error('Program not initialized with wallet');
    }

    try {
      const [poolPda] = this.derivePoolPda(params.marketPublicKey);
      const [lpPositionPda] = this.deriveLpPositionPda(poolPda, walletPublicKey);

      const tx = await this.marketFactoryProgram.methods
        .addLiquidity(new BN(params.amount.toString()))
        .accounts({
          provider: walletPublicKey,
          market: params.marketPublicKey,
          liquidityPool: poolPda,
          lpPosition: lpPositionPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Add liquidity failed:', error);
      throw error;
    }
  }

  /**
   * Remove liquidity from a market
   */
  async removeLiquidity(
    marketPublicKey: PublicKey,
    lpTokens: bigint,
    walletPublicKey: PublicKey
  ): Promise<string> {
    this.ensureInitialized();

    if (!this.marketFactoryProgram) {
      throw new Error('Program not initialized with wallet');
    }

    try {
      const [poolPda] = this.derivePoolPda(marketPublicKey);
      const [lpPositionPda] = this.deriveLpPositionPda(poolPda, walletPublicKey);

      const tx = await this.marketFactoryProgram.methods
        .removeLiquidity(new BN(lpTokens.toString()))
        .accounts({
          provider: walletPublicKey,
          market: marketPublicKey,
          liquidityPool: poolPda,
          lpPosition: lpPositionPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Remove liquidity failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // Position Queries
  // ============================================================================

  /**
   * Get user positions for a specific market
   */
  async getUserPositions(
    marketPublicKey: PublicKey,
    walletPublicKey: PublicKey
  ): Promise<Position[]> {
    this.ensureInitialized();

    try {
      if (this.marketFactoryProgram) {
        const [positionPda] = this.derivePositionPda(marketPublicKey, walletPublicKey);

        try {
          const positionAccount = await this.marketFactoryProgram.account.positionAccount.fetch(positionPda);
          const pos = positionAccount as any;

          return (pos.shares as BN[]).map((shares: BN, index: number) => ({
            marketId: marketPublicKey.toString(),
            marketPublicKey,
            outcomeIndex: index,
            outcomeLabel: `Outcome ${index + 1}`,
            shares: BigInt(shares.toString()),
            avgEntryPrice: 0.5,
            currentPrice: 0.5,
            unrealizedPnL: 0,
            unrealizedPnLPercentage: 0,
            currentValue: BigInt(shares.toString()),
            investedAmount: BigInt(pos.totalInvested?.toString() || '0'),
          })).filter((p: Position) => p.shares > BigInt(0));
        } catch {
          return [];
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to get user positions:', error);
      return [];
    }
  }

  /**
   * Get liquidity position for a market
   */
  async getLiquidityPosition(
    marketPublicKey: PublicKey,
    walletPublicKey: PublicKey
  ): Promise<LiquidityPosition | null> {
    this.ensureInitialized();

    try {
      if (this.marketFactoryProgram) {
        const [poolPda] = this.derivePoolPda(marketPublicKey);
        const [lpPositionPda] = this.deriveLpPositionPda(poolPda, walletPublicKey);

        try {
          const lpAccount = await this.marketFactoryProgram.account.lpPositionAccount.fetch(lpPositionPda);
          const lp = lpAccount as any;

          return {
            marketId: marketPublicKey.toString(),
            marketPublicKey,
            lpTokens: BigInt(lp.lpTokens?.toString() || '0'),
            poolShare: 0,
            currentValue: BigInt(lp.lpTokens?.toString() || '0'),
            investedAmount: BigInt(lp.initialInvestment?.toString() || '0'),
            unrealizedPnL: 0,
            feesEarned: BigInt(lp.feesEarned?.toString() || '0'),
            apy: 0,
          };
        } catch {
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get liquidity position:', error);
      return null;
    }
  }

  // ============================================================================
  // Market Data
  // ============================================================================

  /**
   * Get market on-chain data
   */
  async getMarketData(marketPublicKey: PublicKey): Promise<Market | null> {
    this.ensureInitialized();

    try {
      if (this.marketFactoryProgram) {
        const marketAccount = await this.marketFactoryProgram.account.marketAccount.fetch(marketPublicKey);
        const m = marketAccount as any;

        return {
          id: marketPublicKey.toString(),
          publicKey: marketPublicKey,
          creator: m.creator,
          questionText: m.questionText,
          category: 'general',
          numOutcomes: m.numOutcomes,
          state: this.mapMarketState(m.state),
          liquidity: BigInt(0),
          tradingFeeBps: m.tradingFeeBps,
          resolutionDeadline: new Date(m.resolutionDeadline * 1000),
          createdAt: new Date(m.createdAt * 1000),
          outcomes: [],
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get market data:', error);
      return null;
    }
  }

  /**
   * Map on-chain market state to enum
   */
  private mapMarketState(state: any): any {
    if (state.active) return 'open';
    if (state.resolved) return 'resolved';
    if (state.disputed) return 'disputed';
    if (state.closed) return 'closed';
    return 'open';
  }

  /**
   * Get fee breakdown for a trade
   */
  calculateFeeBreakdown(amount: bigint, tradingFeeBps: number): FeeBreakdown {
    const tradingFee = (amount * BigInt(tradingFeeBps)) / BigInt(10000);
    const lpShare = (tradingFee * BigInt(60)) / BigInt(100);
    const creatorShare = (tradingFee * BigInt(30)) / BigInt(100);
    const treasuryShare = tradingFee - lpShare - creatorShare;

    return {
      tradingFee,
      lpShare,
      creatorShare,
      treasuryShare,
    };
  }

  // ============================================================================
  // Transaction Building
  // ============================================================================

  /**
   * Simulate transaction before sending
   */
  async simulateTransaction(transaction: Transaction): Promise<{
    success: boolean;
    logs: string[];
    error?: string;
  }> {
    this.ensureInitialized();

    try {
      const simulation = await this.connection!.simulateTransaction(transaction);
      return {
        success: simulation.value.err === null,
        logs: simulation.value.logs || [],
        error: simulation.value.err ? JSON.stringify(simulation.value.err) : undefined,
      };
    } catch (error) {
      console.error('Transaction simulation failed:', error);
      return {
        success: false,
        logs: [],
        error: error instanceof Error ? error.message : 'Simulation failed',
      };
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  usdcToLamports(usdcAmount: number): bigint {
    return BigInt(Math.floor(usdcAmount * LAMPORTS_PER_USDC));
  }

  lamportsToUsdc(lamports: bigint): number {
    return Number(lamports) / LAMPORTS_PER_USDC;
  }

  formatPrice(price: number, decimals: number = 4): string {
    return price.toFixed(decimals);
  }

  formatShares(shares: bigint): string {
    const sharesNum = Number(shares) / LAMPORTS_PER_USDC;
    return sharesNum.toFixed(2);
  }
}

// Export singleton instance
export const solanaProgramService = new SolanaProgramService();

// Export class for testing
export { SolanaProgramService };
