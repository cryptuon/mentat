# Network Configuration Guide

**Date**: November 25, 2025
**Status**: ✅ Fully Implemented

---

## 🎯 Overview

The Mentat Protocol web application now clearly indicates when it's running on a testnet (devnet, testnet, or localnet) vs mainnet. This ensures users always know which network they're interacting with and prevents confusion about whether real funds are being used.

---

## 🔧 Configuration

### Environment Variables

Network configuration is controlled via `.env` file in `apps/web/`:

```bash
# Solana Network Configuration
# Options: mainnet-beta | testnet | devnet | localnet
VITE_SOLANA_NETWORK=devnet

# Optional: Custom RPC URL (overrides default)
# VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Available Networks

| Network | Type | Color | Default RPC |
|---------|------|-------|-------------|
| **mainnet-beta** | Production | Green (#14F195) | https://api.mainnet-beta.solana.com |
| **testnet** | Test | Red (#FF6B6B) | https://api.testnet.solana.com |
| **devnet** | Test | Orange (#FFA500) | https://api.devnet.solana.com |
| **localnet** | Test | Purple (#9B59B6) | http://localhost:8899 |

---

## 🎨 UI Indicators

### 1. Network Indicator Badge (Header)

**Location**: Top right of header, next to wallet button
**Appearance**:
- Only visible on testnets (devnet, testnet, localnet)
- Color-coded badge with network name
- Pulsing animation for attention
- Warning emoji (⚠️) for emphasis

**Component**: `src/components/NetworkIndicator.vue`

```vue
<!-- Example on devnet -->
<div class="network-indicator" style="--network-color: #FFA500">
  ⚠️ DEVNET
</div>
```

### 2. Testnet Banner (Top of Page)

**Location**: Above header, spans full width
**Appearance**:
- Sticky banner at top of page
- Color matches network type
- Shows network name and helpful message
- Only visible on testnets

**Component**: `src/components/TestnetBanner.vue`

```vue
<!-- Example message -->
🧪 Devnet Environment: This is a test network. No real funds are used.
You can get free test SOL from a faucet.
```

### 3. Wallet Modal Badge

**Location**: Inside "Connect Wallet" modal, next to title
**Appearance**:
- Small badge showing network name
- Color-coded to match network
- Only visible on testnets

**Component**: Updated in `src/components/wallet/WalletModal.vue`

---

## 📁 File Structure

### New Files Created

```
apps/web/src/
├── config/
│   └── network.ts                    # Network configuration & helpers
├── components/
│   ├── NetworkIndicator.vue          # Header network badge
│   └── TestnetBanner.vue             # Top banner for testnets
```

### Modified Files

```
apps/web/
├── .env.example                      # Added network config vars
├── src/
│   ├── components/
│   │   ├── AppHeader.vue             # Added NetworkIndicator
│   │   └── wallet/
│   │       └── WalletModal.vue       # Added network badge
│   ├── layouts/
│   │   └── DefaultLayout.vue         # Added TestnetBanner
│   └── composables/
│       └── useSolana.ts              # Uses CURRENT_NETWORK
```

---

## 🔍 Technical Implementation

### Network Configuration (`src/config/network.ts`)

**Key exports**:

```typescript
// Current network (from environment)
export const CURRENT_NETWORK: NetworkConfig;

// All available networks
export const AVAILABLE_NETWORKS: Record<NetworkType, NetworkConfig>;

// Helper functions
export function getNetworkBadgeText(network: NetworkConfig): string;
export function isTestnetEnvironment(): boolean;
```

**NetworkConfig interface**:

```typescript
interface NetworkConfig {
  name: string;           // e.g., "devnet"
  displayName: string;    // e.g., "Devnet"
  type: NetworkType;      // mainnet-beta | testnet | devnet | localnet
  endpoint: string;       // RPC URL
  isTestnet: boolean;     // true for all except mainnet-beta
  color: string;          // Hex color for UI
}
```

### Usage in Components

**Import network config**:
```typescript
import { CURRENT_NETWORK } from '@/config/network';

const network = CURRENT_NETWORK;
```

**Conditional rendering**:
```vue
<template>
  <div v-if="network.isTestnet" class="testnet-indicator">
    {{ network.displayName }}
  </div>
</template>
```

**Dynamic styling**:
```vue
<div :style="{ '--network-color': network.color }">
  <!-- Color will be used in CSS via var(--network-color) -->
</div>
```

---

## 🚀 How to Change Networks

### For Development

1. **Edit `.env` file**:
   ```bash
   # Change network
   VITE_SOLANA_NETWORK=testnet
   ```

2. **Restart dev server**:
   ```bash
   npm run dev
   ```

3. **Verify in browser**:
   - Banner shows "TESTNET" with red color
   - Header shows testnet badge
   - Wallet modal shows testnet badge

### For Production

1. **Set environment variable** during build:
   ```bash
   VITE_SOLANA_NETWORK=mainnet-beta npm run build
   ```

2. **Verify** that no testnet indicators appear:
   - No banner
   - No network badge in header
   - No badge in wallet modal

### Custom RPC Endpoint

If you want to use a custom RPC (e.g., paid RPC service):

```bash
# In .env
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://my-custom-rpc.com
```

---

## 📱 Responsive Behavior

### Desktop (> 860px)
- Network badge appears in header next to wallet button
- Banner spans full width at top
- Wallet modal shows badge next to title

### Mobile (≤ 860px)
- Network badge appears in mobile nav menu
- Banner text adjusts to smaller font
- Wallet modal badge scales down

---

## 🎨 Visual Design

### Color Scheme

**Mainnet** (No indicators shown):
- Users see normal UI without network badges

**Devnet** (Orange):
- Badge: Orange gradient (#FFA500)
- Banner: Orange gradient background
- Message: Helpful for developers

**Testnet** (Red):
- Badge: Red gradient (#FF6B6B)
- Banner: Red gradient background
- Message: Warning about test environment

**Localnet** (Purple):
- Badge: Purple gradient (#9B59B6)
- Banner: Purple gradient background
- Message: Local development indicator

### Animations

**Network Indicator Badge**:
- Gentle pulse animation (2s cycle)
- Opacity: 1 → 0.8 → 1

**Banner**:
- Sticky positioning (stays visible on scroll)
- Smooth color gradients

---

## ✅ Testing Checklist

### Visual Verification

- [ ] **Devnet**: Orange banner and badges visible
- [ ] **Testnet**: Red banner and badges visible
- [ ] **Mainnet-beta**: No banners or badges
- [ ] **Localnet**: Purple banner and badges visible

### Functional Testing

- [ ] Change `VITE_SOLANA_NETWORK` in `.env`
- [ ] Restart dev server
- [ ] Verify UI updates correctly
- [ ] Check responsive behavior on mobile
- [ ] Test wallet connection on each network
- [ ] Verify RPC endpoint is correct

### Cross-Browser Testing

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🛠️ Customization

### Change Network Colors

Edit `src/config/network.ts`:

```typescript
export const AVAILABLE_NETWORKS: Record<NetworkType, NetworkConfig> = {
  devnet: {
    // ...
    color: '#YOUR_COLOR', // Change to your preferred color
  },
};
```

### Customize Banner Message

Edit `src/components/TestnetBanner.vue`:

```vue
<p class="testnet-banner__text">
  <strong>{{ network.displayName }} Environment:</strong>
  Your custom message here
</p>
```

### Add Network Selector

To let users switch networks in the UI:

```vue
<select v-model="selectedNetwork" @change="switchNetwork">
  <option value="devnet">Devnet</option>
  <option value="testnet">Testnet</option>
  <option value="mainnet-beta">Mainnet</option>
</select>
```

**Note**: This requires page reload to take effect (environment variable).

---

## 📊 Network Comparison

### When to Use Each Network

| Network | Use Case | SOL Source | Speed | Stability |
|---------|----------|------------|-------|-----------|
| **Devnet** | Active development, testing | Faucet (free) | Fast | Medium |
| **Testnet** | Pre-production testing | Faucet (free) | Medium | Medium |
| **Localnet** | Local development, debugging | Genesis (free) | Very Fast | High |
| **Mainnet** | Production, real users | Purchase | Fast | High |

### Recommended Development Flow

1. **Localnet**: Initial development and testing
2. **Devnet**: Integration testing with other services
3. **Testnet**: Final testing before production
4. **Mainnet**: Production deployment

---

## 🔐 Security Considerations

### Network Validation

The app validates the network environment:
- ✅ Users always see which network they're on
- ✅ No accidental mainnet transactions during testing
- ✅ Clear visual distinction between test and production

### Best Practices

1. **Never** deploy to mainnet with testnet indicators
2. **Always** verify `VITE_SOLANA_NETWORK` before deployment
3. **Test** thoroughly on testnets before mainnet
4. **Use** environment-specific `.env` files

---

## 🐛 Troubleshooting

### Banner Not Showing

**Problem**: Testnet banner doesn't appear
**Solutions**:
1. Check `.env` has `VITE_SOLANA_NETWORK` set correctly
2. Restart dev server after changing `.env`
3. Clear browser cache and reload
4. Verify `CURRENT_NETWORK.isTestnet === true`

### Wrong Network Color

**Problem**: Colors don't match expected network
**Solutions**:
1. Check `VITE_SOLANA_NETWORK` matches expected value
2. Verify `src/config/network.ts` color values
3. Check CSS custom property `--network-color` is applied
4. Inspect element in browser DevTools

### Custom RPC Not Working

**Problem**: App still uses default RPC
**Solutions**:
1. Verify `VITE_SOLANA_RPC_URL` is set in `.env`
2. Check RPC URL is valid and accessible
3. Test RPC endpoint: `curl https://your-rpc-url`
4. Check browser console for connection errors

---

## 📚 Related Documentation

- **Wallet Integration**: `docs/WALLET-INTEGRATION-IMPLEMENTATION.md`
- **Authentication Flow**: `docs/AUTH-FLOW-CLARIFICATION.md`
- **Environment Setup**: `apps/web/.env.example`

---

## 🎉 Summary

The network configuration system provides:

- ✅ **Clear visual indicators** for testnet environments
- ✅ **Flexible configuration** via environment variables
- ✅ **Responsive design** for all screen sizes
- ✅ **Production-safe** (no indicators on mainnet)
- ✅ **Developer-friendly** (easy to switch networks)

Users will always know which network they're using, preventing confusion and potential mistakes with real funds.

---

**Last Updated**: November 25, 2025
**Status**: ✅ Production Ready
**Dev Server**: Running at http://localhost:5173 with network indicators
