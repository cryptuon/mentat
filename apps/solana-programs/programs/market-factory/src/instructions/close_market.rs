use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::MarketError;
use crate::events::*;
use crate::state::*;

#[derive(Accounts)]
pub struct CloseMarket<'info> {
    /// Market creator
    #[account(mut)]
    pub creator: Signer<'info>,

    /// Market account
    #[account(
        mut,
        constraint = market.creator == creator.key() @ MarketError::Unauthorized,
        constraint = market.state == MarketState::Settled @ MarketError::MarketNotSettled,
    )]
    pub market: Account<'info, MarketAccount>,

    /// Liquidity pool
    #[account(
        mut,
        seeds = [POOL_SEED, market.key().as_ref()],
        bump = liquidity_pool.bump,
        constraint = liquidity_pool.market == market.key(),
    )]
    pub liquidity_pool: Account<'info, LiquidityPoolAccount>,

    /// Fee vault
    #[account(
        mut,
        seeds = [FEE_VAULT_SEED, market.key().as_ref()],
        bump = fee_vault.bump,
        constraint = fee_vault.market == market.key(),
    )]
    pub fee_vault: Account<'info, FeeVaultAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CloseMarket>) -> Result<()> {
    let market = &mut ctx.accounts.market;
    let fee_vault = &mut ctx.accounts.fee_vault;
    let pool = &ctx.accounts.liquidity_pool;

    // Ensure market is settled
    require!(
        market.state == MarketState::Settled,
        MarketError::MarketNotSettled
    );

    // Calculate fees available for withdrawal
    let available_fees = fee_vault
        .total_collected
        .checked_sub(fee_vault.total_withdrawn)
        .ok_or(MarketError::MathOverflow)?;

    // Verify pool is empty (all positions claimed)
    let total_reserves: u64 = pool.reserves.iter().sum();
    require!(
        total_reserves == 0 || pool.lp_token_supply == 0,
        MarketError::PoolNotEmpty
    );

    // Transfer remaining fees to creator
    if available_fees > 0 {
        **fee_vault.to_account_info().try_borrow_mut_lamports()? -= available_fees;
        **ctx.accounts.creator.to_account_info().try_borrow_mut_lamports()? += available_fees;

        fee_vault.total_withdrawn = fee_vault
            .total_withdrawn
            .checked_add(available_fees)
            .ok_or(MarketError::MathOverflow)?;
    }

    // Update market state
    market.state = MarketState::Closed;

    emit!(MarketClosed {
        market: market.key(),
        creator: ctx.accounts.creator.key(),
        fees_withdrawn: available_fees,
        total_volume: market.total_volume,
        total_trades: market.total_trades,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
        "Market closed successfully. {} lamports in fees withdrawn to creator",
        available_fees
    );

    Ok(())
}
