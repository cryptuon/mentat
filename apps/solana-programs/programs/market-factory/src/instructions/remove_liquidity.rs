use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::MarketError;
use crate::events::*;
use crate::state::*;

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(mut)]
    pub provider: Signer<'info>,

    pub market: Account<'info, MarketAccount>,

    #[account(
        mut,
        seeds = [POOL_SEED, market.key().as_ref()],
        bump = liquidity_pool.bump,
    )]
    pub liquidity_pool: Account<'info, LiquidityPoolAccount>,

    #[account(
        mut,
        seeds = [LP_POSITION_SEED, liquidity_pool.key().as_ref(), provider.key().as_ref()],
        bump = lp_position.bump,
        constraint = lp_position.owner == provider.key(),
    )]
    pub lp_position: Account<'info, LPPositionAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RemoveLiquidity>, lp_tokens: u64) -> Result<()> {
    require!(lp_tokens > 0, MarketError::InvalidLPTokens);
    require!(
        ctx.accounts.lp_position.lp_tokens >= lp_tokens,
        MarketError::InvalidLPTokens
    );

    let pool = &mut ctx.accounts.liquidity_pool;
    let lp_position = &mut ctx.accounts.lp_position;

    // Calculate share of pool
    let total_value: u64 = pool.reserves.iter().sum();
    let amount = (lp_tokens as u128)
        .checked_mul(total_value as u128)
        .ok_or(MarketError::MathOverflow)?
        .checked_div(pool.lp_token_supply as u128)
        .ok_or(MarketError::DivisionByZero)? as u64;

    // Update LP position
    lp_position.lp_tokens = lp_position.lp_tokens
        .checked_sub(lp_tokens)
        .ok_or(MarketError::MathOverflow)?;
    lp_position.last_updated = Clock::get()?.unix_timestamp;

    // Update pool
    pool.lp_token_supply = pool.lp_token_supply
        .checked_sub(lp_tokens)
        .ok_or(MarketError::MathOverflow)?;

    // Remove proportional amount from reserves
    let amount_per_outcome = amount / (pool.reserves.len() as u64);
    for reserve in pool.reserves.iter_mut() {
        *reserve = reserve
            .checked_sub(amount_per_outcome)
            .ok_or(MarketError::InsufficientLiquidity)?;
    }

    // Transfer lamports to provider
    **ctx.accounts.liquidity_pool.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.provider.to_account_info().try_borrow_mut_lamports()? += amount;

    emit!(LiquidityRemoved {
        market: ctx.accounts.market.key(),
        provider: ctx.accounts.provider.key(),
        lp_tokens_burned: lp_tokens,
        amount_received: amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Liquidity removed: {} LP tokens burned, {} lamports received", lp_tokens, amount);

    Ok(())
}
