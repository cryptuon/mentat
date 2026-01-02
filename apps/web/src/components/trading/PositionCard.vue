<template>
  <div class="position-card" :class="{ profitable: position.unrealizedPnL > 0 }">
    <div class="position-header">
      <div class="outcome-info">
        <span class="outcome-badge" :style="{ backgroundColor: outcomeColor }">
          {{ position.outcomeLabel }}
        </span>
        <span class="shares">{{ formatShares(position.shares) }} shares</span>
      </div>
      <div class="pnl" :class="pnlClass">
        {{ pnlSign }}{{ formatUsdc(Math.abs(position.unrealizedPnL)) }}
        <span class="pnl-percent">({{ pnlSign }}{{ Math.abs(position.unrealizedPnLPercentage).toFixed(1) }}%)</span>
      </div>
    </div>

    <div class="position-details">
      <div class="detail-row">
        <span class="label">Avg Entry</span>
        <span class="value">{{ formatPrice(position.avgEntryPrice) }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Current Price</span>
        <span class="value">{{ formatPrice(position.currentPrice) }}</span>
      </div>
      <div class="detail-row">
        <span class="label">Invested</span>
        <span class="value">{{ formatUsdc(Number(position.investedAmount)) }}</span>
      </div>
      <div class="detail-row highlight">
        <span class="label">Current Value</span>
        <span class="value">{{ formatUsdc(Number(position.currentValue)) }}</span>
      </div>
    </div>

    <div class="position-actions">
      <button class="action-btn sell" @click="$emit('sell', position)">
        Sell Position
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Position } from '@/types/trading';
import { LAMPORTS_PER_USDC } from '@/types/trading';

const props = defineProps<{
  position: Position;
}>();

defineEmits<{
  (e: 'sell', position: Position): void;
}>();

const outcomeColors = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6'];

const outcomeColor = computed(() => {
  return outcomeColors[props.position.outcomeIndex % outcomeColors.length];
});

const pnlClass = computed(() => ({
  positive: props.position.unrealizedPnL > 0,
  negative: props.position.unrealizedPnL < 0,
  neutral: props.position.unrealizedPnL === 0,
}));

const pnlSign = computed(() => {
  if (props.position.unrealizedPnL > 0) return '+';
  if (props.position.unrealizedPnL < 0) return '-';
  return '';
});

function formatShares(shares: bigint): string {
  return (Number(shares) / LAMPORTS_PER_USDC).toFixed(2);
}

function formatPrice(price: number): string {
  return `$${price.toFixed(4)}`;
}

function formatUsdc(amount: number): string {
  return `$${(amount / LAMPORTS_PER_USDC).toFixed(2)}`;
}
</script>

<style scoped>
.position-card {
  background: var(--color-surface, #1a1a2e);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid var(--color-border, #2d2d44);
  transition: all 0.2s;
}

.position-card:hover {
  border-color: var(--color-primary, #6366f1);
  transform: translateY(-2px);
}

.position-card.profitable {
  border-color: rgba(16, 185, 129, 0.3);
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.outcome-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.outcome-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.shares {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #8888aa);
}

.pnl {
  text-align: right;
  font-weight: 600;
  font-size: 1.125rem;
}

.pnl.positive {
  color: var(--color-success, #10b981);
}

.pnl.negative {
  color: var(--color-error, #ef4444);
}

.pnl.neutral {
  color: var(--color-text-secondary, #8888aa);
}

.pnl-percent {
  font-size: 0.875rem;
  font-weight: 400;
}

.position-details {
  background: var(--color-background, #0f0f1a);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.375rem 0;
  font-size: 0.875rem;
}

.detail-row:not(:last-child) {
  border-bottom: 1px solid var(--color-border, #2d2d44);
}

.detail-row.highlight {
  font-weight: 600;
  padding-top: 0.5rem;
}

.detail-row .label {
  color: var(--color-text-secondary, #8888aa);
}

.detail-row .value {
  color: var(--color-text, #ffffff);
}

.position-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.sell {
  background: var(--color-error, #ef4444);
  color: white;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
