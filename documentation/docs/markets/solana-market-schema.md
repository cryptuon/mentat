# Solana Market Account Schema

This document translates the Mentat market specification into concrete Solana program data structures. It assumes Anchor-style serialization (little endian, Borsh) but can be adapted to custom frameworks.

## Account Layouts

### MarketFactory
Singleton authority that creates markets and stores global configuration.

```rust
pub struct MarketFactory {
    pub authority: Pubkey,            // DAO or multisig controlling parameter updates
    pub bump: u8,                     // PDA bump
    pub treasury: Pubkey,             // Treasury fee destination
    pub staking_mint: Pubkey,         // Mint used for creator stakes
    pub quote_mint: Pubkey,           // Default quote asset mint (e.g., USDC)
    pub next_market_id: u64,          // Incrementing counter for market PDA seeds
    pub max_fee_bps: u16,             // Soft cap for total fee percentage (basis points)
    pub min_stake_lamports: u64,      // Protocol-wide minimum creator stake
    pub reserved: [u8; 128],          // Future config (e.g., governance params)
}
```

### MarketAccount
Primary state for each prediction market.

```rust
pub struct MarketAccount {
    pub market_id: u64,
    pub factory: Pubkey,                  // Reference to MarketFactory
    pub creator: Pubkey,                  // Creator wallet (receives fee share)
    pub curator: Pubkey,                  // Curator who approved launch
    pub version: u16,                     // Final pre-launch revision
    pub state: MarketState,               // Current lifecycle state
    pub tags_hash: [u8; 32],              // Hash of topic tag array stored off-chain
    pub question_hash: [u8; 32],          // Hash of canonical question text
    pub rationale_hash: [u8; 32],         // Hash of AI rationale document
    pub metadata_uri: [u8; 200],          // UTF-8 bytes (trimmed/padded) pointing to off-chain metadata (e.g., Arweave CID)
    pub outcome_config: OutcomeConfig,    // Outcome definitions and payout mapping
    pub resolution: ResolutionConfig,     // Proof and timing configuration
    pub economics: EconomicsConfig,       // Fees, stakes, bounty amounts
    pub timestamps: TimestampConfig,      // Creation, open, lock, resolution windows
    pub volume: u128,                     // Cumulative trade volume
    pub liquidity: u64,                   // Current LP liquidity (protocol-defined units)
    pub stake_vault: Pubkey,              // PDA holding creator stake
    pub treasury_vault: Pubkey,           // PDA for protocol fee accrual
    pub proof_bounty_vault: Pubkey,       // PDA storing settlement bounty
    pub dispute_bond_vault: Pubkey,       // PDA holding active dispute bonds
    pub outcome_tokens: [Pubkey; 8],      // SPL mints for outcome tokens (unused entries set to Pubkey::default())
    pub bump: u8,                         // PDA bump seed
    pub reserved: [u8; 63],               // Align to 8 bytes, future proofing
}
```

### ProofSubmission
Records zkTLS proof submissions for auditing and dispute processes.

```rust
pub struct ProofSubmission {
    pub market: Pubkey,
    pub submitter: Pubkey,
    pub proof_hash: [u8; 32],          // Hash of proof artifact (e.g., Poseidon)
    pub source_uri: [u8; 128],         // URI or identifier of verified endpoint
    pub submitted_at: i64,             // Unix timestamp (UTC)
    pub status: ProofStatus,
    pub verifier_result: [u8; 64],     // Optional serialized verification output
    pub reserved: [u8; 64],
}
```

### DisputeAccount
Represents an active dispute tied to a market resolution.

```rust
pub struct DisputeAccount {
    pub market: Pubkey,
    pub challenger: Pubkey,
    pub bond_vault: Pubkey,
    pub filed_at: i64,
    pub evidence_uri: [u8; 200],      // Off-chain bundle with counter-proof
    pub status: DisputeStatus,
    pub ruling: Option<Ruling>,       // Populated when resolved
}
```

## Enums & Nested Structs

```rust
#[repr(u8)]
pub enum MarketState {
    Draft = 0,
    PendingLaunch = 1,
    Active = 2,
    Locked = 3,
    ResolvedYes = 4,
    ResolvedNo = 5,
    ResolvedIndex(u8) = 6, // For multi-outcome: index of winning outcome
    Invalid = 7,
    Disputed = 8,
}
```

In practice, represent `ResolvedIndex` as a separate variant with payload in Anchor:

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MarketState {
    Draft,
    PendingLaunch,
    Active,
    Locked,
    Resolved { winning_index: u8 },
    Invalid,
    Disputed,
}
```

### OutcomeConfig

```rust
pub struct OutcomeConfig {
    pub outcome_count: u8,                // 2 for binary, N for multi-outcome (≤ 8)
    pub payout_numerator: [u64; 8],       // Payout weights; normalized against denominator
    pub payout_denominator: u64,
    pub outcome_labels_hash: [u8; 32],    // Hash of off-chain label array
}
```

### ResolutionConfig

```rust
pub struct ResolutionConfig {
    pub primary_sources_hash: [u8; 32],   // Hash of ordered list of source URIs
    pub trigger_logic_hash: [u8; 32],     // Hash of structured trigger condition
    pub fallback_logic_hash: [u8; 32],    // Hash of fallback rules (zeroed if none)
    pub invalidation_clause_hash: [u8; 32],
    pub proof_type: ProofType,            // e.g., TLSNotary, zkPass
    pub sla_seconds: u32,                 // Expected proof delivery window
}
```

### EconomicsConfig

```rust
pub struct EconomicsConfig {
    pub creator_stake_amount: u64,    // In staking token units
    pub trading_fee_bps: u16,         // Total trading fee (basis points)
    pub fee_split_bps: FeeSplit,      // Split across LP, creator, treasury
    pub settlement_fee_bps: u16,
    pub bounty_amount: u64,           // Proof bounty in quote tokens
    pub dispute_bond_min: u64,
}
```

```rust
pub struct FeeSplit {
    pub lp_bps: u16,
    pub creator_bps: u16,
    pub treasury_bps: u16,
}
```

### TimestampConfig

```rust
pub struct TimestampConfig {
    pub created_at: i64,
    pub open_at: i64,
    pub lock_at: i64,
    pub resolution_deadline: i64,
    pub dispute_window_seconds: u32,
}
```

### ProofStatus & DisputeStatus

```rust
pub enum ProofStatus {
    Pending,
    Verified,
    Rejected,    // Fails verification or outside SLA
    Superseded,  // Another proof replaced it
}

pub enum DisputeStatus {
    Open,
    Upheld,      // Challenger wins; market outcome overturned/invalidated
    Dismissed,   // Challenger loses; bond distributed to proof submitter
}
```

### Ruling

```rust
pub enum Ruling {
    Uphold { new_state: MarketState },
    Dismiss,
}
```

## PDA Seeds
- `MarketFactory`: `["factory"]`
- `MarketAccount`: `["market", factory_pubkey, market_id.to_le_bytes()]`
- `StakeVault`: `["stake", market_pubkey]`
- `TreasuryVault`: `["treasury", market_pubkey]`
- `ProofBountyVault`: `["bounty", market_pubkey]`
- `DisputeBondVault`: `["dispute", market_pubkey, challenger_pubkey]`
- `ProofSubmission`: `["proof", market_pubkey, submitter_pubkey, sequence]`

## Program Instructions (High Level)
- `initialize_factory`
- `update_factory_config`
- `submit_market_draft` (optional; drafts can stay off-chain)
- `launch_market` (creator + curator sign; initializes account and stakes funds)
- `add_liquidity` / `remove_liquidity`
- `trade` (swap between outcome tokens)
- `lock_market`
- `submit_proof`
- `settle_market`
- `open_dispute`
- `resolve_dispute`
- `withdraw_creator_stake`
- `withdraw_fee_share`

Further breakdown lives in the implementation plan; this schema ensures all required data from the standard specification has deterministic on-chain representation.
