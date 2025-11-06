use anchor_lang::prelude::*;

declare_id!("3sgfKweTHC5EZgGsh6CCcgP9Bqppb5UA6CwgAcHbF9va");

pub mod state;
pub mod instructions;
pub mod events;
pub mod errors;
pub mod constants;

use instructions::*;

#[program]
pub mod market_factory {
    use super::*;

    /// Initialize a new prediction market
    pub fn initialize_market(
        ctx: Context<InitializeMarket>,
        market_id: u64,
        question_text: String,
        outcomes: Vec<String>,
        trading_fee_bps: u16,
        resolution_deadline: i64,
        initial_liquidity: u64,
    ) -> Result<()> {
        instructions::initialize_market::handler(
            ctx,
            market_id,
            question_text,
            outcomes,
            trading_fee_bps,
            resolution_deadline,
            initial_liquidity,
        )
    }

    /// Add liquidity to a market pool
    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount: u64,
    ) -> Result<()> {
        instructions::add_liquidity::handler(ctx, amount)
    }

    /// Remove liquidity from a market pool
    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        lp_tokens: u64,
    ) -> Result<()> {
        instructions::remove_liquidity::handler(ctx, lp_tokens)
    }

    /// Execute a trade (buy or sell outcome shares)
    pub fn execute_trade(
        ctx: Context<ExecuteTrade>,
        outcome_index: u8,
        amount: u64,
        is_buy: bool,
        max_slippage_bps: u16,
    ) -> Result<()> {
        instructions::execute_trade::handler(
            ctx,
            outcome_index,
            amount,
            is_buy,
            max_slippage_bps,
        )
    }

    /// Update market state (Admin only)
    pub fn update_market_state(
        ctx: Context<UpdateMarketState>,
        new_state: u8,
    ) -> Result<()> {
        instructions::update_market_state::handler(ctx, new_state)
    }

    /// Close market and withdraw fees (After resolution)
    pub fn close_market(
        ctx: Context<CloseMarket>,
    ) -> Result<()> {
        instructions::close_market::handler(ctx)
    }
}
