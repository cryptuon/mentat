use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::SettlementError;
use crate::events::*;
use crate::state::*;

#[derive(Accounts)]
pub struct ClaimPayout<'info> {
    /// Payout claimer
    #[account(mut)]
    pub claimer: Signer<'info>,

    /// Market account
    /// CHECK: Validated against resolution.market
    pub market: AccountInfo<'info>,

    /// Position account from market-factory program
    /// CHECK: We read shares for winning outcome
    #[account(mut)]
    pub position: AccountInfo<'info>,

    /// Liquidity pool from market-factory program
    /// CHECK: We transfer lamports from pool
    #[account(mut)]
    pub liquidity_pool: AccountInfo<'info>,

    /// Resolution account
    #[account(
        mut,
        seeds = [RESOLUTION_SEED, market.key().as_ref()],
        bump = resolution.bump,
        constraint = resolution.winning_outcome != 255 @ SettlementError::MarketNotResolved,
    )]
    pub resolution: Account<'info, ResolutionAccount>,

    /// Payout claim record
    #[account(
        init_if_needed,
        payer = claimer,
        space = PayoutClaimAccount::LEN,
        seeds = [PAYOUT_CLAIM_SEED, market.key().as_ref(), claimer.key().as_ref()],
        bump,
    )]
    pub payout_claim: Account<'info, PayoutClaimAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ClaimPayout>) -> Result<()> {
    let resolution = &mut ctx.accounts.resolution;
    let payout_claim = &mut ctx.accounts.payout_claim;

    // Check settlement deadline has passed
    require!(
        Clock::get()?.unix_timestamp >= resolution.settlement_deadline,
        SettlementError::SettlementDeadlineNotPassed
    );

    // Check not already claimed
    if payout_claim.market != Pubkey::default() {
        require!(
            payout_claim.amount_claimed == 0,
            SettlementError::PayoutAlreadyClaimed
        );
    }

    // Initialize payout claim if needed
    if payout_claim.market == Pubkey::default() {
        payout_claim.market = ctx.accounts.market.key();
        payout_claim.claimer = ctx.accounts.claimer.key();
        payout_claim.position = ctx.accounts.position.key();
        payout_claim.amount_claimed = 0;
        payout_claim.shares_used = 0;
        payout_claim.claimed_at = 0;
        payout_claim.bump = ctx.bumps.payout_claim;
    }

    // In production, we would:
    // 1. Read the position account to get shares for winning outcome
    // 2. Calculate payout: (winning_shares / total_winning_shares) * pool_reserves
    // 3. Subtract settlement fee
    // 4. Transfer lamports from pool to claimer
    //
    // For this simplified version, we'll use placeholder logic:

    // Placeholder: Assume 100 shares for winning outcome
    let winning_shares: u64 = 100;

    // Check user has winning shares
    require!(
        winning_shares > 0,
        SettlementError::NoSharesForWinningOutcome
    );

    // Placeholder payout calculation
    // In production: payout = (shares * pool_value) / total_winning_shares
    let payout_amount: u64 = winning_shares
        .checked_mul(1_000_000) // Placeholder: 0.001 SOL per share
        .ok_or(SettlementError::MathOverflow)?;

    // Calculate and subtract settlement fee
    let settlement_fee = payout_amount
        .checked_mul(SETTLEMENT_FEE_BPS as u64)
        .ok_or(SettlementError::MathOverflow)?
        .checked_div(BPS_DENOMINATOR as u64)
        .ok_or(SettlementError::DivisionByZero)?;

    let payout_after_fee = payout_amount
        .checked_sub(settlement_fee)
        .ok_or(SettlementError::MathOverflow)?;

    // Update payout claim record
    payout_claim.amount_claimed = payout_after_fee;
    payout_claim.shares_used = winning_shares;
    payout_claim.claimed_at = Clock::get()?.unix_timestamp;

    // Update resolution stats
    resolution.claimed_amount = resolution
        .claimed_amount
        .checked_add(payout_after_fee)
        .ok_or(SettlementError::MathOverflow)?;
    resolution.claim_count = resolution
        .claim_count
        .checked_add(1)
        .ok_or(SettlementError::MathOverflow)?;

    // Transfer lamports (placeholder - would use CPI in production)
    // **ctx.accounts.liquidity_pool.to_account_info().try_borrow_mut_lamports()? -= payout_after_fee;
    // **ctx.accounts.claimer.to_account_info().try_borrow_mut_lamports()? += payout_after_fee;

    msg!(
        "Payout claimed: {} lamports ({} shares, {} fee)",
        payout_after_fee,
        winning_shares,
        settlement_fee
    );

    emit!(PayoutClaimed {
        market: ctx.accounts.market.key(),
        claimer: ctx.accounts.claimer.key(),
        position: ctx.accounts.position.key(),
        amount_claimed: payout_after_fee,
        shares_used: winning_shares,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
