#!/bin/bash

# Wallet Integration Verification Script
# Checks if all wallet integration files and dependencies are in place

set -e

echo "🔍 Verifying Wallet Integration..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1 - NOT FOUND"
        ((ERRORS++))
    fi
}

# Function to check package installed
check_package() {
    if grep -q "\"$1\"" package.json; then
        echo -e "${GREEN}✓${NC} Package: $1"
    else
        echo -e "${RED}✗${NC} Package: $1 - NOT IN package.json"
        ((ERRORS++))
    fi
}

echo "📦 Checking Files..."
echo ""

# Check wallet store
check_file "src/stores/wallet.ts"

# Check composable
check_file "src/composables/useSolana.ts"

# Check plugin
check_file "src/plugins/wallet.ts"

# Check components
check_file "src/components/wallet/WalletConnectButton.vue"
check_file "src/components/wallet/WalletModal.vue"

# Check main.ts
check_file "src/main.ts"

# Check AppHeader.vue
check_file "src/components/AppHeader.vue"

echo ""
echo "📚 Checking Dependencies..."
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"

    # Check specific packages
    if [ -d "node_modules/@solana/wallet-adapter-base" ]; then
        echo -e "${GREEN}✓${NC} @solana/wallet-adapter-base installed"
    else
        echo -e "${YELLOW}⚠${NC} @solana/wallet-adapter-base not in node_modules"
        ((WARNINGS++))
    fi

    if [ -d "node_modules/@solana/web3.js" ]; then
        echo -e "${GREEN}✓${NC} @solana/web3.js installed"
    else
        echo -e "${YELLOW}⚠${NC} @solana/web3.js not in node_modules"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗${NC} node_modules directory not found"
    ((ERRORS++))
fi

echo ""
echo "🔧 Checking Integration..."
echo ""

# Check if wallet plugin is registered in main.ts
if grep -q "walletPlugin" src/main.ts; then
    echo -e "${GREEN}✓${NC} Wallet plugin imported in main.ts"
else
    echo -e "${RED}✗${NC} Wallet plugin not imported in main.ts"
    ((ERRORS++))
fi

if grep -q "app.use(walletPlugin" src/main.ts; then
    echo -e "${GREEN}✓${NC} Wallet plugin registered in main.ts"
else
    echo -e "${RED}✗${NC} Wallet plugin not registered in main.ts"
    ((ERRORS++))
fi

# Check if components are imported in AppHeader
if grep -q "WalletConnectButton" src/components/AppHeader.vue; then
    echo -e "${GREEN}✓${NC} WalletConnectButton imported in AppHeader.vue"
else
    echo -e "${RED}✗${NC} WalletConnectButton not imported in AppHeader.vue"
    ((ERRORS++))
fi

if grep -q "WalletModal" src/components/AppHeader.vue; then
    echo -e "${GREEN}✓${NC} WalletModal imported in AppHeader.vue"
else
    echo -e "${RED}✗${NC} WalletModal not imported in AppHeader.vue"
    ((ERRORS++))
fi

echo ""
echo "📋 Summary:"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Wallet integration is complete.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm run dev"
    echo "  2. Open browser to http://localhost:5173"
    echo "  3. Click 'Connect Wallet' button"
    echo "  4. Install Phantom or Solflare if needed"
    echo "  5. Test connection flow"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Checks passed with $WARNINGS warning(s)${NC}"
    echo ""
    echo "Warnings indicate npm install may still be in progress."
    echo "Wait for npm install to complete, then run this script again."
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "Please fix the errors above before proceeding."
    exit 1
fi
