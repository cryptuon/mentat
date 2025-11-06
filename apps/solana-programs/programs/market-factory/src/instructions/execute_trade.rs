use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::*;
use crate::errors::MarketError;
use crate::events::*;
use crate::state::*;

#[derive(Accounts)]
pub struct ExecuteTrade<'info> {
    /// Trader
    #[account(mut)]
    pub trader: Signer<'info>,

    /// Market account
    #[account(
        mut,
        constraint = market.state == MarketState::Active @ MarketError::MarketNotActive,
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

    /// Trader's position account
    #[account(
        init_if_needed,
        payer = trader,
        space = PositionAccount::LEN,
        seeds = [POSITION_SEED, market.key().as_ref(), trader.key().as_ref()],
        bump,
    )]
    pub position: Account<'info, PositionAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<ExecuteTrade>,
    outcome_index: u8,
    amount: u64,
    is_buy: bool,
    max_slippage_bps: u16,
) -> Result<()> {
    // Validate inputs
    require!(amount > 0, MarketError::InvalidAmount);
    require!(
        outcome_index < ctx.accounts.market.num_outcomes,
        MarketError::InvalidOutcomeIndex
    );
    require!(
        max_slippage_bps <= MAX_SLIPPAGE_BPS,
        MarketError::SlippageExceeded
    );

    let market = &mut ctx.accounts.market;
    let pool = &mut ctx.accounts.liquidity_pool;
    let fee_vault = &mut ctx.accounts.fee_vault;
    let position = &mut ctx.accounts.position;

    // Initialize position if new
    if position.owner == Pubkey::default() {
        position.market = market.key();
        position.owner = ctx.accounts.trader.key();
        position.shares = vec![0; market.num_outcomes as usize];
        position.total_invested = 0;
        position.realized_pnl = 0;
        position.last_updated = Clock::get()?.unix_timestamp;
        position.bump = ctx.bumps.position;
    }

    // Calculate fee
    let fee = amount
        .checked_mul(market.trading_fee_bps as u64)
        .ok_or(MarketError::MathOverflow)?
        .checked_div(BPS_DENOMINATOR as u64)
        .ok_or(MarketError::DivisionByZero)?;

    let amount_after_fee = amount.checked_sub(fee).ok_or(MarketError::MathOverflow)?;

    // Calculate shares and execute trade
    let (shares, price) = if is_buy {
        // BUY: Calculate shares received for amount
        let shares = calculate_shares_for_buy(
            pool,
            outcome_index,
            amount_after_fee,
        )?;

        // Check slippage
        let expected_price = calculate_price(amount_after_fee, shares);
        check_slippage(expected_price, max_slippage_bps)?;

        // Update pool reserves (add lamports, decrease outcome tokens)
        pool.reserves[outcome_index as usize] = pool.reserves[outcome_index as usize]
            .checked_add(amount_after_fee)
            .ok_or(MarketError::MathOverflow)?;

        // Update position
        position.shares[outcome_index as usize] = position.shares[outcome_index as usize]
            .checked_add(shares)
            .ok_or(MarketError::MathOverflow)?;
        position.total_invested = position.total_invested
            .checked_add(amount)
            .ok_or(MarketError::MathOverflow)?;

        // Transfer lamports from trader to pool
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.trader.to_account_info(),
                    to: pool.to_account_info(),
                },
            ),
            amount_after_fee,
        )?;

        (shares, expected_price)
    } else {
        // SELL: Check if trader has enough shares
        require!(
            position.shares[outcome_index as usize] >= amount_after_fee,
            MarketError::InsufficientShares
        );

        // Calculate lamports received for shares
        let lamports = calculate_lamports_for_sell(
            pool,
            outcome_index,
            amount_after_fee,
        )?;

        // Check slippage
        let expected_price = calculate_price(lamports, amount_after_fee);
        check_slippage(expected_price, max_slippage_bps)?;

        // Update pool reserves (remove lamports, increase outcome tokens)
        pool.reserves[outcome_index as usize] = pool.reserves[outcome_index as usize]
            .checked_sub(lamports)
            .ok_or(MarketError::InsufficientLiquidity)?;

        // Update position
        position.shares[outcome_index as usize] = position.shares[outcome_index as usize]
            .checked_sub(amount_after_fee)
            .ok_or(MarketError::MathOverflow)?;

        // Calculate realized P&L
        let cost_basis = position.total_invested
            .checked_mul(amount_after_fee)
            .ok_or(MarketError::MathOverflow)?
            .checked_div(position.shares.iter().sum::<u64>())
            .ok_or(MarketError::DivisionByZero)?;
        let pnl = (lamports as i64).checked_sub(cost_basis as i64)
            .ok_or(MarketError::MathOverflow)?;
        position.realized_pnl = position.realized_pnl.checked_add(pnl)
            .ok_or(MarketError::MathOverflow)?;

        // Transfer lamports from pool to trader
        **pool.to_account_info().try_borrow_mut_lamports()? -= lamports;
        **ctx.accounts.trader.to_account_info().try_borrow_mut_lamports()? += lamports;

        (amount_after_fee, expected_price)
    };

    // Transfer fee to fee vault
    if fee > 0 {
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.trader.to_account_info(),
                    to: fee_vault.to_account_info(),
                },
            ),
            fee,
        )?;

        fee_vault.total_collected = fee_vault.total_collected
            .checked_add(fee)
            .ok_or(MarketError::MathOverflow)?;
        pool.total_fees_collected = pool.total_fees_collected
            .checked_add(fee)
            .ok_or(MarketError::MathOverflow)?;
    }

    // Update market stats
    market.total_volume = market.total_volume
        .checked_add(amount)
        .ok_or(MarketError::MathOverflow)?;
    market.total_trades = market.total_trades
        .checked_add(1)
        .ok_or(MarketError::MathOverflow)?;

    position.last_updated = Clock::get()?.unix_timestamp;

    // Emit event
    emit!(TradeExecuted {
        market: market.key(),
        trader: ctx.accounts.trader.key(),
        outcome_index,
        is_buy,
        amount,
        price,
        fee,
        shares,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
        "Trade executed: {} {} shares of outcome {} at price {}",
        if is_buy { "Bought" } else { "Sold" },
        shares,
        outcome_index,
        price
    );

    Ok(())
}

/// Calculate shares received when buying
fn calculate_shares_for_buy(
    pool: &LiquidityPoolAccount,
    outcome_index: u8,
    amount: u64,
) -> Result<u64> {
    // Using constant product formula: x * y = k
    // shares = reserve / (1 + amount/reserve) - reserve
    let reserve = pool.reserves[outcome_index as usize];

    // Simplified calculation for better precision
    let new_reserve = reserve
        .checked_add(amount)
        .ok_or(MarketError::MathOverflow)?;

    // Calculate shares based on price impact
    let shares = (amount as u128)
        .checked_mul(reserve as u128)
        .ok_or(MarketError::MathOverflow)?
        .checked_div(new_reserve as u128)
        .ok_or(MarketError::DivisionByZero)? as u64;

    Ok(shares)
}

/// Calculate lamports received when selling
fn calculate_lamports_for_sell(
    pool: &LiquidityPoolAccount,
    outcome_index: u8,
    shares: u64,
) -> Result<u64> {
    // Using constant product formula
    let reserve = pool.reserves[outcome_index as usize];

    // Ensure we have enough liquidity
    require!(reserve > shares, MarketError::InsufficientLiquidity);

    let lamports = (shares as u128)
        .checked_mul(reserve as u128)
        .ok_or(MarketError::MathOverflow)?
        .checked_div((reserve as u128).checked_add(shares as u128).ok_or(MarketError::MathOverflow)?)
        .ok_or(MarketError::DivisionByZero)? as u64;

    Ok(lamports)
}

/// Calculate price with precision
fn calculate_price(lamports: u64, shares: u64) -> u64 {
    if shares == 0 {
        return 0;
    }
    (lamports as u128)
        .checked_mul(PRICE_PRECISION as u128)
        .unwrap_or(0)
        .checked_div(shares as u128)
        .unwrap_or(0) as u64
}

/// Check if slippage is within tolerance
fn check_slippage(_price: u64, max_slippage_bps: u16) -> Result<()> {
    // For now, basic check - can be enhanced with oracle price
    require!(
        max_slippage_bps <= MAX_SLIPPAGE_BPS,
        MarketError::SlippageExceeded
    );
    Ok(())
}
