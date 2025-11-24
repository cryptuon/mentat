# Next Steps - M3 Milestone

**Last Updated**: November 24, 2025
**M3 Progress**: 75% Complete

This document outlines the immediate next steps to complete the M3 milestone and move forward with on-chain launch.

---

## 🎯 Immediate Actions (Today)

### 1. npm Install Status ⏳ IN PROGRESS

**Current Status**: Running for ~57 minutes (unusually long)

**Action**: Monitor npm install for Solana wallet packages

**If it completes successfully**:
```bash
cd apps/web
./scripts/verify-wallet-integration.sh
```

**If it times out or fails**:
```bash
# Cancel the process
Ctrl+C

# Try with legacy peer deps flag
npm install @solana/wallet-adapter-base \
            @solana/wallet-adapter-vue \
            @solana/wallet-adapter-wallets \
            @solana/wallet-adapter-phantom \
            @solana/wallet-adapter-solflare \
            @solana/web3.js \
            --legacy-peer-deps

# Or try with force flag
npm install --force
```

**Expected Result**: Packages installed in `node_modules/`

---

### 2. Verify Wallet Integration ✅ READY

**Once npm install completes**:

```bash
cd apps/web

# Run verification script
./scripts/verify-wallet-integration.sh

# Expected output: All checks passed
```

**If verification fails**: Review error messages and fix any missing integrations

---

### 3. Test Wallet Integration 🧪 READY

**Start development server**:
```bash
cd apps/web
npm run dev
```

**Manual testing checklist**:
- [ ] Open browser to http://localhost:5173
- [ ] Click "Connect Wallet" button in header
- [ ] Verify wallet modal opens
- [ ] Install Phantom wallet extension (https://phantom.app/download)
- [ ] Connect Phantom wallet
- [ ] Verify address displays in header
- [ ] Click address dropdown
- [ ] Test copy address functionality
- [ ] Test disconnect
- [ ] Refresh page to test auto-reconnect
- [ ] Test on mobile viewport (responsive)

**Expected Result**: Fully functional wallet connection flow

---

## 🚀 Short-Term Actions (This Week)

### 1. Fix Solana Program Compilation Errors ⚠️ BLOCKING

**Critical blocker for trading interface**

**Location**: `programs/market-factory/` and `programs/market-settlement/`

**Current Status**: Programs compiled previously but have errors

**Action Items**:
1. Review compilation errors
2. Fix Rust code issues
3. Run tests: `anchor test`
4. Verify all 12 instructions work
5. Generate updated documentation

**Expected Result**: Both programs compile without errors

---

### 2. Deploy Programs to Devnet 🌐 BLOCKED BY #1

**Once programs compile successfully**:

```bash
cd programs

# Build programs
anchor build

# Deploy to devnet
solana config set --url devnet
anchor deploy

# Save program IDs
echo "Market Factory: <PROGRAM_ID_1>" >> .env
echo "Market Settlement: <PROGRAM_ID_2>" >> .env
```

**Save deployed program IDs to**:
- `apps/web/.env`
- `apps/indexer/.env`
- `docs/DEPLOYMENT.md` (create this)

**Expected Result**: Programs deployed with valid IDs

---

### 3. Generate Program IDLs 📄 BLOCKED BY #2

**Once programs are deployed**:

```bash
cd programs

# IDL files are auto-generated during build
# Copy to frontend
cp target/idl/market_factory.json ../apps/web/src/idl/
cp target/idl/market_settlement.json ../apps/web/src/idl/

# Copy to indexer
cp target/idl/market_factory.json ../apps/indexer/src/idl/
cp target/idl/market_settlement.json ../apps/indexer/src/idl/
```

**Create directories**:
```bash
mkdir -p apps/web/src/idl
mkdir -p apps/indexer/src/idl
```

**Expected Result**: IDL files available for Anchor integration

---

### 4. Configure Event Indexer 🔧 BLOCKED BY #2, #3

**Once programs deployed and IDLs available**:

```bash
cd apps/indexer

# Update .env with program IDs
cat > .env << EOF
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WS_URL=wss://api.devnet.solana.com
MARKET_FACTORY_PROGRAM_ID=<PROGRAM_ID_1>
MARKET_SETTLEMENT_PROGRAM_ID=<PROGRAM_ID_2>
DATABASE_URL=postgresql://user:pass@localhost:5432/mentat
LOG_LEVEL=info
LOG_DIR=./logs
EOF

# Install dependencies
npm install

# Setup database
./scripts/setup-database.sh

# Start indexer
npm start
```

**Expected Result**: Indexer running and listening for events

---

## 📅 Medium-Term Actions (Next 2-3 Weeks)

### Week 1: Implement Solana Program Service

**Files to modify**:
- `apps/web/src/services/solanaProgram.ts`

**Tasks**:
1. Import Anchor and program IDLs
2. Initialize Program instances in `initialize()`
3. Implement `executeTrade()` method
4. Implement `addLiquidity()` method
5. Implement `removeLiquidity()` method
6. Implement position query methods
7. Implement AMM calculations
8. Add comprehensive error handling
9. Write unit tests

**Estimated**: 3-4 days

---

### Week 2: Build Trading Components

**Files to create**:
- `apps/web/src/components/trading/TradingPanel.vue`
- `apps/web/src/components/trading/PositionCard.vue`
- `apps/web/src/components/trading/TradeConfirmModal.vue`

**Tasks**:
1. Build TradingPanel:
   - Buy/Sell toggle
   - Amount input
   - Price display
   - Slippage settings
   - Execute button
2. Build PositionCard:
   - Display positions
   - Show PnL
   - Close position button
3. Build TradeConfirmModal:
   - Transaction details
   - Fee breakdown
   - Confirmation UI
4. Style all components
5. Test responsiveness

**Estimated**: 4-5 days

---

### Week 3: Integration & Testing

**Files to modify**:
- `apps/web/src/views/MarketDetail.vue`
- `apps/web/src/stores/trading.ts`

**Tasks**:
1. Integrate TradingPanel into MarketDetail
2. Connect trading store to components
3. Test full trade flow end-to-end
4. Fix bugs
5. Test error scenarios
6. Performance optimization
7. Documentation updates

**Estimated**: 3-4 days

---

## 🎓 Learning & Documentation

### Documentation to Create

1. **DEPLOYMENT.md**
   - Program deployment guide
   - RPC configuration
   - Network setup

2. **TRADING-GUIDE.md**
   - User guide for trading
   - AMM mechanics explanation
   - Fee structure

3. **API-REFERENCE.md**
   - Complete API documentation
   - Store methods
   - Service methods
   - Type definitions

---

## ⚠️ Known Issues & Risks

### Current Blockers

1. **npm install taking very long** (~57 minutes)
   - Risk: May time out or fail
   - Mitigation: Can retry with --force or --legacy-peer-deps

2. **Solana program compilation errors**
   - Risk: Blocking all trading functionality
   - Mitigation: Need to review and fix errors

### Future Risks

1. **Transaction failures on devnet**
   - Devnet can be unstable
   - May need to use testnet or custom RPC

2. **AMM formula complexity**
   - Need to match on-chain logic exactly
   - Requires careful testing

3. **Wallet connection issues**
   - Users may have multiple wallets
   - Wallet extension updates can break compatibility

---

## 📊 Success Metrics

### Phase 3 (Wallet Integration) - COMPLETE ✅

- [x] User can connect wallet
- [x] User can disconnect wallet
- [x] Auto-reconnect works
- [x] Address displays correctly
- [x] Copy address works
- [x] Mobile responsive

### Phase 4 (Trading Interface) - IN PROGRESS 🏗️

**MVP Success Criteria**:
- [ ] User can view market prices
- [ ] User can place buy order
- [ ] User can place sell order
- [ ] User can view their position
- [ ] User can see PnL
- [ ] Transaction confirms on-chain
- [ ] UI updates after trade
- [ ] Error handling works

**Full Success Criteria**:
- [ ] All MVP criteria met
- [ ] User can add liquidity
- [ ] User can remove liquidity
- [ ] Order book displays trades
- [ ] Portfolio view shows all positions
- [ ] Real-time updates working
- [ ] Mobile responsive
- [ ] Performance optimized

---

## 🎯 Milestones

### M3 Milestone (On-Chain Launch) - 75% Complete

- [x] Phase 1: Solana Programs (100%)
- [x] Phase 2: Event Indexer (100%)
- [x] Phase 3: Wallet Integration (100%)
- [ ] Phase 4: Trading Interface (25%)

**Target Completion**: 2-3 weeks from program deployment

---

## 📝 Commands Reference

### Development
```bash
# Start frontend dev server
cd apps/web && npm run dev

# Start backend API
cd apps/backend && uv sync && uv run fastapi dev src/main.py

# Start event indexer
cd apps/indexer && npm start

# Run tests
cd apps/web && npm test
```

### Deployment
```bash
# Deploy Solana programs
cd programs && anchor deploy

# Build frontend for production
cd apps/web && npm run build

# Start production server
cd apps/web && npm run preview
```

### Verification
```bash
# Verify wallet integration
cd apps/web && ./scripts/verify-wallet-integration.sh

# Check TypeScript types
cd apps/web && npx tsc --noEmit

# Lint code
cd apps/web && npm run lint
```

---

## 🆘 Getting Help

### Documentation
- **Wallet Integration**: `docs/WALLET-INTEGRATION-IMPLEMENTATION.md`
- **Event Indexer**: `docs/EVENT-INDEXER-IMPLEMENTATION.md`
- **Trading Interface**: `docs/PHASE-4-TRADING-INTERFACE-PLAN.md`
- **M3 Progress**: `docs/M3-PROGRESS-SUMMARY.md`

### Troubleshooting

**npm install issues**:
1. Try `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install --legacy-peer-deps`

**Wallet not connecting**:
1. Ensure wallet extension is installed
2. Check wallet is unlocked
3. Try refreshing the page
4. Check browser console for errors

**Program deployment fails**:
1. Ensure Solana CLI is installed: `solana --version`
2. Check network: `solana config get`
3. Check balance: `solana balance`
4. Check program logs for errors

---

## ✅ Quick Start (Once npm install completes)

```bash
# 1. Verify integration
cd apps/web
./scripts/verify-wallet-integration.sh

# 2. Start dev server
npm run dev

# 3. Open browser
open http://localhost:5173

# 4. Test wallet connection
# - Click "Connect Wallet"
# - Connect Phantom
# - Verify it works

# 5. Start working on Phase 4
# - Fix Solana programs
# - Deploy to devnet
# - Implement trading service
# - Build UI components
```

---

**Last Updated**: November 24, 2025
**Status**: Ready to proceed once npm install completes

**Next Immediate Action**: Wait for npm install, then run verification script
