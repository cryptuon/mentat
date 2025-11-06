use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::*;
use crate::errors::MarketError;
use crate::events::*;
use crate::state::*;

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub provider: Signer<'info>,

    #[account(
        constraint = market.state == MarketState::Active @ MarketError::MarketNotActive,
    )]
    pub market: Account<'info, MarketAccount>,

    #[account(
        mut,
        seeds = [POOL_SEED, market.key().as_ref()],
        bump = liquidity_pool.bump,
    )]
    pub liquidity_pool: Account<'info, LiquidityPoolAccount>,

    #[account(
        init_if_needed,
        payer = provider,
        space = LPPositionAccount::LEN,
        seeds = [LP_POSITION_SEED, liquidity_pool.key().as_ref(), provider.key().as_ref()],
        bump,
    )]
    pub lp_position: Account<'info, LPPositionAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<AddLiquidity>, amount: u64) -> Result<()> {
    require!(amount >= MIN_LIQUIDITY, MarketError::InsufficientLiquidity);

    let pool = &mut ctx.accounts.liquidity_pool;
    let lp_position = &mut ctx.accounts.lp_position;

    // Calculate LP tokens to mint (proportional to existing supply)
    let lp_tokens = if pool.lp_token_supply == 0 {
        amount
    } else {
        let total_value: u64 = pool.reserves.iter().sum();
        (amount as u128)
            .checked_mul(pool.lp_token_supply as u128)
            .ok_or(MarketError::MathOverflow)?
            .checked_div(total_value as u128)
            .ok_or(MarketError::DivisionByZero)? as u64
    };

    // Initialize LP position if new
    if lp_position.owner == Pubkey::default() {
        lp_position.pool = pool.key();
        lp_position.owner = ctx.accounts.provider.key();
        lp_position.lp_tokens = 0;
        lp_position.initial_investment = 0;
        lp_position.fees_earned = 0;
        lp_position.created_at = Clock::get()?.unix_timestamp;
        lp_position.last_updated = Clock::get()?.unix_timestamp;
        lp_position.bump = ctx.bumps.lp_position;
    }

    // Update LP position
    lp_position.lp_tokens = lp_position.lp_tokens
        .checked_add(lp_tokens)
        .ok_or(MarketError::MathOverflow)?;
    lp_position.initial_investment = lp_position.initial_investment
        .checked_add(amount)
        .ok_or(MarketError::MathOverflow)?;
    lp_position.last_updated = Clock::get()?.unix_timestamp;

    // Update pool
    pool.lp_token_supply = pool.lp_token_supply
        .checked_add(lp_tokens)
        .ok_or(MarketError::MathOverflow)?;

    // Distribute amount equally across all outcome reserves
    let amount_per_outcome = amount / (pool.reserves.len() as u64);
    for reserve in pool.reserves.iter_mut() {
        *reserve = reserve
            .checked_add(amount_per_outcome)
            .ok_or(MarketError::MathOverflow)?;
    }

    // Transfer lamports to pool
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.provider.to_account_info(),
                to: ctx.accounts.liquidity_pool.to_account_info(),
            },
        ),
        amount,
    )?;

    emit!(LiquidityAdded {
        market: ctx.accounts.market.key(),
        provider: ctx.accounts.provider.key(),
        amount,
        lp_tokens_minted: lp_tokens,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("Liquidity added: {} lamports, {} LP tokens minted", amount, lp_tokens);

    Ok(())
}
