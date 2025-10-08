# Fee Split Financial Model

This model estimates protocol, creator, LP, and proof submitter revenue under the default fee configuration. It captures per-market flows and aggregates to daily/weekly projections to validate sustainability targets.

## Assumptions
- **Quote asset:** USDC (1:1 with USD for simplicity).
- **Average market lifespan:** 14 days from launch to settlement.
- **Average trade volume per market:** Adjustable; base case 250 000 USDC total notional.
- **Open interest at settlement:** 50 000 USDC.
- **Proof bounty:** 250 USDC (funded from settlement fee).
- **Creator stake:** 50 USDC (returned on clean resolution; ignored in revenue calc).

Default fees (from `docs/tokenomics.md`):
- Trading fee: 2.0 % (1.0 % LP rebate, 0.75 % Treasury, 0.25 % creator).
- Settlement fee: 0.5 % of resolved pool (0.35 % proof bounty, 0.15 % Treasury).

## Per-Market Revenue Breakdown

Let:
- `V` = total trading volume.
- `O` = open interest at settlement.

### Trading Fees
- Total collected: `TradingFee = V * 0.02`.
- Allocation:
  - LPs: `TradingFee_LP = V * 0.01`.
  - Mentat Treasury: `TradingFee_Treasury = V * 0.0075`.
  - Creator: `TradingFee_Creator = V * 0.0025`.

### Settlement Fees
- Total collected: `SettlementFee = O * 0.005`.
- Allocation:
  - Proof bounty pool: `SettlementFee_Proof = O * 0.0035`.
  - Treasury: `SettlementFee_Treasury = O * 0.0015`.

### Example (Base Case)
```
V = 250,000 USDC
O = 50,000 USDC

Trading fees:
  Total = 5,000
  LPs = 2,500
  Treasury = 1,875
  Creator = 625

Settlement fees:
  Total = 250
  Proof bounty = 175
  Treasury = 75

Treasury total per market = 1,950 USDC.
Proof submitter max bounty = 175 USDC (scaled by SLA).
Creator revenue per market = 625 USDC (excluding stake return).
```

## Daily/Weekly Projection

Let `M` be markets settled per day, `C` markets created/active. Assume average volume/interest as base case.

### Daily Treasury Revenue
```
Treasury_daily = M * (0.0075 * V + 0.0015 * O)

Example: M = 6 markets/day
Treasury_daily = 6 * (0.0075 * 250,000 + 0.0015 * 50,000)
              = 6 * (1,875 + 75)
              = 6 * 1,950
              = 11,700 USDC/day
```

### Weekly Proof Payout Budget
```
Proof_bounty_weekly = 7 * M * (0.0035 * O) * SLA_factor
```
Where `SLA_factor` represents the average percentage paid based on timeliness:
- If 70 % of proofs arrive on time, 20 % delayed, 10 % late:
```
SLA_factor = 0.7 * 1.0 + 0.2 * 0.5 + 0.1 * 0.1 = 0.7 + 0.1 + 0.01 = 0.81
```
Example with `M = 6`:
```
Proof_bounty_weekly = 7 * 6 * (0.0035 * 50,000) * 0.81
                    = 42 * 175 * 0.81
                    = 42 * 141.75
                    ≈ 5,953.5 USDC/week
```

### Creator Earnings
```
Creator_daily = C * (0.0025 * V)
Example: C = 8 active markets generating volume per day
Creator_daily = 8 * 625 = 5,000 USDC/day (aggregate across creators)
```
Per creator depends on share of markets launched; distribute proportionally.

### LP Earnings
```
LP_daily = C * (0.01 * V)
Example: 8 markets → 8 * 2,500 = 20,000 USDC/day (split across LP positions).
```

## Sensitivity Table (Treasury Revenue per Market)

| Volume (V) | Open Interest (O) | Treasury Revenue |
|------------|-------------------|------------------|
| 100 000 | 25 000 | 780 USDC |
| 250 000 | 50 000 | 1 950 USDC |
| 500 000 | 100 000 | 3 900 USDC |
| 1 000 000 | 150 000 | 7 425 USDC |

Formula: `0.0075 * V + 0.0015 * O`.

## Break-Even Considerations
- Estimate fixed operating costs (AI API, infra, staffing). Example: 4,000 USDC/day.
- Required markets per day to break even: solve `M * 1,950 ≥ 4,000` ⇒ `M ≥ 2.05`. Target at least 3 settled markets/day.
- Include proof payouts when calculating net treasury: `NetTreasury = Treasury_daily - Proof_bounty_daily (portion paid) - Stipends`.

## Scenario Planning
1. **Low Volume Launch:** `V=100k`, `O=20k`, `M=2` ⇒ Treasury ≈ 1,500 USDC/day. Need higher market count or adjust fees.
2. **Growth Phase:** `V=400k`, `O=80k`, `M=8` ⇒ Treasury ≈ 25k/day; enough to fund grants, liquidity mining.
3. **Stress Test:** Increased disputes causing 10 % of markets to resolve invalid. Slash stake adds `0.5 * Stake` per invalid market to Treasury, offsetting lost fees.

## Usage
- Update assumptions quarterly based on real metrics.
- Build spreadsheet or dashboard using these formulas for live revenue monitoring.
- Feed Treasury projections into budget planning for audits, grants, and curator stipends.
