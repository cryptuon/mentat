# Mentat Protocol - Solana Programs

Anchor-based smart contracts for the Mentat prediction market platform.

## Programs

### 1. Market Factory (`market-factory`)
Creates and manages prediction markets on-chain.

**Features**:
- Deploy new markets from approved drafts
- Manage liquidity pools (AMM)
- Handle trading and fees
- Market state transitions

### 2. Market Settlement (`market-settlement`)
Resolves markets and distributes payouts.

**Features**:
- Accept zkTLS proofs
- Verify proof validity
- Calculate and distribute payouts
- Handle disputes

## Prerequisites

- **Rust** 1.75+
- **Solana CLI** 1.18+
- **Anchor** 0.30+

## Installation

### Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Install Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

### Install Anchor
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

## Setup

```bash
# Initialize Anchor workspace
anchor init mentat-programs

# Build programs
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## Program Structure

```
programs/
├── market-factory/
│   ├── src/
│   │   ├── lib.rs          # Program entry point
│   │   ├── state.rs        # Account structures
│   │   ├── instructions/   # Instruction handlers
│   │   ├── events.rs       # Event definitions
│   │   ├── errors.rs       # Custom errors
│   │   └── constants.rs    # Program constants
│   └── Cargo.toml
└── market-settlement/
    ├── src/
    │   ├── lib.rs
    │   ├── state.rs
    │   ├── instructions/
    │   ├── events.rs
    │   ├── errors.rs
    │   └── constants.rs
    └── Cargo.toml
```

## Development Workflow

### 1. Build Programs
```bash
anchor build
```

### 2. Run Tests
```bash
anchor test
```

### 3. Deploy to Devnet
```bash
# Configure Solana CLI for devnet
solana config set --url https://api.devnet.solana.com

# Airdrop SOL for deployment
solana airdrop 2

# Deploy
anchor deploy --provider.cluster devnet
```

### 4. Verify Deployment
```bash
# Check program
solana program show <PROGRAM_ID>
```

## Testing

### Unit Tests
```bash
# Test market-factory
anchor test --skip-deploy -- --test-name market_factory

# Test market-settlement
anchor test --skip-deploy -- --test-name market_settlement
```

### Integration Tests
```bash
# Run all tests
anchor test
```

## Program IDs

### Devnet
- Market Factory: `TBD`
- Market Settlement: `TBD`

### Testnet
- Market Factory: `TBD`
- Market Settlement: `TBD`

### Mainnet
- Market Factory: `TBD`
- Market Settlement: `TBD`

## Documentation

- [Market Factory Program](./docs/market-factory.md)
- [Market Settlement Program](./docs/market-settlement.md)
- [Account Structures](./docs/accounts.md)
- [Instruction Reference](./docs/instructions.md)
- [Event Reference](./docs/events.md)

## Security

- Security audit: TBD
- Bug bounty: TBD

## License

TBD
