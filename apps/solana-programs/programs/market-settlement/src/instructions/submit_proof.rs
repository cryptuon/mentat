use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::SettlementError;
use crate::events::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(proof_data: String, outcome_index: u8)]
pub struct SubmitProof<'info> {
    /// Proof submitter
    #[account(mut)]
    pub submitter: Signer<'info>,

    /// Market account (from market-factory program)
    /// CHECK: We only read market state, validated by market program
    pub market: AccountInfo<'info>,

    /// Resolution account for this market
    #[account(
        init_if_needed,
        payer = submitter,
        space = ResolutionAccount::LEN,
        seeds = [RESOLUTION_SEED, market.key().as_ref()],
        bump,
    )]
    pub resolution: Account<'info, ResolutionAccount>,

    /// Proof account
    #[account(
        init,
        payer = submitter,
        space = ProofAccount::LEN,
        seeds = [
            PROOF_SEED,
            market.key().as_ref(),
            resolution.total_proofs.to_le_bytes().as_ref(),
        ],
        bump,
    )]
    pub proof: Account<'info, ProofAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SubmitProof>,
    proof_data: String,
    outcome_index: u8,
) -> Result<()> {
    // Validate proof data length
    require!(
        proof_data.len() <= MAX_PROOF_DATA_LENGTH,
        SettlementError::ProofDataTooLong
    );

    // Check concurrent proofs limit
    require!(
        ctx.accounts.resolution.total_proofs < MAX_CONCURRENT_PROOFS,
        SettlementError::TooManyProofs
    );

    let resolution = &mut ctx.accounts.resolution;
    let proof = &mut ctx.accounts.proof;

    // Initialize resolution if new
    if resolution.market == Pubkey::default() {
        resolution.market = ctx.accounts.market.key();
        resolution.resolver = Pubkey::default();
        resolution.winning_outcome = 255; // Not resolved yet
        resolution.total_proofs = 0;
        resolution.verified_proofs = 0;
        resolution.total_payout = 0;
        resolution.claimed_amount = 0;
        resolution.claim_count = 0;
        resolution.resolved_at = 0;
        resolution.settlement_deadline = 0;
        resolution.is_disputed = false;
        resolution.bump = ctx.bumps.resolution;
    }

    // Initialize proof
    let proof_id = resolution.total_proofs;
    proof.market = ctx.accounts.market.key();
    proof.submitter = ctx.accounts.submitter.key();
    proof.proof_id = proof_id;
    proof.outcome_index = outcome_index;
    proof.proof_data = proof_data.clone();
    proof.status = ProofStatus::Pending;
    proof.verifier = Pubkey::default();
    proof.verification_count = 0;
    proof.submitted_at = Clock::get()?.unix_timestamp;
    proof.verified_at = 0;
    proof.bump = ctx.bumps.proof;

    // Update resolution stats
    resolution.total_proofs = resolution
        .total_proofs
        .checked_add(1)
        .ok_or(SettlementError::MathOverflow)?;

    emit!(ProofSubmitted {
        market: ctx.accounts.market.key(),
        proof_id,
        submitter: ctx.accounts.submitter.key(),
        outcome_index,
        proof_data,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
        "Proof {} submitted for outcome {} on market {}",
        proof_id,
        outcome_index,
        ctx.accounts.market.key()
    );

    Ok(())
}
