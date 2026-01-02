<template>
  <div class="trading-panel">
    <div class="panel-header">
      <h3>Trade</h3>
      <div class="trade-type-toggle">
        <button
          :class="{ active: isBuy }"
          @click="isBuy = true"
        >
          Buy
        </button>
        <button
          :class="{ active: !isBuy }"
          @click="isBuy = false"
        >
          Sell
        </button>
      </div>
    </div>

    <div class="outcomes-section">
      <label class="section-label">Select Outcome</label>
      <div class="outcomes-grid">
        <button
          v-for="(outcome, index) in outcomes"
          :key="index"
          :class="['outcome-btn', { selected: selectedOutcome === index }]"
          @click="selectedOutcome = index"
        >
          <span class="outcome-label">{{ outcome.label }}</span>
          <span class="outcome-price">{{ formatPrice(outcome.currentPrice) }}</span>
          <span class="outcome-prob">{{ (outcome.probability).toFixed(0) }}%</span>
        </button>
      </div>
    </div>

    <div class="amount-section">
      <label class="section-label">Amount (USDC)</label>
      <div class="amount-input-wrapper">
        <input
          v-model="amount"
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          class="amount-input"
        />
        <div class="quick-amounts">
          <button @click="amount = '10'">$10</button>
          <button @click="amount = '50'">$50</button>
          <button @click="amount = '100'">$100</button>
          <button @click="setMaxAmount">Max</button>
        </div>
      </div>
    </div>

    <div class="estimate-section" v-if="tradeEstimate">
      <div class="estimate-row">
        <span>Est. Shares</span>
        <span>{{ formatShares(tradeEstimate.expectedShares) }}</span>
      </div>
      <div class="estimate-row">
        <span>Avg. Price</span>
        <span>{{ formatPrice(tradeEstimate.expectedPrice) }}</span>
      </div>
      <div class="estimate-row">
        <span>Price Impact</span>
        <span :class="{ warning: tradeEstimate.priceImpact > 1 }">
          {{ tradeEstimate.priceImpact.toFixed(2) }}%
        </span>
      </div>
      <div class="estimate-row">
        <span>Trading Fee</span>
        <span>{{ formatUsdc(tradeEstimate.tradingFee) }}</span>
      </div>
      <div class="estimate-row total">
        <span>Total Cost</span>
        <span>{{ formatUsdc(tradeEstimate.totalCost) }}</span>
      </div>
    </div>

    <div class="slippage-section">
      <div class="slippage-header">
        <span>Max Slippage</span>
        <span>{{ maxSlippage }}%</span>
      </div>
      <input
        v-model="maxSlippage"
        type="range"
        min="0.1"
        max="10"
        step="0.1"
        class="slippage-slider"
      />
    </div>

    <button
      class="trade-button"
      :class="{ buy: isBuy, sell: !isBuy }"
      :disabled="!canTrade"
      @click="handleTrade"
    >
      <span v-if="loading" class="loading-spinner"></span>
      <span v-else>
        {{ isBuy ? 'Buy' : 'Sell' }}
        {{ selectedOutcome !== null ? outcomes[selectedOutcome]?.label : '' }}
      </span>
    </button>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useWalletStore } from '@/stores/wallet';
import { useTradingStore } from '@/stores/trading';
import { solanaProgramService } from '@/services/solanaProgram';
import type { Outcome, TradeEstimate } from '@/types/trading';
import { LAMPORTS_PER_USDC, DEFAULT_SLIPPAGE } from '@/types/trading';
import { PublicKey } from '@solana/web3.js';

const props = defineProps<{
  marketId: string;
  marketPublicKey: string;
  outcomes: Outcome[];
}>();

const emit = defineEmits<{
  (e: 'trade-success', signature: string): void;
  (e: 'trade-error', error: Error): void;
}>();

const walletStore = useWalletStore();
const tradingStore = useTradingStore();

const isBuy = ref(true);
const selectedOutcome = ref<number | null>(0);
const amount = ref('');
const maxSlippage = ref(DEFAULT_SLIPPAGE);
const loading = ref(false);
const error = ref<string | null>(null);

const tradeEstimate = computed<TradeEstimate | null>(() => {
  if (!amount.value || selectedOutcome.value === null) return null;

  const amountBigInt = BigInt(Math.floor(parseFloat(amount.value) * LAMPORTS_PER_USDC));
  if (amountBigInt <= BigInt(0)) return null;

  return solanaProgramService.estimateTrade({
    marketId: props.marketId,
    marketPublicKey: new PublicKey(props.marketPublicKey),
    outcomeIndex: selectedOutcome.value,
    isBuy: isBuy.value,
    amount: amountBigInt,
    maxSlippage: maxSlippage.value,
  });
});

const canTrade = computed(() => {
  return (
    walletStore.connected &&
    selectedOutcome.value !== null &&
    amount.value &&
    parseFloat(amount.value) > 0 &&
    !loading.value
  );
});

function formatPrice(price: number): string {
  return `$${price.toFixed(4)}`;
}

function formatShares(shares: bigint): string {
  return (Number(shares) / LAMPORTS_PER_USDC).toFixed(2);
}

function formatUsdc(lamports: bigint): string {
  return `$${(Number(lamports) / LAMPORTS_PER_USDC).toFixed(2)}`;
}

function setMaxAmount() {
  // TODO: Get wallet balance
  amount.value = '100';
}

async function handleTrade() {
  if (!canTrade.value || selectedOutcome.value === null) return;

  loading.value = true;
  error.value = null;

  try {
    const result = await tradingStore.executeTrade({
      marketId: props.marketId,
      marketPublicKey: new PublicKey(props.marketPublicKey),
      outcomeIndex: selectedOutcome.value,
      isBuy: isBuy.value,
      amount: BigInt(Math.floor(parseFloat(amount.value) * LAMPORTS_PER_USDC)),
      maxSlippage: maxSlippage.value,
    });

    emit('trade-success', result.signature);
    amount.value = '';
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Trade failed';
    error.value = errorMessage;
    emit('trade-error', err as Error);
  } finally {
    loading.value = false;
  }
}

watch(() => props.outcomes, () => {
  if (selectedOutcome.value === null && props.outcomes.length > 0) {
    selectedOutcome.value = 0;
  }
}, { immediate: true });
</script>

<style scoped>
.trading-panel {
  background: var(--color-surface, #1a1a2e);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--color-border, #2d2d44);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.trade-type-toggle {
  display: flex;
  background: var(--color-background, #0f0f1a);
  border-radius: 8px;
  padding: 4px;
}

.trade-type-toggle button {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #8888aa);
  cursor: pointer;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.trade-type-toggle button.active {
  background: var(--color-primary, #6366f1);
  color: white;
}

.section-label {
  display: block;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #8888aa);
  margin-bottom: 0.5rem;
}

.outcomes-section {
  margin-bottom: 1.5rem;
}

.outcomes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.outcome-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--color-background, #0f0f1a);
  border: 2px solid var(--color-border, #2d2d44);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.outcome-btn:hover {
  border-color: var(--color-primary, #6366f1);
}

.outcome-btn.selected {
  border-color: var(--color-primary, #6366f1);
  background: rgba(99, 102, 241, 0.1);
}

.outcome-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.outcome-price {
  font-size: 1.125rem;
  color: var(--color-primary, #6366f1);
}

.outcome-prob {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #8888aa);
}

.amount-section {
  margin-bottom: 1.5rem;
}

.amount-input-wrapper {
  position: relative;
}

.amount-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.25rem;
  background: var(--color-background, #0f0f1a);
  border: 1px solid var(--color-border, #2d2d44);
  border-radius: 8px;
  color: var(--color-text, #ffffff);
  outline: none;
}

.amount-input:focus {
  border-color: var(--color-primary, #6366f1);
}

.quick-amounts {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.quick-amounts button {
  flex: 1;
  padding: 0.5rem;
  background: var(--color-background, #0f0f1a);
  border: 1px solid var(--color-border, #2d2d44);
  border-radius: 6px;
  color: var(--color-text-secondary, #8888aa);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.quick-amounts button:hover {
  border-color: var(--color-primary, #6366f1);
  color: var(--color-primary, #6366f1);
}

.estimate-section {
  background: var(--color-background, #0f0f1a);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.estimate-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.estimate-row:not(:last-child) {
  border-bottom: 1px solid var(--color-border, #2d2d44);
}

.estimate-row.total {
  font-weight: 600;
  font-size: 1rem;
  padding-top: 0.75rem;
}

.estimate-row .warning {
  color: var(--color-warning, #f59e0b);
}

.slippage-section {
  margin-bottom: 1.5rem;
}

.slippage-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.slippage-slider {
  width: 100%;
  accent-color: var(--color-primary, #6366f1);
}

.trade-button {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.trade-button.buy {
  background: var(--color-success, #10b981);
  color: white;
}

.trade-button.sell {
  background: var(--color-error, #ef4444);
  color: white;
}

.trade-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.trade-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error, #ef4444);
  border-radius: 6px;
  color: var(--color-error, #ef4444);
  font-size: 0.875rem;
}
</style>
