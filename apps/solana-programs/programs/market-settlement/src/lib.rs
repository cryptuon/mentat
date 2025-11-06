use anchor_lang::prelude::*;

declare_id!("mktRU9S5U6cKzX6dvKeyUgm8g8VPRZxuzizfNX18cR1");

pub mod state;
pub mod instructions;
pub mod events;
pub mod errors;
pub mod constants;

use instructions::*;

#[program]
pub mod market_settlement {
    use super::*;

    /// Submit proof of outcome for market resolution
    pub fn submit_proof(
        ctx: Context<SubmitProof>,
        proof_data: String,
        outcome_index: u8,
    ) -> Result<()> {
        instructions::submit_proof::handler(ctx, proof_data, outcome_index)
    }

    /// Verify submitted proof
    pub fn verify_proof(
        ctx: Context<VerifyProof>,
        proof_id: u64,
        is_valid: bool,
    ) -> Result<()> {
        instructions::verify_proof::handler(ctx, proof_id, is_valid)
    }

    /// Resolve market with verified outcome
    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        winning_outcome: u8,
    ) -> Result<()> {
        instructions::resolve_market::handler(ctx, winning_outcome)
    }

    /// Claim payout for winning positions
    pub fn claim_payout(ctx: Context<ClaimPayout>) -> Result<()> {
        instructions::claim_payout::handler(ctx)
    }

    /// Open dispute for market resolution
    pub fn open_dispute(
        ctx: Context<OpenDispute>,
        reason: String,
        stake_amount: u64,
    ) -> Result<()> {
        instructions::open_dispute::handler(ctx, reason, stake_amount)
    }

    /// Resolve dispute
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        dispute_id: u64,
        resolution: u8,
    ) -> Result<()> {
        instructions::resolve_dispute::handler(ctx, dispute_id, resolution)
    }
}
