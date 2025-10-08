<template>
  <RouterLink :to="`/market/${market.id}`" class="card market">
    <div class="market__header">
      <StatusBadge
        :intent="market.state === 'resolved' ? 'success' : market.state === 'locked' ? 'warning' : 'default'"
      >
        {{ market.state.toUpperCase() }}
      </StatusBadge>
      <span class="market__deadline">
        Resolves {{ deadlineLabel }}
      </span>
    </div>
    <h3>{{ market.question }}</h3>
    <p class="market__summary">
      {{ shortSummary }}
    </p>

    <div class="market__odds">
      <div v-for="outcome in market.outcomes" :key="outcome.id">
        <label>{{ outcome.label }}</label>
        <strong>{{ outcome.probability }}%</strong>
      </div>
    </div>

    <footer class="market__footer">
      <span>24h Vol: {{ formatCurrency(market.volume24h) }}</span>
      <span>OI: {{ formatCurrency(market.openInterest) }}</span>
      <span
        class="share"
        role="button"
        tabindex="0"
        @click.stop.prevent="handleShare"
        @keydown.enter.stop.prevent="handleShare"
      >
        Share
      </span>
    </footer>
  </RouterLink>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { computed } from 'vue';
import type { MarketSummary } from '@/types';
import StatusBadge from './StatusBadge.vue';

dayjs.extend(relativeTime);

const props = defineProps<{ market: MarketSummary }>();

const deadlineLabel = dayjs(props.market.resolutionDeadline).fromNow();
const shortSummary = computed(() =>
  props.market.summary.length > 110
    ? `${props.market.summary.slice(0, 107)}…`
    : props.market.summary
);

function formatCurrency(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  return `${(value / 1000).toFixed(1)}k`;
}

function handleShare() {
  if (typeof window === 'undefined') return;
  const shareUrl = `${window.location.origin}/market/${props.market.id}`;
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (!nav) return;
  if ('share' in nav) {
    (nav as Navigator)
      .share({ title: props.market.question, url: shareUrl })
      .catch(() => null);
    return;
  }
  if (nav.clipboard) {
    nav.clipboard.writeText(shareUrl).catch(() => null);
  }
}
</script>

<style scoped>
.market {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s ease, border 0.2s ease;
}

.market:hover {
  transform: translateY(-6px);
  border-color: rgba(125, 95, 255, 0.4);
}

.market__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

h3 {
  margin: 0;
  font-size: 1.2rem;
}

.market__summary {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.market__odds {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.market__odds div {
  padding: 0.75rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
}

.market__odds label {
  display: block;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.market__odds strong {
  font-size: 1.4rem;
}

.market__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  gap: 0.75rem;
}

.share {
  padding: 0.35rem 0.8rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.16);
  cursor: pointer;
  transition: border 0.2s ease;
  font-size: 0.75rem;
}

.share:hover,
.share:focus-visible {
  border-color: rgba(125, 95, 255, 0.5);
}
</style>
