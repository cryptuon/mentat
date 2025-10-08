<template>
  <div class="page">
    <TopBar
      title="Ledger of Arrakis"
      subtitle="Spice flows, stakes locked, alerts from the desert."
      :help-topic="'overview'"
    >
      <template #actions>
        <button class="ghost">Manage notifications</button>
        <button class="cta">Withdraw rewards</button>
      </template>
    </TopBar>

    <section class="grid two">
      <MetricCard
        v-for="metric in metrics"
        :key="metric.title"
        :title="metric.title"
        :value="metric.value"
        :delta="metric.delta"
        :delta-label="metric.deltaLabel"
      />
    </section>

    <section class="grid two">
      <article class="card holdings">
        <h2>Active spice stakes</h2>
        <ul>
          <li v-for="market in markets" :key="market.id">
            <div>
              <strong>{{ market.question }}</strong>
              <p>Stake 50 USDC · {{ market.state }}</p>
            </div>
            <RouterLink :to="`/market/${market.id}`" class="ghost">View</RouterLink>
          </li>
        </ul>
      </article>

      <article class="card alerts">
        <h2>Sietch alerts</h2>
        <div class="alert">
          <StatusBadge intent="warning">Action needed</StatusBadge>
          <p>Proof on market-2 due in 48 min.</p>
        </div>
        <div class="alert">
          <StatusBadge intent="success">All good</StatusBadge>
          <p>No disputes. Avg resolution beating SLA.</p>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import TopBar from '@/components/TopBar.vue';
import MetricCard from '@/components/MetricCard.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import { fetchCreatorMetrics, fetchActiveMarkets } from '@/services/mockApi';

const { data: metricQuery } = useQuery({
  queryKey: ['creator-metrics'],
  queryFn: fetchCreatorMetrics
});

const { data: marketQuery } = useQuery({
  queryKey: ['my-markets'],
  queryFn: fetchActiveMarkets
});

const metrics = computed(() => metricQuery.value ?? []);
const markets = computed(() => (marketQuery.value ?? []).slice(0, 4));
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.holdings ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.holdings li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.holdings strong {
  font-size: 1rem;
}

.holdings p {
  margin: 0.35rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.alerts {
  display: grid;
  gap: 1rem;
}

.alert {
  display: grid;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.alert p {
  margin: 0;
  color: var(--color-text-secondary);
}
</style>
