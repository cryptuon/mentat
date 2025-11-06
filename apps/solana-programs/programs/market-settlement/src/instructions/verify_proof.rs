use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::SettlementError;
use crate::events::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(proof_id: u64)]
pub struct VerifyProof<'info> {
    /// Verifier (market creator or designated oracle)
    #[account(mut)]
    pub verifier: Signer<'info>,

    /// Market account
    /// CHECK: Validated against proof.market
    pub market: AccountInfo<'info>,

    /// Resolution account
    #[account(
        mut,
        seeds = [RESOLUTION_SEED, market.key().as_ref()],
        bump = resolution.bump,
    )]
    pub resolution: Account<'info, ResolutionAccount>,

    /// Proof account to verify
    #[account(
        mut,
        seeds = [PROOF_SEED, market.key().as_ref(), proof_id.to_le_bytes().as_ref()],
        bump = proof.bump,
        constraint = proof.market == market.key(),
    )]
    pub proof: Account<'info, ProofAccount>,
}

pub fn handler(
    ctx: Context<VerifyProof>,
    _proof_id: u64,
    is_valid: bool,
) -> Result<()> {
    let proof = &mut ctx.accounts.proof;
    let resolution = &mut ctx.accounts.resolution;

    // Check proof is in pending state
    require!(
        proof.status == ProofStatus::Pending,
        SettlementError::InvalidProofStatusTransition
    );

    // Update proof status
    if is_valid {
        proof.status = ProofStatus::Verified;
        proof.verifier = ctx.accounts.verifier.key();
        proof.verification_count = proof
            .verification_count
            .checked_add(1)
            .ok_or(SettlementError::MathOverflow)?;
        proof.verified_at = Clock::get()?.unix_timestamp;

        // Update resolution stats
        resolution.verified_proofs = resolution
            .verified_proofs
            .checked_add(1)
            .ok_or(SettlementError::MathOverflow)?;

        msg!("Proof {} verified as valid", proof.proof_id);
    } else {
        proof.status = ProofStatus::Rejected;
        proof.verifier = ctx.accounts.verifier.key();
        proof.verified_at = Clock::get()?.unix_timestamp;

        msg!("Proof {} rejected as invalid", proof.proof_id);
    }

    emit!(ProofVerified {
        market: ctx.accounts.market.key(),
        proof_id: proof.proof_id,
        verifier: ctx.accounts.verifier.key(),
        is_valid,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
