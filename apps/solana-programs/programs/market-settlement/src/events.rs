use anchor_lang::prelude::*;

/// Event emitted when proof is submitted
#[event]
pub struct ProofSubmitted {
    pub market: Pubkey,
    pub proof_id: u64,
    pub submitter: Pubkey,
    pub outcome_index: u8,
    pub proof_data: String,
    pub timestamp: i64,
}

/// Event emitted when proof is verified
#[event]
pub struct ProofVerified {
    pub market: Pubkey,
    pub proof_id: u64,
    pub verifier: Pubkey,
    pub is_valid: bool,
    pub timestamp: i64,
}

/// Event emitted when market is resolved
#[event]
pub struct MarketResolved {
    pub market: Pubkey,
    pub resolver: Pubkey,
    pub winning_outcome: u8,
    pub total_payout: u64,
    pub settlement_deadline: i64,
    pub timestamp: i64,
}

/// Event emitted when payout is claimed
#[event]
pub struct PayoutClaimed {
    pub market: Pubkey,
    pub claimer: Pubkey,
    pub position: Pubkey,
    pub amount_claimed: u64,
    pub shares_used: u64,
    pub timestamp: i64,
}

/// Event emitted when dispute is opened
#[event]
pub struct DisputeOpened {
    pub market: Pubkey,
    pub dispute_id: u64,
    pub disputer: Pubkey,
    pub original_outcome: u8,
    pub proposed_outcome: u8,
    pub stake_amount: u64,
    pub reason: String,
    pub timestamp: i64,
}

/// Event emitted when dispute is resolved
#[event]
pub struct DisputeResolved {
    pub market: Pubkey,
    pub dispute_id: u64,
    pub resolver: Pubkey,
    pub resolution: String,
    pub final_outcome: u8,
    pub timestamp: i64,
}
