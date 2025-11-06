use anchor_lang::prelude::*;

/// Proof submission status
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum ProofStatus {
    /// Proof submitted, pending verification
    Pending = 0,
    /// Proof verified as valid
    Verified = 1,
    /// Proof rejected as invalid
    Rejected = 2,
    /// Proof under dispute
    Disputed = 3,
}

/// Dispute resolution status
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum DisputeStatus {
    /// Dispute opened, awaiting resolution
    Open = 0,
    /// Dispute resolved in favor of original resolution
    ResolvedOriginal = 1,
    /// Dispute resolved with new outcome
    ResolvedChanged = 2,
    /// Dispute rejected
    Rejected = 3,
}

/// Proof submission account
#[account]
pub struct ProofAccount {
    /// Associated market
    pub market: Pubkey,

    /// Proof submitter
    pub submitter: Pubkey,

    /// Unique proof ID
    pub proof_id: u64,

    /// Proposed outcome index
    pub outcome_index: u8,

    /// Proof data (URI or hash)
    pub proof_data: String,

    /// Current proof status
    pub status: ProofStatus,

    /// Verifier (if verified/rejected)
    pub verifier: Pubkey,

    /// Number of verifications received
    pub verification_count: u8,

    /// Submission timestamp
    pub submitted_at: i64,

    /// Verification timestamp
    pub verified_at: i64,

    /// PDA bump seed
    pub bump: u8,
}

impl ProofAccount {
    pub const MAX_PROOF_DATA_LEN: usize = 200;
    pub const LEN: usize = 8 + // discriminator
        32 + // market
        32 + // submitter
        8 + // proof_id
        1 + // outcome_index
        4 + Self::MAX_PROOF_DATA_LEN + // proof_data
        1 + // status
        32 + // verifier
        1 + // verification_count
        8 + // submitted_at
        8 + // verified_at
        1; // bump
}

/// Market resolution account
#[account]
pub struct ResolutionAccount {
    /// Associated market
    pub market: Pubkey,

    /// Resolver (market creator or oracle)
    pub resolver: Pubkey,

    /// Winning outcome index
    pub winning_outcome: u8,

    /// Number of proofs submitted
    pub total_proofs: u64,

    /// Number of verified proofs
    pub verified_proofs: u64,

    /// Total payout amount
    pub total_payout: u64,

    /// Amount claimed so far
    pub claimed_amount: u64,

    /// Number of claims processed
    pub claim_count: u64,

    /// Resolution timestamp
    pub resolved_at: i64,

    /// Settlement deadline
    pub settlement_deadline: i64,

    /// Whether resolution is under dispute
    pub is_disputed: bool,

    /// PDA bump seed
    pub bump: u8,
}

impl ResolutionAccount {
    pub const LEN: usize = 8 + // discriminator
        32 + // market
        32 + // resolver
        1 + // winning_outcome
        8 + // total_proofs
        8 + // verified_proofs
        8 + // total_payout
        8 + // claimed_amount
        8 + // claim_count
        8 + // resolved_at
        8 + // settlement_deadline
        1 + // is_disputed
        1; // bump
}

/// Dispute account
#[account]
pub struct DisputeAccount {
    /// Associated market
    pub market: Pubkey,

    /// Dispute initiator
    pub disputer: Pubkey,

    /// Unique dispute ID
    pub dispute_id: u64,

    /// Dispute reason
    pub reason: String,

    /// Original outcome being disputed
    pub original_outcome: u8,

    /// Proposed alternative outcome
    pub proposed_outcome: u8,

    /// Stake amount locked
    pub stake_amount: u64,

    /// Current dispute status
    pub status: DisputeStatus,

    /// Dispute resolver
    pub resolver: Pubkey,

    /// Dispute opened timestamp
    pub opened_at: i64,

    /// Dispute resolved timestamp
    pub resolved_at: i64,

    /// PDA bump seed
    pub bump: u8,
}

impl DisputeAccount {
    pub const MAX_REASON_LEN: usize = 500;
    pub const LEN: usize = 8 + // discriminator
        32 + // market
        32 + // disputer
        8 + // dispute_id
        4 + Self::MAX_REASON_LEN + // reason
        1 + // original_outcome
        1 + // proposed_outcome
        8 + // stake_amount
        1 + // status
        32 + // resolver
        8 + // opened_at
        8 + // resolved_at
        1; // bump
}

/// Payout claim account
#[account]
pub struct PayoutClaimAccount {
    /// Associated market
    pub market: Pubkey,

    /// Claimer address
    pub claimer: Pubkey,

    /// Position used for claim
    pub position: Pubkey,

    /// Amount claimed
    pub amount_claimed: u64,

    /// Shares used for claim
    pub shares_used: u64,

    /// Claim timestamp
    pub claimed_at: i64,

    /// PDA bump seed
    pub bump: u8,
}

impl PayoutClaimAccount {
    pub const LEN: usize = 8 + // discriminator
        32 + // market
        32 + // claimer
        32 + // position
        8 + // amount_claimed
        8 + // shares_used
        8 + // claimed_at
        1; // bump
}
