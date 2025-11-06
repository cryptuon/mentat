use anchor_lang::prelude::*;

/// Event emitted when a new market is created
#[event]
pub struct MarketCreated {
    pub market_id: u64,
    pub market: Pubkey,
    pub creator: Pubkey,
    pub question_text: String,
    pub num_outcomes: u8,
    pub trading_fee_bps: u16,
    pub resolution_deadline: i64,
    pub timestamp: i64,
}

/// Event emitted when liquidity is added
#[event]
pub struct LiquidityAdded {
    pub market: Pubkey,
    pub provider: Pubkey,
    pub amount: u64,
    pub lp_tokens_minted: u64,
    pub timestamp: i64,
}

/// Event emitted when liquidity is removed
#[event]
pub struct LiquidityRemoved {
    pub market: Pubkey,
    pub provider: Pubkey,
    pub lp_tokens_burned: u64,
    pub amount_received: u64,
    pub timestamp: i64,
}

/// Event emitted when a trade is executed
#[event]
pub struct TradeExecuted {
    pub market: Pubkey,
    pub trader: Pubkey,
    pub outcome_index: u8,
    pub is_buy: bool,
    pub amount: u64,
    pub price: u64,
    pub fee: u64,
    pub shares: u64,
    pub timestamp: i64,
}

/// Event emitted when market state changes
#[event]
pub struct MarketStateChanged {
    pub market: Pubkey,
    pub old_state: String,
    pub new_state: String,
    pub authority: Pubkey,
    pub timestamp: i64,
}

/// Event emitted when market is resolved
#[event]
pub struct MarketResolved {
    pub market: Pubkey,
    pub winning_outcome: u8,
    pub resolver: Pubkey,
    pub timestamp: i64,
}

/// Event emitted when market is closed
#[event]
pub struct MarketClosed {
    pub market: Pubkey,
    pub creator: Pubkey,
    pub fees_withdrawn: u64,
    pub total_volume: u64,
    pub total_trades: u64,
    pub timestamp: i64,
}

/// Event emitted when fees are withdrawn
#[event]
pub struct FeesWithdrawn {
    pub market: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}
