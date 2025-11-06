use anchor_lang::prelude::*;

#[error_code]
pub enum MarketError {
    #[msg("Invalid market state transition")]
    InvalidStateTransition,

    #[msg("Market is not active for trading")]
    MarketNotActive,

    #[msg("Market has already been resolved")]
    MarketAlreadyResolved,

    #[msg("Resolution deadline not reached")]
    ResolutionDeadlineNotReached,

    #[msg("Resolution deadline has passed")]
    ResolutionDeadlinePassed,

    #[msg("Invalid outcome index")]
    InvalidOutcomeIndex,

    #[msg("Invalid number of outcomes")]
    InvalidNumberOfOutcomes,

    #[msg("Question text too long")]
    QuestionTextTooLong,

    #[msg("Trading fee exceeds maximum")]
    TradingFeeTooHigh,

    #[msg("Settlement fee exceeds maximum")]
    SettlementFeeTooHigh,

    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,

    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,

    #[msg("Amount must be greater than zero")]
    InvalidAmount,

    #[msg("Insufficient shares to sell")]
    InsufficientShares,

    #[msg("Unauthorized: Only creator can perform this action")]
    Unauthorized,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Division by zero")]
    DivisionByZero,

    #[msg("Invalid reserves configuration")]
    InvalidReserves,

    #[msg("Invariant calculation failed")]
    InvariantCalculationFailed,

    #[msg("LP tokens cannot be zero")]
    InvalidLPTokens,

    #[msg("Market cannot be closed yet")]
    CannotCloseMarket,

    #[msg("No fees to withdraw")]
    NoFeesToWithdraw,

    #[msg("Market must be settled before closing")]
    MarketNotSettled,

    #[msg("Pool is not empty - positions still exist")]
    PoolNotEmpty,
}
