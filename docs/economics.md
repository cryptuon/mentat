# Economic Model

## Token Economics Overview

Mentat Protocol uses a multi-token system optimized for different economic functions:

- **MENTAT**: Governance and staking token
- **Markets**: Trading happens in SOL, USDC, or other Solana SPL tokens
- **Rewards**: Distributed in MENTAT based on participation

## Stakeholder Incentives

### Market Creators

#### Revenue Streams
- **Trading Fees**: 0.5-2% of all trades on their markets
- **Quality Bonuses**: Additional rewards for high-scoring markets
- **Volume Bonuses**: Escalating rewards for markets with high trading volume
- **First Mover**: Extra rewards for creating novel market categories

#### Costs & Requirements
- **Staking Requirement**: 100-1000 MENTAT tokens per market
- **Quality Slashing**: 10-50% stake loss for consistently low-quality markets
- **Gas Costs**: Parallel network fees (minimal)

#### Example Economics
```
Market: "Will Bitcoin hit $100k by EOY?"
Stake Required: 500 MENTAT (~$500)
Trading Volume: $50,000
Creator Earnings:
├── Base Fee (1%): $500
├── Quality Bonus (High Score): $100
├── Volume Bonus (>$10k): $150
└── Total: $750 (150% APR if monthly market)
```

### Traders

#### Incentives
- **Early Trader Bonuses**: 5-20% fee rebates for first X trades
- **Liquidity Mining**: Earn MENTAT for providing initial liquidity
- **Referral Rewards**: 10% of referred users' fees
- **Streak Bonuses**: Rewards for consistent profitable trading

#### Fee Structure
- **Trading Fee**: 0.5-2% per trade (varies by market quality)
- **Withdrawal Fee**: None
- **Settlement Fee**: Covered by protocol

#### Bootstrap Liquidity Program
```
Phase 1 (Month 1-3): 5000 MENTAT/month
├── 50% Early Trader Rewards
├── 30% Liquidity Provider Rewards
├── 20% High-Quality Market Bonuses

Phase 2 (Month 4-12): 2000 MENTAT/month
├── 40% Liquidity Provider Rewards
├── 35% Quality Creator Rewards
├── 25% Community Rewards
```

### Validators/Agents

#### Agent Operators
- **Transaction Fees**: Earn fees from parallel network operations
- **Quality Validation**: Rewards for accurate market scoring
- **Resolution Rewards**: Fees for successful zkTLS proof generation
- **Dispute Resolution**: Rewards for handling challenges

#### Economics
```
Agent Operation Costs: $100-500/month (infrastructure)
Revenue Streams:
├── Validation Fees: 0.1 MENTAT per market validated
├── Resolution Fees: 1-5 MENTAT per market resolved
├── Transaction Fees: 0.01% of parallel network volume
└── Dispute Rewards: 10-50 MENTAT per dispute resolved

Monthly Potential: 1000-5000 MENTAT
```

### Liquidity Providers

#### Automated Market Making
- **LP Token Rewards**: Earn trading fees proportional to share
- **Impermanent Loss Protection**: Protocol insurance for IL >10%
- **MENTAT Emissions**: Additional rewards for providing liquidity
- **Compound Rewards**: Auto-reinvestment options

## Fee Structure

### Trading Fees (Tiered by Market Quality)

| Quality Score | Trading Fee | Creator Share | Protocol Share |
|---------------|-------------|---------------|----------------|
| 90-100 (High) | 0.5% | 60% | 40% |
| 70-89 (Good) | 1.0% | 50% | 50% |
| 50-69 (Fair) | 1.5% | 40% | 60% |
| <50 (Poor) | 2.0% | 30% | 70% |

### Resolution Fees
- **zkTLS Proof Generation**: 0.1% of market volume
- **Multi-source Verification**: +0.05% per additional source
- **Dispute Handling**: 1% of disputed amount (refunded if dispute wins)

### Platform Fees
- **Market Creation**: Free (staking requirement only)
- **Governance Proposals**: 1000 MENTAT
- **Agent Upgrades**: Community vote

## Staking & Slashing

### Market Creator Staking

#### Stake Requirements
```
Market Category | Base Stake | Max Stake
News/Politics   | 100 MENTAT | 1000 MENTAT
Crypto/Finance  | 200 MENTAT | 2000 MENTAT
Sports/Events   | 150 MENTAT | 1500 MENTAT
Custom/Novel    | 500 MENTAT | 5000 MENTAT
```

#### Slashing Conditions
- **Quality Score <30**: 10% stake slashed
- **Resolution Disputes Lost**: 25% stake slashed
- **Spam/Manipulation**: 50% stake slashed
- **Repeated Violations**: 100% stake slashed + ban

### Validator Staking
- **Minimum Stake**: 10,000 MENTAT
- **Slashing**: 5-20% for incorrect validations
- **Rewards**: 5-15% APY based on performance

## Bootstrap Strategy

### Phase 1: Liquidity Seeding (Months 1-3)

#### Initial Market Seeding
- Protocol creates 100 high-quality seed markets
- $500k initial liquidity across all markets
- 10,000 MENTAT rewards for early traders

#### Creator Incentives
- 0% platform fee for first 1000 markets
- 2x quality bonuses for early creators
- Retroactive airdrops for top performers

#### User Acquisition
- Free trading (no fees) for first $1000 traded per user
- Referral program: 50 MENTAT per successful referral
- Social media rewards for sharing markets

### Phase 2: Growth (Months 4-12)

#### Market Development
- AI agent improvements based on usage data
- Expand to new source types (APIs, social media)
- Partnership integrations (news outlets, data providers)

#### Economic Optimization
- Dynamic fee adjustment based on volume
- Advanced LP strategies (concentrated liquidity)
- Insurance mechanisms for edge cases

### Phase 3: Maturity (Year 2+)

#### Self-Sustaining Economics
- Fee revenue covers all protocol costs
- Community governance for parameter changes
- Cross-chain expansion with shared liquidity

## Governance & Revenue

### Protocol Revenue Sources
- **Trading Fees**: 40-70% of all trading fees
- **Resolution Fees**: 100% of zkTLS generation costs
- **Staking Rewards**: MEV capture from ordering
- **Partnerships**: Revenue sharing with data providers

### Revenue Allocation
```
Protocol Revenue Distribution:
├── 40% Treasury (operational costs)
├── 25% MENTAT Buyback & Burn
├── 20% Liquidity Mining Rewards
├── 10% Team & Development
└── 5% Insurance/Risk Fund
```

### Governance Rights (MENTAT Holders)
- Parameter changes (fee rates, quality thresholds)
- Agent system upgrades
- Treasury allocation
- Partnership approvals
- Emergency actions

## Anti-Gaming Measures

### Market Manipulation Prevention
- **Multi-source Requirements**: Prevent single source manipulation
- **Dispute Periods**: Allow corrections within 24 hours
- **Economic Penalties**: High costs for low-quality markets
- **Quality Decay**: Repeated poor markets reduce creator reputation

### Sybil Resistance
- **Stake Requirements**: Economic cost to create markets
- **Identity Scoring**: ML-based creator reputation
- **Social Validation**: Community flagging of suspicious activity
- **Rate Limiting**: Max markets per creator per day

### MEV Protection
- **Commit-Reveal**: Hide resolution timing
- **Batch Settlements**: Reduce front-running opportunities
- **Fair Ordering**: Parallel network transaction ordering
- **Insurance**: Cover MEV-related losses

## Economic Simulations

### Success Scenario (Year 1)
```
Markets Created: 10,000
Average Volume: $5,000 per market
Total Volume: $50M
Trading Fees: $500k-750k
Creator Rewards: $250k-400k
Protocol Revenue: $250k-350k
MENTAT Market Cap: $10-50M
```

### Stress Test Scenarios
- **Low Volume**: Break-even at $1M monthly volume
- **High Spam**: Quality filters prevent economic drain
- **Market Manipulation**: Multi-source zkTLS prevents oracle attacks
- **Regulatory**: Decentralized structure maintains operations

## Integration with Solana DeFi

### Composability
- **Jupiter Integration**: Route trades through DEX aggregator
- **Orca Whirlpools**: Concentrated liquidity for prediction tokens
- **Marinade**: Stake SOL collateral while trading
- **Meteora**: Dynamic LP strategies

### Cross-Protocol Features
- **Collateral Types**: Accept mSOL, jitoSOL, etc. as collateral
- **Yield Strategies**: Auto-compound LP rewards
- **Flash Loans**: Enable advanced trading strategies
- **Portfolio Management**: Integrate with DeFi yield protocols