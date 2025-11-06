use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::*;
use crate::errors::SettlementError;
use crate::events::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(reason: String, stake_amount: u64)]
pub struct OpenDispute<'info> {
    /// Disputer
    #[account(mut)]
    pub disputer: Signer<'info>,

    /// Market account
    /// CHECK: Validated against resolution.market
    pub market: AccountInfo<'info>,

    /// Resolution account
    #[account(
        mut,
        seeds = [RESOLUTION_SEED, market.key().as_ref()],
        bump = resolution.bump,
        constraint = resolution.winning_outcome != 255 @ SettlementError::MarketNotResolved,
    )]
    pub resolution: Account<'info, ResolutionAccount>,

    /// Dispute account
    #[account(
        init,
        payer = disputer,
        space = DisputeAccount::LEN,
        seeds = [DISPUTE_SEED, market.key().as_ref(), disputer.key().as_ref()],
        bump,
    )]
    pub dispute: Account<'info, DisputeAccount>,

    /// Dispute stake vault
    /// CHECK: PDA that holds dispute stakes
    #[account(
        mut,
        seeds = [b"dispute_vault", market.key().as_ref()],
        bump,
    )]
    pub dispute_vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<OpenDispute>,
    reason: String,
    stake_amount: u64,
) -> Result<()> {
    // Validate dispute reason length
    require!(
        reason.len() <= MAX_DISPUTE_REASON_LENGTH,
        SettlementError::DisputeReasonTooLong
    );

    // Validate stake amount
    require!(
        stake_amount >= MIN_DISPUTE_STAKE,
        SettlementError::InsufficientDisputeStake
    );

    let resolution = &mut ctx.accounts.resolution;
    let dispute = &mut ctx.accounts.dispute;

    // Check dispute period hasn't expired
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time <= resolution.settlement_deadline,
        SettlementError::DisputePeriodExpired
    );

    // Generate dispute ID
    let dispute_id = current_time as u64;

    // Initialize dispute
    dispute.market = ctx.accounts.market.key();
    dispute.disputer = ctx.accounts.disputer.key();
    dispute.dispute_id = dispute_id;
    dispute.reason = reason.clone();
    dispute.original_outcome = resolution.winning_outcome;
    dispute.proposed_outcome = 255; // To be determined
    dispute.stake_amount = stake_amount;
    dispute.status = DisputeStatus::Open;
    dispute.resolver = Pubkey::default();
    dispute.opened_at = current_time;
    dispute.resolved_at = 0;
    dispute.bump = ctx.bumps.dispute;

    // Mark resolution as disputed
    resolution.is_disputed = true;

    // Transfer dispute stake to vault
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.disputer.to_account_info(),
                to: ctx.accounts.dispute_vault.to_account_info(),
            },
        ),
        stake_amount,
    )?;

    msg!(
        "Dispute {} opened for market {}",
        dispute_id,
        ctx.accounts.market.key()
    );
    msg!("Stake amount: {} lamports", stake_amount);
    msg!("Dispute reason: {}", reason);

    emit!(DisputeOpened {
        market: ctx.accounts.market.key(),
        dispute_id,
        disputer: ctx.accounts.disputer.key(),
        original_outcome: dispute.original_outcome,
        proposed_outcome: dispute.proposed_outcome,
        stake_amount,
        reason,
        timestamp: current_time,
    });

    Ok(())
}
