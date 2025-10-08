# Tokenomics & Incentive Design

Mentat’s economics align market quality, timely resolution, and protocol sustainability. This document captures the initial fee structure, staking mechanics, and reward flows for the Solana MVP.

## Objectives
- **Quality control:** Require skin-in-the-game for market creators (AI controllers + curators) to discourage ambiguous or malicious markets.
- **Timely settlement:** Incentivize proof submitters to deliver zkTLS attestations within strict SLAs.
- **Protocol sustainability:** Collect predictable revenue to fund model usage, audits, and future incentives.
- **Flexibility:** Configure parameters per market type while keeping defaults simple for a pump.fun-style launch flow.

## Fee Structure
Fees are denominated in the market quote asset (e.g., USDC) and set at market creation time.

| Fee Type | Default Split | Notes |
|----------|---------------|-------|
| **Trading fee** | 2.0 % of trade volume | Charged on each swap/order fill. Split: 1.0 % to LPs, 0.75 % to Mentat Treasury, 0.25 % to market creator. |
| **Settlement fee** | 0.5 % of resolved pool | Deducted when market settles. Split: 0.35 % to proof submitter bounty pool, 0.15 % to Treasury. |
| **Dispute bond** | Variable (min 100 USDC) | Posted by challengers; returned if dispute succeeds, otherwise paid to proof submitter. |

Parameters can be overridden for special markets, but the UI defaults should encourage the standard split to keep discovery and expectations consistent.

## Market Creation Stake
- Each market requires a **creator stake** (default 50 USDC) escrowed in the Solana program.
- Refunded automatically on clean resolution.
- Slash conditions:
  - Market resolves `INVALID` due to ambiguous criteria.
  - Curator (or governance) forcibly closes market before trading opens.
  - Creator is linked to malicious activity (prompt injection, duplicate spam).
- Slashed stake is distributed 50 % to Treasury, 25 % to affected LPs, 25 % to curator pool.

## Proof Submitter Incentives
- Settlement fee feeds a **proof bounty pool** per market.
- Proof submitter earns bounty when submitting a valid zkTLS proof within SLA:
  - **Timely proof (≤ 30 min after outcome data appears):** 100 % bounty.
  - **Delayed proof (30 min – 6 h):** 50 % bounty.
  - **Late proof (> 6 h):** 10 % bounty; remaining funds go to Treasury.
- If no proof arrives before resolution deadline, market can be disputed or marked `INVALID`, returning escrowed funds.

## Curator Incentives
- Curators earn reputation points tracked off-chain initially.
- Once weekly, active curators share a stipend funded from Treasury (target: 10 % of weekly protocol revenue).
- Future phases may require curators to stake Mentat governance tokens; for MVP, focus on rapid iteration and accurate approvals.

## Treasury Utilization
- Pays for AI model usage, audits, bug bounties, and liquidity incentives.
- Governance (initially core team multisig) controls disbursements.
- Public dashboard should report incoming fees and spending to maintain transparency.

## Flow Summary
1. **Creation:** Creator deposits stake; trading/settlement fees configured.
2. **Trading:** Each trade routes fees to LPs, Treasury, and creator instantly.
3. **Resolution:** Proof bounty + settlement fee handled when proof submitted and market settles.
4. **Disputes:** Bonds enter escrow; success routes funds to challenger, failure rewards proof submitter.
5. **Post-Resolution:** Stake refund or slash executed based on outcome; Treasury updates ledger.

## Future Considerations
- Introduce Mentat governance token for ballot-weighted parameter changes.
- Dynamic fee tiers based on market risk, liquidity depth, or curator reputation.
- Insurance fund for systemic failures (e.g., proof provider outage).
- Optional revenue share to communities hosting market embeds.
