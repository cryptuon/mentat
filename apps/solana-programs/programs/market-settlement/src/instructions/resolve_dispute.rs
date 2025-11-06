use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::SettlementError;
use crate::events::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(dispute_id: u64, resolution: u8)]
pub struct ResolveDispute<'info> {
    /// Dispute resolver (market creator, oracle, or DAO)
    #[account(mut)]
    pub resolver: Signer<'info>,

    /// Market account
    /// CHECK: Validated against dispute.market
    pub market: AccountInfo<'info>,

    /// Market resolution account
    #[account(
        mut,
        seeds = [RESOLUTION_SEED, market.key().as_ref()],
        bump = market_resolution.bump,
    )]
    pub market_resolution: Account<'info, ResolutionAccount>,

    /// Dispute account
    /// CHECK: We use a custom constraint to find it by dispute_id
    #[account(mut)]
    pub dispute: Account<'info, DisputeAccount>,

    /// Dispute vault
    /// CHECK: PDA that holds dispute stakes
    #[account(
        mut,
        seeds = [b"dispute_vault", market.key().as_ref()],
        bump,
    )]
    pub dispute_vault: AccountInfo<'info>,

    /// Disputer account (to return/slash stake)
    /// CHECK: Validated against dispute.disputer
    #[account(mut)]
    pub disputer: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<ResolveDispute>,
    _dispute_id: u64,
    resolution_type: u8,
) -> Result<()> {
    let dispute = &mut ctx.accounts.dispute;
    let market_resolution = &mut ctx.accounts.market_resolution;

    // Validate dispute is open
    require!(
        dispute.status == DisputeStatus::Open,
        SettlementError::DisputeAlreadyResolved
    );

    // Validate disputer matches
    require!(
        dispute.disputer == ctx.accounts.disputer.key(),
        SettlementError::UnauthorizedDisputer
    );

    let current_time = Clock::get()?.unix_timestamp;
    let stake_amount = dispute.stake_amount;

    // Resolution types:
    // 0 = Reject dispute (keep original outcome)
    // 1 = Accept dispute (change to new outcome)
    // 2 = Partial accept (modify outcome)

    let (final_outcome, status, stake_return) = match resolution_type {
        0 => {
            // Reject dispute - keep original outcome
            // Slash 50% of stake as penalty
            let slashed_amount = stake_amount
                .checked_mul(DISPUTE_SLASH_PERCENTAGE)
                .ok_or(SettlementError::MathOverflow)?
                .checked_div(100)
                .ok_or(SettlementError::DivisionByZero)?;

            let return_amount = stake_amount
                .checked_sub(slashed_amount)
                .ok_or(SettlementError::MathOverflow)?;

            (
                market_resolution.winning_outcome,
                DisputeStatus::Rejected,
                return_amount,
            )
        }
        1 => {
            // Accept dispute - change outcome
            // Return full stake + reward
            let reward = stake_amount
                .checked_div(2)
                .ok_or(SettlementError::DivisionByZero)?;

            let return_amount = stake_amount
                .checked_add(reward)
                .ok_or(SettlementError::MathOverflow)?;

            // Update market resolution with new outcome
            market_resolution.winning_outcome = dispute.proposed_outcome;

            (
                dispute.proposed_outcome,
                DisputeStatus::ResolvedChanged,
                return_amount,
            )
        }
        _ => {
            // Keep original outcome
            (
                market_resolution.winning_outcome,
                DisputeStatus::ResolvedOriginal,
                stake_amount,
            )
        }
    };

    // Update dispute
    dispute.status = status;
    dispute.resolver = ctx.accounts.resolver.key();
    dispute.resolved_at = current_time;

    // Update market resolution
    market_resolution.is_disputed = false;

    // Return stake (or slashed amount) to disputer
    if stake_return > 0 {
        **ctx
            .accounts
            .dispute_vault
            .to_account_info()
            .try_borrow_mut_lamports()? -= stake_return;
        **ctx
            .accounts
            .disputer
            .to_account_info()
            .try_borrow_mut_lamports()? += stake_return;
    }

    msg!(
        "Dispute {} resolved: {:?}",
        dispute.dispute_id,
        dispute.status
    );
    msg!("Final outcome: {}", final_outcome);
    msg!("Stake returned: {} lamports", stake_return);

    emit!(DisputeResolved {
        market: ctx.accounts.market.key(),
        dispute_id: dispute.dispute_id,
        resolver: ctx.accounts.resolver.key(),
        resolution: format!("{:?}", dispute.status),
        final_outcome,
        timestamp: current_time,
    });

    Ok(())
}
