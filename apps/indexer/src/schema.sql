-- On-Chain Events Tables
-- These tables store events emitted by Solana programs

-- Markets from on-chain events
CREATE TABLE IF NOT EXISTS on_chain_markets (
    id SERIAL PRIMARY KEY,
    market_address VARCHAR(44) UNIQUE NOT NULL,
    market_id BIGINT NOT NULL,
    creator_address VARCHAR(44) NOT NULL,
    question_text TEXT NOT NULL,
    num_outcomes SMALLINT NOT NULL,
    trading_fee_bps SMALLINT NOT NULL,
    resolution_deadline BIGINT NOT NULL,
    created_at BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL,
    slot BIGINT NOT NULL,
    block_time BIGINT,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_market_address (market_address),
    INDEX idx_creator_address (creator_address),
    INDEX idx_created_at (created_at)
);

-- Trade events
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    market_address VARCHAR(44) NOT NULL,
    trader_address VARCHAR(44) NOT NULL,
    outcome_index SMALLINT NOT NULL,
    is_buy BOOLEAN NOT NULL,
    amount BIGINT NOT NULL,
    price BIGINT NOT NULL,
    fee BIGINT NOT NULL,
    shares BIGINT NOT NULL,
    timestamp BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL,
    slot BIGINT NOT NULL,
    block_time BIGINT,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_market_address (market_address),
    INDEX idx_trader_address (trader_address),
    INDEX idx_timestamp (timestamp),
    INDEX idx_signature (signature)
);

-- Liquidity events
CREATE TABLE IF NOT EXISTS liquidity_events (
    id SERIAL PRIMARY KEY,
    market_address VARCHAR(44) NOT NULL,
    provider_address VARCHAR(44) NOT NULL,
    event_type VARCHAR(20) NOT NULL, -- 'add' or 'remove'
    amount BIGINT,
    lp_tokens_minted BIGINT,
    lp_tokens_burned BIGINT,
    amount_received BIGINT,
    timestamp BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL,
    slot BIGINT NOT NULL,
    block_time BIGINT,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_market_address (market_address),
    INDEX idx_provider_address (provider_address),
    INDEX idx_event_type (event_type),
    INDEX idx_timestamp (timestamp)
);

-- Resolution events (proofs, disputes, payouts)
CREATE TABLE IF NOT EXISTS resolution_events (
    id SERIAL PRIMARY KEY,
    market_address VARCHAR(44) NOT NULL,
    event_type VARCHAR(30) NOT NULL, -- 'proof_submitted', 'proof_verified', 'market_resolved', 'payout_claimed', 'dispute_opened', 'dispute_resolved'

    -- Common fields
    actor_address VARCHAR(44) NOT NULL, -- submitter, verifier, resolver, claimer, disputer
    timestamp BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL,
    slot BIGINT NOT NULL,
    block_time BIGINT,

    -- Proof fields
    proof_id BIGINT,
    outcome_index SMALLINT,
    proof_data TEXT,
    is_valid BOOLEAN,

    -- Resolution fields
    winning_outcome SMALLINT,
    total_payout BIGINT,
    settlement_deadline BIGINT,

    -- Payout fields
    position_address VARCHAR(44),
    amount_claimed BIGINT,
    shares_used BIGINT,

    -- Dispute fields
    dispute_id BIGINT,
    original_outcome SMALLINT,
    proposed_outcome SMALLINT,
    stake_amount BIGINT,
    reason TEXT,
    resolution TEXT,
    final_outcome SMALLINT,

    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_market_address (market_address),
    INDEX idx_event_type (event_type),
    INDEX idx_actor_address (actor_address),
    INDEX idx_timestamp (timestamp)
);

-- Market state changes
CREATE TABLE IF NOT EXISTS market_state_changes (
    id SERIAL PRIMARY KEY,
    market_address VARCHAR(44) NOT NULL,
    old_state VARCHAR(20) NOT NULL,
    new_state VARCHAR(20) NOT NULL,
    authority_address VARCHAR(44) NOT NULL,
    timestamp BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL,
    slot BIGINT NOT NULL,
    block_time BIGINT,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_market_address (market_address),
    INDEX idx_new_state (new_state),
    INDEX idx_timestamp (timestamp)
);

-- Market closure events
CREATE TABLE IF NOT EXISTS market_closures (
    id SERIAL PRIMARY KEY,
    market_address VARCHAR(44) UNIQUE NOT NULL,
    creator_address VARCHAR(44) NOT NULL,
    fees_withdrawn BIGINT NOT NULL,
    total_volume BIGINT NOT NULL,
    total_trades BIGINT NOT NULL,
    timestamp BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL,
    slot BIGINT NOT NULL,
    block_time BIGINT,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_market_address (market_address),
    INDEX idx_timestamp (timestamp)
);

-- Fee withdrawal events
CREATE TABLE IF NOT EXISTS fee_withdrawals (
    id SERIAL PRIMARY KEY,
    market_address VARCHAR(44) NOT NULL,
    recipient_address VARCHAR(44) NOT NULL,
    amount BIGINT NOT NULL,
    timestamp BIGINT NOT NULL,
    signature VARCHAR(88) NOT NULL,
    slot BIGINT NOT NULL,
    block_time BIGINT,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_market_address (market_address),
    INDEX idx_recipient_address (recipient_address),
    INDEX idx_timestamp (timestamp)
);

-- Indexer state tracking
CREATE TABLE IF NOT EXISTS indexer_state (
    id SERIAL PRIMARY KEY,
    program_id VARCHAR(44) UNIQUE NOT NULL,
    last_processed_slot BIGINT NOT NULL DEFAULT 0,
    last_processed_signature VARCHAR(88),
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial state for both programs
INSERT INTO indexer_state (program_id, last_processed_slot)
VALUES
    ('3sgfKweTHC5EZgGsh6CCcgP9Bqppb5UA6CwgAcHbF9va', 0),
    ('mktRU9S5U6cKzX6dvKeyUgm8g8VPRZxuzizfNX18cR1', 0)
ON CONFLICT (program_id) DO NOTHING;
