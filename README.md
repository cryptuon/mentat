# Mentat Protocol

> Fully permissionless prediction markets powered by AI agents and zkTLS

## Overview

Mentat Protocol enables anyone to create prediction markets through AI agents that automatically generate markets and resolve them using cryptographic proofs. No trusted intermediaries, no governance tokens to attack - just pure cryptographic truth.

## Core Innovation

**AI + zkTLS Architecture**
- **AI Agents**: Handle permissionless market creation at scale
- **zkTLS Proofs**: Provide cryptographic proof of real-world outcomes
- **Multi-Agent System**: Separate agents for creation, validation, and resolution

## Key Features

### 🤖 Permissionless Market Creation
- Anyone can prompt AI to create markets
- Multi-agent validation ensures quality
- Economic staking prevents spam

### 🔒 Trustless Resolution
- zkTLS proves "this data came from source X at time Y"
- No reliance on governance tokens or human oracles
- Cryptographic verification on-chain

### ⚡ Solana-Native
- Built on Solana for speed and low costs
- Parallel network for agent coordination
- Batch rollups for efficient settlement

### 💰 Economic Incentives
- Market creators earn trading fees + quality bonuses
- Liquidity providers receive yield + early trader rewards
- Validators earn transaction fees + governance emissions

## How It Works

1. **Market Creation**: User prompts AI agent to create a market
2. **Quality Validation**: Separate agent scores for ambiguity, relevance, and intent
3. **Market Launch**: High-quality markets go live on parallel network
4. **Trading**: Users trade on predictions with bootstrapped liquidity
5. **Resolution**: AI monitors sources and generates zkTLS proofs
6. **Settlement**: Cryptographic proof settles market automatically

## Architecture

```
User Prompt → Creation Agent → Validation Agent → Market Launch
                    ↓
zkTLS Sources ← Resolution Agent ← Active Markets
                    ↓
Parallel Network → Rollup Batch → Solana Mainnet
```

## Quality Framework

Markets are scored on:
- **Ambiguity**: Resolution criteria clarity
- **Relevance**: Market interest and importance
- **Intent**: Spam and manipulation detection
- **Source Reliability**: zkTLS source quality
- **Uniqueness**: Deduplication checks

Low-quality markets are marked but not censored - staying truly permissionless.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/mentat-protocol
cd mentat-protocol

# Install dependencies
npm install

# Start local development
npm run dev
```

## Documentation

- [Architecture](./docs/architecture.md) - Technical system design
- [Economic Model](./docs/economics.md) - Incentives and tokenomics
- [Quality Framework](./docs/quality.md) - Market scoring system
- [Agent Coordination](./docs/agents.md) - Multi-agent workflows
- [zkTLS Integration](./docs/zktls.md) - Proof generation and verification

## Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

*"The future of prediction markets is permissionless, trustless, and powered by AI"*