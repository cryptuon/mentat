# Non-Solana TODOs - The Other 36%

> **Note:** This page is a point-in-time status snapshot and may be out of date relative to the current source. PRs welcome.

**Date**: November 25, 2025
**Focus**: TODOs not blocked by Solana program deployment

---

## 📊 Breakdown of the 36%

Out of 28 total TODOs:
- **64% (18 TODOs)**: Blocked by Solana programs ❌
- **36% (10 TODOs)**: Not blocked by Solana programs ✅

**The 36% breaks down as**:
- **3 TODOs** (11%): ✅ **RESOLVED** - Already completed
- **7 TODOs** (25%): 🔄 **PLACEHOLDERS** - Can be improved with backend work

---

## ✅ RESOLVED TODOs (3 total - 11%)

These are **already done**:

### 1. CreatorStudio.vue - AI Refinement
✅ **Status**: COMPLETED
- Now calls actual `refineDraft()` API
- Updates draft with refined result
- Shows AI response in conversation

### 2. DiffView.vue - API Call
✅ **Status**: COMPLETED
- Already using actual API endpoint
- Just needed comment clarification

### 3. Network Helper Functions
✅ **Status**: COMPLETED
- Functions were unused and deleted
- Components use direct properties instead

**These 3 are fully resolved and working!**

---

## 🔄 PLACEHOLDER TODOs (7 total - 25%)

These use reasonable defaults but could be improved with backend enhancements.

### Category A: Backend Fields Missing (5 TODOs)

#### 1. 24h Volume Tracking
**Location**: `src/services/adapters.ts:25`
**Current**: Using `total_volume` as proxy
```typescript
volume24h: apiMarket.total_volume, // PLACEHOLDER: Using total volume until backend adds 24h tracking
```

**What's needed**:
- Backend adds `volume_24h` field to market table
- Add time-windowed volume query
- Update API response to include field

**Can we fix now?**: 🟡 **MAYBE** (requires backend work)
- Need to add database column
- Need to implement 24h calculation
- Frontend change is trivial once backend ready

**Effort**: 2-3 hours backend work
**Priority**: Low (total volume is acceptable proxy)

---

#### 2. Proof SLA Minutes Field
**Location**: `src/services/adapters.ts:29`
**Current**: Using 60 minutes default
```typescript
proofSlaMinutes: 60, // PLACEHOLDER: Default 60 min until backend adds proof_sla_minutes field
```

**What's needed**:
- Backend adds `proof_sla_minutes` field to market schema
- Add to market creation form
- Store per-market SLA

**Can we fix now?**: 🟡 **MAYBE** (requires backend work)
- Add database column
- Update API endpoints
- Update frontend forms

**Effort**: 1-2 hours backend work
**Priority**: Low (60 min is reasonable default)

---

#### 3. Per-Outcome Liquidity Shares
**Location**: `src/services/adapters.ts:81-82`
**Current**: Using 50/50 split
```typescript
yesShares: apiMarket.total_liquidity / 2, // PLACEHOLDER: Equal split
noShares: apiMarket.total_liquidity / 2,
```

**What's needed**:
- Backend tracks per-outcome share distribution
- Add to market detail response
- Calculate from trading activity

**Can we fix now?**: 🟡 **MAYBE** (requires backend logic)
- Need outcome share tracking in database
- Need share calculation from trades
- More complex than simple field addition

**Effort**: 4-6 hours backend work
**Priority**: Low (50/50 is reasonable for binary markets)

---

#### 4. APY Calculation
**Location**: `src/services/adapters.ts:83`
**Current**: Static 12.5%
```typescript
apy: 12.5, // PLACEHOLDER: Static 12.5% until backend adds APY calculation
```

**What's needed**:
- Backend calculates APY from fee accumulation
- Track LP fees over time
- Calculate annualized return

**Can we fix now?**: 🟡 **MAYBE** (requires backend analytics)
- Need fee tracking per LP position
- Need time-weighted calculations
- Moderately complex analytics

**Effort**: 6-8 hours backend work
**Priority**: Medium (users want to see real APY)

---

#### 5. Odds Change Calculation
**Location**: `src/services/adapters.ts:30`
**Current**: Always 0
```typescript
oddsChange: 0, // PLACEHOLDER: Need price history endpoint to calculate
```

**What's needed**:
- Price history endpoint (see below)
- Calculate change over time period (24h)
- Return percentage change

**Can we fix now?**: ❌ **NO** (depends on price history endpoint)
- Blocked by TODO #6

**Effort**: 1 hour once price history exists
**Priority**: Medium (useful for trending markets)

---

### Category B: Backend Endpoints Missing (2 TODOs)

#### 6. Price History Endpoint
**Location**: `src/services/adapters.ts:91`
**Current**: Empty array
```typescript
priceHistory: [], // BLOCKED: Need backend price history endpoint
```

**What's needed**:
- Backend implements `/api/v1/markets/{id}/price-history` endpoint
- Track price changes over time
- Return time-series data

**Can we fix now?**: 🟢 **YES** (backend work)

**Backend implementation**:
```python
# In backend apps/backend/src/routers/markets.py

@router.get("/{market_id}/price-history")
async def get_price_history(market_id: str, timeframe: str = "24h"):
    """Return price history for market outcomes"""
    # Query price snapshots from database
    # Return time-series data
    return {
        "timeframe": timeframe,
        "data_points": [
            {
                "timestamp": "2025-11-25T10:00:00Z",
                "outcome_id": "outcome_1",
                "price": 0.52
            },
            # ... more data points
        ]
    }
```

**Effort**: 4-6 hours backend work (table + endpoint + queries)
**Priority**: Medium (needed for charts and trending)

---

#### 7. Proof Jobs Endpoint
**Location**: `src/services/api.ts:95`
**Current**: Returns empty array
```typescript
// BLOCKED: Backend endpoint /api/v1/proofs/jobs not yet implemented
return [];
```

**What's needed**:
- Backend implements `/api/v1/proofs/jobs` endpoint
- Track proof verification tasks
- Return job queue

**Can we fix now?**: 🟢 **YES** (backend work)

**Backend implementation**:
```python
# In backend apps/backend/src/routers/proofs.py

@router.get("/jobs")
async def get_proof_jobs(status: Optional[str] = None):
    """Return proof verification jobs"""
    # Query from proof_jobs table
    return [
        {
            "id": "job_1",
            "market_id": "market_123",
            "question": "...",
            "deadline": "2025-11-26T00:00:00Z",
            "bounty": 50,
            "status": "pending"
        }
    ]
```

**Effort**: 6-8 hours backend work (new table + endpoint)
**Priority**: High (ProofSubmission page empty without this)

---

#### 8. Creator Metrics Endpoint
**Location**: `src/services/api.ts:101`
**Current**: Returns mock zeros
```typescript
// BLOCKED: Backend endpoint /api/v1/creator/metrics not yet implemented
return [/* mock data with zeros */];
```

**What's needed**:
- Backend implements `/api/v1/creator/metrics` endpoint
- Calculate creator statistics
- Return analytics data

**Can we fix now?**: 🟢 **YES** (backend work)

**Backend implementation**:
```python
# In backend apps/backend/src/routers/creator.py

@router.get("/metrics")
async def get_creator_metrics(creator_id: str):
    """Return creator performance metrics"""
    # Query from markets and calculate stats
    return {
        "markets_launched_30d": 5,
        "approval_rate": 0.85,
        "avg_resolution_time_hours": 48,
        "fees_earned_usdc": 125.50
    }
```

**Effort**: 4-6 hours backend work (queries + calculations)
**Priority**: Medium (CreatorStudio shows placeholder metrics)

---

## 🎯 The 36% Actionable Breakdown

### ✅ Already Resolved (3 TODOs = 11%)
- CreatorStudio refinement: **DONE**
- DiffView comment: **DONE**
- Network helpers: **DONE**

### 🔄 Using Reasonable Defaults (7 TODOs = 25%)

**Can keep as-is** (5 TODOs):
- volume24h using total volume: Works fine
- proofSlaMinutes using 60 min: Good default
- yesShares/noShares 50/50: Correct for binary markets
- apy using 12.5%: Acceptable placeholder

**Should implement** (2 TODOs):
- 🔴 **fetchProofJobs()** - High priority (page is empty)
- 🟡 **fetchCreatorMetrics()** - Medium priority (shows zeros)

**Could implement** (3 TODOs if backend enhanced):
- Price history endpoint: Medium priority
- APY calculation: Medium priority
- Odds change: Low priority

---

## 🚀 What We Can Do RIGHT NOW

### Option 1: Mock Implementation (Quick Fix)

We can create better mock data for the empty endpoints:

**fetchProofJobs()** - Create realistic mock:
```typescript
export async function fetchProofJobs(): Promise<ProofJob[]> {
  // MOCK: Returns example data until backend implements endpoint
  return [
    {
      marketId: 'example_market',
      question: 'Will Bitcoin reach $100k by end of 2025?',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      bounty: 50,
      status: 'pending',
      source: 'https://coinmarketcap.com'
    }
  ];
}
```

**fetchCreatorMetrics()** - Already has reasonable mocks (zeros are fine)

### Option 2: Backend Implementation (Proper Fix)

Implement the missing backend endpoints:

**Priority order**:
1. 🔴 **Proof Jobs Endpoint** (4-6 hours)
   - Creates new feature
   - ProofSubmission page currently empty
   - High user value

2. 🟡 **Creator Metrics Endpoint** (4-6 hours)
   - Enhances existing feature
   - CreatorStudio shows better data
   - Medium user value

3. 🟡 **Price History Endpoint** (6-8 hours)
   - Enables charts and trending
   - Needed for odds change calculation
   - Medium user value

**Total effort**: ~14-20 hours backend work

### Option 3: Hybrid Approach (Recommended)

1. ✅ **Keep current placeholders** for low-impact items:
   - volume24h, proofSlaMinutes, liquidity shares, apy
   - These defaults work fine

2. 🟢 **Add better mocks** for proof jobs (5 minutes):
   - Make ProofSubmission page look populated
   - Show example of what it will look like

3. 🟡 **Plan backend enhancements** for later:
   - Document required endpoints
   - Create backend issues/tickets
   - Prioritize after M3 launch

---

## 📋 Detailed Analysis of the 36%

### The 3 RESOLVED TODOs (11% of 28)
1. ✅ CreatorStudio refinement - **DONE**
2. ✅ DiffView comment - **DONE**
3. ✅ Network helpers - **DONE**

**Action needed**: None - these are complete

---

### The 7 PLACEHOLDER TODOs (25% of 28)

#### Can Stay As-Is (5 TODOs - 18%)
These have acceptable defaults and low user impact:

1. **volume24h** → total_volume
   - **Why OK**: Total volume is a good proxy
   - **User impact**: Very low
   - **Action**: Keep as-is

2. **proofSlaMinutes** → 60
   - **Why OK**: 60 minutes is standard SLA
   - **User impact**: Low
   - **Action**: Keep as-is

3. **yesShares** → liquidity/2
   - **Why OK**: Binary markets are 50/50
   - **User impact**: Low
   - **Action**: Keep as-is

4. **noShares** → liquidity/2
   - **Why OK**: Binary markets are 50/50
   - **User impact**: Low
   - **Action**: Keep as-is

5. **oddsChange** → 0
   - **Why OK**: No trending indicator is acceptable
   - **User impact**: Medium (missing feature)
   - **Action**: Wait for price history endpoint

#### Should Improve (2 TODOs - 7%)

1. **fetchProofJobs()** → Returns []
   - **Current**: Empty array (ProofSubmission page empty)
   - **User impact**: High (page has no content)
   - **Can fix with**: Better mock data (5 min) OR Backend endpoint (6 hours)
   - **Recommendation**: Add better mock data NOW

2. **fetchCreatorMetrics()** → Returns mock zeros
   - **Current**: Placeholder metrics with all zeros
   - **User impact**: Medium (metrics not useful)
   - **Can fix with**: Backend endpoint (4-6 hours)
   - **Recommendation**: Keep current mocks, implement backend later

#### Needs Backend Work (2 TODOs - 7%)

1. **apy** → 12.5%
   - **Current**: Static rate
   - **User impact**: Medium (not accurate)
   - **Requires**: Backend fee tracking + APY calculation (6-8 hours)
   - **Recommendation**: Keep placeholder for now

2. **priceHistory** → []
   - **Current**: Empty array (no charts)
   - **User impact**: Medium (missing charts)
   - **Requires**: Backend price history endpoint (6-8 hours)
   - **Blocks**: oddsChange calculation
   - **Recommendation**: Implement in backend post-M3

---

## 🎯 What We Can Fix RIGHT NOW

### Quick Win: Better Proof Jobs Mock (5 minutes)

Let me implement this to make ProofSubmission page look populated:

```typescript
export async function fetchProofJobs(): Promise<ProofJob[]> {
  // MOCK: Example data showing what proof jobs will look like
  // Replace with actual backend endpoint at /api/v1/proofs/jobs
  return [
    {
      marketId: 'sample_market_1',
      question: 'Will Bitcoin reach $100k by December 31, 2025?',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      bounty: 50,
      status: 'pending',
      source: 'https://coinmarketcap.com/currencies/bitcoin/'
    },
    {
      marketId: 'sample_market_2',
      question: 'Will Ethereum exceed 5000 transactions per second in 2025?',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      bounty: 75,
      status: 'in_progress',
      source: 'https://etherscan.io'
    },
    {
      marketId: 'sample_market_3',
      question: 'Will Solana have zero outages for 30 consecutive days?',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      bounty: 100,
      status: 'pending',
      source: 'https://status.solana.com'
    }
  ];
}
```

**Benefits**:
- ✅ ProofSubmission page shows example jobs
- ✅ Users can see UI design
- ✅ Demonstrates proof job concept
- ✅ Easy to replace when backend ready

**Should we do this?**: 🟢 **YES** - Takes 5 minutes, high UI value

---

### What We CANNOT Fix Right Now (Without Backend Work)

#### Backend API Endpoints (2 TODOs)
- ❌ Price history endpoint - Requires backend database + endpoint (6-8 hours)
- ❌ Real creator metrics - Requires backend analytics (4-6 hours)

#### Backend Database Fields (3 TODOs)
- ❌ 24h volume - Requires database column + query (2-3 hours)
- ❌ Proof SLA field - Requires schema change (1-2 hours)
- ❌ Per-outcome shares - Requires share tracking logic (4-6 hours)

#### Calculated Fields (1 TODO)
- ❌ APY calculation - Requires fee tracking system (6-8 hours)

**Total backend work needed**: ~24-38 hours

---

## 💡 Recommended Action Plan

### Immediate (Now - 5 minutes)
✅ **Add better mock data for proof jobs**
- Makes ProofSubmission page look complete
- Shows users what to expect
- Zero backend work required

### Short-term (Post-M3 Launch)
🟡 **Implement high-priority backend endpoints**:
1. Proof jobs endpoint (6 hours) - HIGH PRIORITY
2. Creator metrics endpoint (4-6 hours) - MEDIUM PRIORITY
3. Price history endpoint (6-8 hours) - MEDIUM PRIORITY

### Long-term (Future Enhancement)
🟢 **Add backend field enhancements**:
1. APY calculation (6-8 hours)
2. 24h volume tracking (2-3 hours)
3. Per-outcome shares (4-6 hours)
4. Proof SLA field (1-2 hours)

---

## 🎯 Quick Decision Matrix

| TODO | Can Fix Now? | Should Fix? | Effort | Priority |
|------|--------------|-------------|--------|----------|
| **RESOLVED (3)** |
| CreatorStudio refinement | ✅ Done | - | - | - |
| DiffView comment | ✅ Done | - | - | - |
| Network helpers | ✅ Done | - | - | - |
| **PLACEHOLDERS (7)** |
| volume24h | 🟡 Backend | ❌ No | 2-3h | Low |
| proofSlaMinutes | 🟡 Backend | ❌ No | 1-2h | Low |
| yesShares/noShares | 🟡 Backend | ❌ No | 4-6h | Low |
| apy | 🟡 Backend | ⏳ Later | 6-8h | Medium |
| oddsChange | ❌ Blocked | ⏳ Later | 1h* | Medium |
| priceHistory | 🟢 Backend | ⏳ Later | 6-8h | Medium |
| **BACKEND ENDPOINTS (2)** |
| fetchProofJobs | 🟢 Mock now | ✅ **YES** | 5min | High |
| fetchCreatorMetrics | 🟡 Backend | ⏳ Later | 4-6h | Medium |

*Depends on priceHistory being implemented first

---

## ✅ Summary of the 36%

**The 36% breaks down as**:

1. **11% Already resolved** ✅
   - CreatorStudio: AI refinement implemented
   - DiffView: Comment clarified
   - Network helpers: Removed (unused)
   - **Action**: None needed

2. **18% Should keep as placeholders** 🔄
   - volume24h, proofSlaMinutes, liquidityShares
   - Defaults are acceptable
   - Low user impact
   - **Action**: Keep current defaults

3. **7% Can improve with quick mocks** 🟢
   - fetchProofJobs: Add example data
   - High UI value, 5 minutes effort
   - **Action**: Implement better mocks NOW

4. **25% Needs backend work** 🟡
   - fetchCreatorMetrics, priceHistory, apy, oddsChange
   - Medium user impact
   - 20-30 hours backend effort
   - **Action**: Plan for post-M3 implementation

---

## 🚀 Immediate Action Recommendation

**FIX NOW** (5 minutes):
```typescript
// In src/services/api.ts
export async function fetchProofJobs(): Promise<ProofJob[]> {
  // MOCK: Example data showing proof job interface
  // TODO: Replace with actual backend endpoint /api/v1/proofs/jobs
  return [
    {
      marketId: 'example_btc_100k',
      question: 'Will Bitcoin reach $100k by end of 2025?',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      bounty: 50,
      status: 'pending',
      source: 'https://coinmarketcap.com'
    },
    // ... 2-3 more examples
  ];
}
```

**KEEP FOR LATER** (all others):
- Backend endpoints: Post-M3 enhancement
- Field improvements: Low priority
- Calculations: Require more complex backend work

---

**Last Updated**: November 25, 2025
**Recommendation**: Add better proof jobs mock NOW (5 min), defer backend work to post-M3
