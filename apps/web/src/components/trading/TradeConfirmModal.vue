<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Confirm {{ tradeType }}</h3>
            <button class="close-btn" @click="$emit('close')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="trade-summary">
              <div class="summary-icon" :class="{ buy: isBuy, sell: !isBuy }">
                <svg v-if="isBuy" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
                  <polyline points="17,6 23,6 23,12"></polyline>
                </svg>
                <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"></polyline>
                  <polyline points="17,18 23,18 23,12"></polyline>
                </svg>
              </div>

              <div class="outcome-display">
                <span class="outcome-label">{{ outcomeLabel }}</span>
                <span class="outcome-price">@ {{ formatPrice(expectedPrice) }}</span>
              </div>
            </div>

            <div class="trade-details">
              <div class="detail-row">
                <span class="label">Amount</span>
                <span class="value">{{ formatUsdc(amount) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Expected Shares</span>
                <span class="value">{{ formatShares(expectedShares) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Price Impact</span>
                <span class="value" :class="{ warning: priceImpact > 1 }">
                  {{ priceImpact.toFixed(2) }}%
                </span>
              </div>
              <div class="detail-row">
                <span class="label">Trading Fee</span>
                <span class="value">{{ formatUsdc(tradingFee) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Max Slippage</span>
                <span class="value">{{ maxSlippage }}%</span>
              </div>
              <div class="detail-row total">
                <span class="label">Total</span>
                <span class="value">{{ formatUsdc(totalCost) }}</span>
              </div>
            </div>

            <div class="slippage-warning" v-if="priceImpact > 2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>High price impact! Consider reducing your trade size.</span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="$emit('close')">
              Cancel
            </button>
            <button
              class="btn btn-primary"
              :class="{ buy: isBuy, sell: !isBuy }"
              :disabled="loading"
              @click="$emit('confirm')"
            >
              <span v-if="loading" class="loading-spinner"></span>
              <span v-else>Confirm {{ tradeType }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LAMPORTS_PER_USDC } from '@/types/trading';

const props = defineProps<{
  show: boolean;
  isBuy: boolean;
  outcomeLabel: string;
  amount: bigint;
  expectedShares: bigint;
  expectedPrice: number;
  priceImpact: number;
  tradingFee: bigint;
  totalCost: bigint;
  maxSlippage: number;
  loading?: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

const tradeType = computed(() => props.isBuy ? 'Buy' : 'Sell');

function formatShares(shares: bigint): string {
  return (Number(shares) / LAMPORTS_PER_USDC).toFixed(4);
}

function formatPrice(price: number): string {
  return `$${price.toFixed(4)}`;
}

function formatUsdc(lamports: bigint): string {
  return `$${(Number(lamports) / LAMPORTS_PER_USDC).toFixed(2)}`;
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--color-surface, #1a1a2e);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--color-border, #2d2d44);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border, #2d2d44);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary, #8888aa);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-text, #ffffff);
}

.modal-body {
  padding: 1.5rem;
}

.trade-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background, #0f0f1a);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.summary-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-icon.buy {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success, #10b981);
}

.summary-icon.sell {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error, #ef4444);
}

.outcome-display {
  display: flex;
  flex-direction: column;
}

.outcome-label {
  font-size: 1.25rem;
  font-weight: 600;
}

.outcome-price {
  color: var(--color-text-secondary, #8888aa);
}

.trade-details {
  background: var(--color-background, #0f0f1a);
  border-radius: 12px;
  padding: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.625rem 0;
  font-size: 0.9375rem;
}

.detail-row:not(:last-child) {
  border-bottom: 1px solid var(--color-border, #2d2d44);
}

.detail-row .label {
  color: var(--color-text-secondary, #8888aa);
}

.detail-row .value {
  font-weight: 500;
}

.detail-row .value.warning {
  color: var(--color-warning, #f59e0b);
}

.detail-row.total {
  font-weight: 600;
  font-size: 1rem;
  padding-top: 0.75rem;
}

.slippage-warning {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-top: 1rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid var(--color-warning, #f59e0b);
  border-radius: 8px;
  color: var(--color-warning, #f59e0b);
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--color-border, #2d2d44);
}

.btn {
  flex: 1;
  padding: 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: var(--color-background, #0f0f1a);
  color: var(--color-text, #ffffff);
  border: 1px solid var(--color-border, #2d2d44);
}

.btn-secondary:hover {
  border-color: var(--color-text-secondary, #8888aa);
}

.btn-primary.buy {
  background: var(--color-success, #10b981);
  color: white;
}

.btn-primary.sell {
  background: var(--color-error, #ef4444);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(-10px);
}
</style>
