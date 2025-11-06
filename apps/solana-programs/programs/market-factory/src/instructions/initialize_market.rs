use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::*;
use crate::errors::MarketError;
use crate::events::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(market_id: u64)]
pub struct InitializeMarket<'info> {
    /// Market creator
    #[account(mut)]
    pub creator: Signer<'info>,

    /// Market account PDA
    #[account(
        init,
        payer = creator,
        space = MarketAccount::LEN,
        seeds = [MARKET_SEED, market_id.to_le_bytes().as_ref()],
        bump
    )]
    pub market: Account<'info, MarketAccount>,

    /// Liquidity pool PDA
    #[account(
        init,
        payer = creator,
        space = LiquidityPoolAccount::LEN,
        seeds = [POOL_SEED, market.key().as_ref()],
        bump
    )]
    pub liquidity_pool: Account<'info, LiquidityPoolAccount>,

    /// Fee vault PDA
    #[account(
        init,
        payer = creator,
        space = FeeVaultAccount::LEN,
        seeds = [FEE_VAULT_SEED, market.key().as_ref()],
        bump
    )]
    pub fee_vault: Account<'info, FeeVaultAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeMarket>,
    market_id: u64,
    question_text: String,
    outcomes: Vec<String>,
    trading_fee_bps: u16,
    resolution_deadline: i64,
    initial_liquidity: u64,
) -> Result<()> {
    // Validate inputs
    require!(
        outcomes.len() >= MIN_OUTCOMES as usize && outcomes.len() <= MAX_OUTCOMES as usize,
        MarketError::InvalidNumberOfOutcomes
    );

    require!(
        question_text.len() <= MAX_QUESTION_LENGTH,
        MarketError::QuestionTextTooLong
    );

    require!(
        trading_fee_bps <= MAX_TRADING_FEE_BPS,
        MarketError::TradingFeeTooHigh
    );

    require!(
        initial_liquidity >= MIN_LIQUIDITY,
        MarketError::InsufficientLiquidity
    );

    let current_time = Clock::get()?.unix_timestamp;
    require!(
        resolution_deadline > current_time + MIN_RESOLUTION_DELAY,
        MarketError::ResolutionDeadlinePassed
    );

    // Initialize market account
    let market = &mut ctx.accounts.market;
    market.market_id = market_id;
    market.creator = ctx.accounts.creator.key();
    market.question_text = question_text.clone();
    market.num_outcomes = outcomes.len() as u8;
    market.state = MarketState::Initializing;
    market.trading_fee_bps = trading_fee_bps;
    market.settlement_fee_bps = 100; // 1% default settlement fee
    market.liquidity_pool = ctx.accounts.liquidity_pool.key();
    market.fee_vault = ctx.accounts.fee_vault.key();
    market.resolution_deadline = resolution_deadline;
    market.total_volume = 0;
    market.total_trades = 0;
    market.created_at = current_time;
    market.resolved_at = 0;
    market.winning_outcome = 255; // Not resolved
    market.bump = ctx.bumps.market;

    // Initialize liquidity pool
    let pool = &mut ctx.accounts.liquidity_pool;
    pool.market = market.key();

    // Initialize reserves with equal distribution
    let reserve_per_outcome = initial_liquidity / (outcomes.len() as u64);
    pool.reserves = vec![reserve_per_outcome; outcomes.len()];

    // Calculate initial invariant (k = product of all reserves)
    let mut invariant: u128 = 1;
    for &reserve in pool.reserves.iter() {
        invariant = invariant
            .checked_mul(reserve as u128)
            .ok_or(MarketError::MathOverflow)?;
    }
    pool.invariant = invariant;

    pool.lp_token_supply = initial_liquidity;
    pool.fee_vault = ctx.accounts.fee_vault.key();
    pool.total_fees_collected = 0;
    pool.bump = ctx.bumps.liquidity_pool;

    // Initialize fee vault
    let fee_vault = &mut ctx.accounts.fee_vault;
    fee_vault.market = market.key();
    fee_vault.total_collected = 0;
    fee_vault.total_withdrawn = 0;
    fee_vault.bump = ctx.bumps.fee_vault;

    // Transfer initial liquidity from creator to pool
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: ctx.accounts.liquidity_pool.to_account_info(),
            },
        ),
        initial_liquidity,
    )?;

    // Update market state to Active
    market.state = MarketState::Active;

    // Emit event
    emit!(MarketCreated {
        market_id,
        market: market.key(),
        creator: ctx.accounts.creator.key(),
        question_text,
        num_outcomes: outcomes.len() as u8,
        trading_fee_bps,
        resolution_deadline,
        timestamp: current_time,
    });

    msg!("Market {} created successfully", market_id);
    msg!("Outcomes: {}", outcomes.len());
    msg!("Initial liquidity: {} lamports", initial_liquidity);

    Ok(())
}
