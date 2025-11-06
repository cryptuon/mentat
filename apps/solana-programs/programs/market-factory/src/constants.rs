/// Program constants

/// Seeds for PDAs
pub const MARKET_SEED: &[u8] = b"market";
pub const POOL_SEED: &[u8] = b"pool";
pub const FEE_VAULT_SEED: &[u8] = b"fee_vault";
pub const POSITION_SEED: &[u8] = b"position";
pub const LP_POSITION_SEED: &[u8] = b"lp_position";

/// Basis points (10000 = 100%)
pub const BPS_DENOMINATOR: u16 = 10000;

/// Maximum trading fee (5%)
pub const MAX_TRADING_FEE_BPS: u16 = 500;

/// Maximum settlement fee (2%)
pub const MAX_SETTLEMENT_FEE_BPS: u16 = 200;

/// Maximum slippage allowed (20%)
pub const MAX_SLIPPAGE_BPS: u16 = 2000;

/// Minimum liquidity required
pub const MIN_LIQUIDITY: u64 = 1_000_000; // 0.001 SOL

/// Maximum number of outcomes per market
pub const MAX_OUTCOMES: u8 = 10;

/// Minimum number of outcomes
pub const MIN_OUTCOMES: u8 = 2;

/// Maximum question text length
pub const MAX_QUESTION_LENGTH: usize = 280;

/// Decimal precision for price calculations
pub const PRICE_PRECISION: u64 = 1_000_000_000; // 9 decimals

/// Minimum time until resolution (1 hour)
pub const MIN_RESOLUTION_DELAY: i64 = 3600;
