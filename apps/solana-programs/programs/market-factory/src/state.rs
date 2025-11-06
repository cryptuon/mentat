use anchor_lang::prelude::*;

/// Market state enum
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum MarketState {
    /// Market is being initialized
    Initializing = 0,
    /// Market is active and tradeable
    Active = 1,
    /// Market is frozen (no trading)
    Frozen = 2,
    /// Market is resolved and awaiting settlement
    Resolved = 3,
    /// Market is settled and payouts distributed
    Settled = 4,
    /// Market is closed permanently
    Closed = 5,
    /// Market resolution is being disputed
    Disputed = 6,
}

/// Main market account storing all market data
#[account]
pub struct MarketAccount {
    /// Unique market ID
    pub market_id: u64,

    /// Market creator (authority)
    pub creator: Pubkey,

    /// Market question text (max 280 chars)
    pub question_text: String,

    /// Number of possible outcomes
    pub num_outcomes: u8,

    /// Current market state
    pub state: MarketState,

    /// Trading fee in basis points (100 = 1%)
    pub trading_fee_bps: u16,

    /// Settlement fee in basis points
    pub settlement_fee_bps: u16,

    /// Liquidity pool PDA
    pub liquidity_pool: Pubkey,

    /// Fee vault PDA
    pub fee_vault: Pubkey,

    /// Resolution deadline (Unix timestamp)
    pub resolution_deadline: i64,

    /// Total trading volume in lamports
    pub total_volume: u64,

    /// Total number of trades
    pub total_trades: u64,

    /// Market creation timestamp
    pub created_at: i64,

    /// Market resolution timestamp (0 if not resolved)
    pub resolved_at: i64,

    /// Winning outcome index (255 if not resolved)
    pub winning_outcome: u8,

    /// PDA bump seed
    pub bump: u8,
}

impl MarketAccount {
    /// Calculate space needed for market account
    pub const LEN: usize = 8 + // discriminator
        8 + // market_id
        32 + // creator
        4 + 280 + // question_text (String with max length)
        1 + // num_outcomes
        1 + // state enum
        2 + // trading_fee_bps
        2 + // settlement_fee_bps
        32 + // liquidity_pool
        32 + // fee_vault
        8 + // resolution_deadline
        8 + // total_volume
        8 + // total_trades
        8 + // created_at
        8 + // resolved_at
        1 + // winning_outcome
        1; // bump
}

/// Liquidity pool account for AMM
#[account]
pub struct LiquidityPoolAccount {
    /// Associated market
    pub market: Pubkey,

    /// Reserves for each outcome (in lamports)
    /// reserves[i] = amount of outcome i tokens in pool
    pub reserves: Vec<u64>,

    /// Total LP token supply
    pub lp_token_supply: u64,

    /// Fee vault for collecting fees
    pub fee_vault: Pubkey,

    /// Constant product invariant (k = reserve[0] * reserve[1] * ... * reserve[n])
    pub invariant: u128,

    /// Total fees collected
    pub total_fees_collected: u64,

    /// PDA bump seed
    pub bump: u8,
}

impl LiquidityPoolAccount {
    /// Calculate space for pool with max 10 outcomes
    pub const MAX_OUTCOMES: usize = 10;
    pub const LEN: usize = 8 + // discriminator
        32 + // market
        4 + (8 * Self::MAX_OUTCOMES) + // reserves Vec
        8 + // lp_token_supply
        32 + // fee_vault
        16 + // invariant (u128)
        8 + // total_fees_collected
        1; // bump
}

/// User position account
#[account]
pub struct PositionAccount {
    /// Associated market
    pub market: Pubkey,

    /// Position owner
    pub owner: Pubkey,

    /// Shares for each outcome
    pub shares: Vec<u64>,

    /// Total amount invested (cost basis)
    pub total_invested: u64,

    /// Realized P&L
    pub realized_pnl: i64,

    /// Last update timestamp
    pub last_updated: i64,

    /// PDA bump seed
    pub bump: u8,
}

impl PositionAccount {
    /// Calculate space for position with max 10 outcomes
    pub const MAX_OUTCOMES: usize = 10;
    pub const LEN: usize = 8 + // discriminator
        32 + // market
        32 + // owner
        4 + (8 * Self::MAX_OUTCOMES) + // shares Vec
        8 + // total_invested
        8 + // realized_pnl
        8 + // last_updated
        1; // bump
}

/// LP (Liquidity Provider) position account
#[account]
pub struct LPPositionAccount {
    /// Associated liquidity pool
    pub pool: Pubkey,

    /// LP token owner
    pub owner: Pubkey,

    /// LP tokens held
    pub lp_tokens: u64,

    /// Initial investment amount
    pub initial_investment: u64,

    /// Fees earned
    pub fees_earned: u64,

    /// Creation timestamp
    pub created_at: i64,

    /// Last update timestamp
    pub last_updated: i64,

    /// PDA bump seed
    pub bump: u8,
}

impl LPPositionAccount {
    pub const LEN: usize = 8 + // discriminator
        32 + // pool
        32 + // owner
        8 + // lp_tokens
        8 + // initial_investment
        8 + // fees_earned
        8 + // created_at
        8 + // last_updated
        1; // bump
}

/// Fee vault account for collecting trading fees
#[account]
pub struct FeeVaultAccount {
    /// Associated market
    pub market: Pubkey,

    /// Total fees collected
    pub total_collected: u64,

    /// Fees withdrawn
    pub total_withdrawn: u64,

    /// PDA bump seed
    pub bump: u8,
}

impl FeeVaultAccount {
    pub const LEN: usize = 8 + // discriminator
        32 + // market
        8 + // total_collected
        8 + // total_withdrawn
        1; // bump
}
