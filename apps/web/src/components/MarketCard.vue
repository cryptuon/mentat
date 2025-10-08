<template>
  <RouterLink :to="`/market/${market.id}`" class="market-card">
    <div class="market-card__left">
      <div class="market-card__meta">
        <span class="pill" v-if="market.category.length">{{ market.category[0] }}</span>
        <span class="deadline">Resolves {{ deadlineLabel }}</span>
      </div>
      <h3>{{ market.question }}</h3>
      <p>{{ shortSummary }}</p>
      <div class="market-card__stats">
        <span>24h Vol · {{ formatCurrency(market.volume24h) }}</span>
        <span>Open Interest · {{ formatCurrency(market.openInterest) }}</span>
      </div>
    </div>
    <div class="market-card__right">
      <div class="price">
        <span>{{ primaryOutcome.label }}</span>
        <strong>{{ primaryOutcome.price.toFixed(2) }}</strong>
      </div>
      <button
        class="share"
        @click.stop.prevent="handleShare"
        aria-label="Share market"
      >
        Share
      </button>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { computed } from 'vue';
import type { MarketSummary } from '@/types';

dayjs.extend(relativeTime);

const props = defineProps<{ market: MarketSummary }>();

const primaryOutcome = computed(() => props.market.outcomes[0] ?? { label: 'YES', price: 0 });
const deadlineLabel = computed(() => dayjs(props.market.resolutionDeadline).fromNow());
const shortSummary = computed(() =>
  props.market.summary.length > 100 ? `${props.market.summary.slice(0, 97)}…` : props.market.summary
);

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toFixed(0);
}

function handleShare() {
  if (typeof window === 'undefined') return;
  const shareUrl = `${window.location.origin}/market/${props.market.id}`;
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (!nav) return;
  if ('share' in nav) {
    (nav as Navigator).share({ title: props.market.question, url: shareUrl }).catch(() => null);
    return;
  }
  nav.clipboard?.writeText(shareUrl).catch(() => null);
}
</script>

<style scoped>
.market-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: #fff;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.market-card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 4px 12px rgba(58, 102, 245, 0.1);
}

.market-card__left {
  flex: 1;
  display: grid;
  gap: 0.5rem;
  min-width: 0;
}

.market-card__meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.deadline {
  font-weight: 500;
}

h3 {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.3;
  font-weight: 600;
}

p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.market-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.market-card__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.price {
  text-align: right;
}

.price span {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.15rem;
}

.price strong {
  font-size: 1.3rem;
  letter-spacing: 0.01em;
}

.share {
  padding: 0.35rem 0.7rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: border 0.2s ease, color 0.2s ease;
  white-space: nowrap;
}

.share:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

@media (max-width: 640px) {
  .market-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .market-card__right {
    width: 100%;
    justify-content: space-between;
  }

  .price {
    text-align: left;
  }
}
</style>
