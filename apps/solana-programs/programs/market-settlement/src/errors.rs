use anchor_lang::prelude::*;

#[error_code]
pub enum SettlementError {
    #[msg("Market is not in resolved state")]
    MarketNotResolved,

    #[msg("Market resolution deadline not reached")]
    ResolutionDeadlineNotReached,

    #[msg("Market is already resolved")]
    MarketAlreadyResolved,

    #[msg("Invalid outcome index")]
    InvalidOutcome,

    #[msg("Proof data exceeds maximum length")]
    ProofDataTooLong,

    #[msg("Dispute reason exceeds maximum length")]
    DisputeReasonTooLong,

    #[msg("Insufficient dispute stake")]
    InsufficientDisputeStake,

    #[msg("Dispute period has expired")]
    DisputePeriodExpired,

    #[msg("Market is under dispute")]
    MarketUnderDispute,

    #[msg("Dispute not found")]
    DisputeNotFound,

    #[msg("Dispute already resolved")]
    DisputeAlreadyResolved,

    #[msg("Proof not verified")]
    ProofNotVerified,

    #[msg("Proof already verified")]
    ProofAlreadyVerified,

    #[msg("Proof already rejected")]
    ProofAlreadyRejected,

    #[msg("No winning shares to claim")]
    NoWinningShares,

    #[msg("Payout already claimed")]
    PayoutAlreadyClaimed,

    #[msg("Settlement deadline not passed")]
    SettlementDeadlineNotPassed,

    #[msg("Unauthorized: Only market creator can perform this action")]
    UnauthorizedCreator,

    #[msg("Unauthorized: Only verifier can perform this action")]
    UnauthorizedVerifier,

    #[msg("Unauthorized: Only disputer can perform this action")]
    UnauthorizedDisputer,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Division by zero")]
    DivisionByZero,

    #[msg("Invalid proof status transition")]
    InvalidProofStatusTransition,

    #[msg("Invalid dispute status transition")]
    InvalidDisputeStatusTransition,

    #[msg("Too many concurrent proofs")]
    TooManyProofs,

    #[msg("Minimum verifications not met")]
    MinVerificationsNotMet,

    #[msg("Position has no shares for winning outcome")]
    NoSharesForWinningOutcome,

    #[msg("Invalid payout calculation")]
    InvalidPayoutCalculation,
}
