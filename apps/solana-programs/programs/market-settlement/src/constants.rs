/// PDA Seeds
pub const PROOF_SEED: &[u8] = b"proof";
pub const RESOLUTION_SEED: &[u8] = b"resolution";
pub const DISPUTE_SEED: &[u8] = b"dispute";
pub const PAYOUT_CLAIM_SEED: &[u8] = b"payout_claim";

/// Verification Requirements
pub const MIN_VERIFICATIONS: u8 = 1;
pub const MAX_VERIFICATIONS: u8 = 5;

/// Timing Constants (in seconds)
pub const MIN_SETTLEMENT_DELAY: i64 = 3600; // 1 hour
pub const MAX_SETTLEMENT_DELAY: i64 = 2592000; // 30 days
pub const DISPUTE_PERIOD: i64 = 86400; // 24 hours
pub const DISPUTE_RESOLUTION_TIMEOUT: i64 = 604800; // 7 days

/// Dispute Stakes
pub const MIN_DISPUTE_STAKE: u64 = 1_000_000; // 0.001 SOL
pub const DISPUTE_SLASH_PERCENTAGE: u64 = 50; // 50% of stake slashed if dispute rejected

/// Limits
pub const MAX_PROOF_DATA_LENGTH: usize = 200;
pub const MAX_DISPUTE_REASON_LENGTH: usize = 500;
pub const MAX_CONCURRENT_PROOFS: u64 = 100;

/// Payout Configuration
pub const SETTLEMENT_FEE_BPS: u16 = 100; // 1% settlement fee
pub const BPS_DENOMINATOR: u16 = 10000;
