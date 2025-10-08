<template>
  <div class="view-content">
    <PageHeader
      title="Markets"
      subtitle="Explore liquid, self-resolving markets. Pick a trend or start your own."
    >
      <template #actions>
        <button class="ghost">Categories</button>
        <button class="cta">Create market</button>
      </template>
    </PageHeader>

    <section class="filters card">
      <input type="search" placeholder="Search markets, topics, tickers..." />
      <div class="filters__chips">
        <button
          v-for="chip in chips"
          :key="chip"
          class="chip"
          :class="{ active: selectedChip === chip }"
          @click="selectedChip = chip"
        >
          {{ chip }}
        </button>
      </div>
    </section>

    <section class="stats">
      <div class="stats__card">
        <span>Total volume (24h)</span>
        <strong>12.4M USDC</strong>
      </div>
      <div class="stats__card">
        <span>Markets live</span>
        <strong>128</strong>
      </div>
      <div class="stats__card">
        <span>Average fee</span>
        <strong>2.0%</strong>
      </div>
      <div class="stats__card">
        <span>Proofs on time</span>
        <strong>94%</strong>
      </div>
    </section>

    <section class="markets">
      <header>
        <h2>Trending markets</h2>
        <div class="markets__actions">
          <button class="ghost">24h Volume</button>
          <button class="ghost">Resolving soon</button>
        </div>
      </header>

      <div class="list">
        <MarketCard v-for="market in activeMarkets" :key="market.id" :market="market" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import PageHeader from '@/components/PageHeader.vue';
import MarketCard from '@/components/MarketCard.vue';
import { fetchActiveMarkets } from '@/services/mockApi';

const { data: activeQuery } = useQuery({
  queryKey: ['active-markets'],
  queryFn: fetchActiveMarkets
});

const activeMarkets = computed(() => activeQuery.value ?? []);

const chips = ['All', 'Crypto', 'Politics', 'Economy', 'Tech', 'Sports'];
const selectedChip = ref('All');
</script>

<style scoped>
.filters {
  display: grid;
  gap: 0.65rem;
}

.filters input {
  width: 100%;
  padding: 0.55rem 0.95rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  font-size: 0.9rem;
}

.filters__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: border 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.chip.active {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: rgba(58, 102, 245, 0.08);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.stats__card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  display: grid;
  gap: 0.3rem;
}

.stats__card span {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats__card strong {
  font-size: 1.2rem;
  font-weight: 700;
}

.markets header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.markets h2 {
  margin: 0;
  font-size: 1.4rem;
}

.markets__actions {
  display: flex;
  gap: 0.65rem;
}

.list {
  display: grid;
  gap: 1rem;
}

@media (max-width: 768px) {
  .markets header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .markets__actions {
    flex-wrap: wrap;
  }
}
</style>
