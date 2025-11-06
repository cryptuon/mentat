use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::SettlementError;
use crate::events::*;
use crate::state::*;

// External program - market factory
declare_id!("3sgfKweTHC5EZgGsh6CCcgP9Bqppb5UA6CwgAcHbF9va");

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    /// Market resolver (creator or oracle)
    #[account(mut)]
    pub resolver: Signer<'info>,

    /// Market account from market-factory program
    /// CHECK: CPI call will validate this
    #[account(mut)]
    pub market: AccountInfo<'info>,

    /// Liquidity pool from market-factory program
    /// CHECK: Validated by market program
    #[account(mut)]
    pub liquidity_pool: AccountInfo<'info>,

    /// Resolution account
    #[account(
        mut,
        seeds = [RESOLUTION_SEED, market.key().as_ref()],
        bump = resolution.bump,
        constraint = !resolution.is_disputed @ SettlementError::MarketUnderDispute,
    )]
    pub resolution: Account<'info, ResolutionAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ResolveMarket>, winning_outcome: u8) -> Result<()> {
    let resolution = &mut ctx.accounts.resolution;

    // Check resolution not already done
    require!(
        resolution.winning_outcome == 255,
        SettlementError::MarketAlreadyResolved
    );

    // Ensure minimum verifications met (at least 1 verified proof)
    require!(
        resolution.verified_proofs >= MIN_VERIFICATIONS as u64,
        SettlementError::MinVerificationsNotMet
    );

    // Update resolution
    resolution.resolver = ctx.accounts.resolver.key();
    resolution.winning_outcome = winning_outcome;
    resolution.resolved_at = Clock::get()?.unix_timestamp;

    // Set settlement deadline (24 hours from now for disputes)
    resolution.settlement_deadline = Clock::get()?
        .unix_timestamp
        .checked_add(MIN_SETTLEMENT_DELAY)
        .ok_or(SettlementError::MathOverflow)?;

    // Calculate total payout from liquidity pool
    // For simplicity, we'll set this during claim_payout
    // In production, this would read from the liquidity pool account
    resolution.total_payout = 0; // Will be calculated during claims

    msg!(
        "Market {} resolved with outcome {}",
        ctx.accounts.market.key(),
        winning_outcome
    );
    msg!("Settlement deadline: {}", resolution.settlement_deadline);
    msg!("Dispute period open until: {}", resolution.settlement_deadline);

    // Emit resolution event
    emit!(MarketResolved {
        market: ctx.accounts.market.key(),
        resolver: ctx.accounts.resolver.key(),
        winning_outcome,
        total_payout: resolution.total_payout,
        settlement_deadline: resolution.settlement_deadline,
        timestamp: Clock::get()?.unix_timestamp,
    });

    // Note: In production, we would make a CPI call to market-factory
    // to update the market state to Resolved. For now, this is a simplified version.
    // Example CPI call (commented out):
    /*
    let cpi_program = ctx.accounts.market_factory_program.to_account_info();
    let cpi_accounts = UpdateMarketState {
        authority: ctx.accounts.resolver.to_account_info(),
        market: ctx.accounts.market.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    market_factory::cpi::update_market_state(cpi_ctx, 3)?; // 3 = Resolved
    */

    Ok(())
}
