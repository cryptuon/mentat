<template>
  <div class="view-content">
    <PageHeader
      title="My activity"
      subtitle="Track balances, open stakes, and service alerts across your markets."
    >
      <template #actions>
        <button class="ghost">Notifications</button>
        <button class="cta">Withdraw rewards</button>
      </template>
    </PageHeader>

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
        <div class="card__title">
          <h2>Open stakes</h2>
        </div>
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
        <div class="card__title">
          <h2>Alerts</h2>
        </div>
        <div class="alert">
          <StatusBadge intent="warning">Action needed</StatusBadge>
          <p>Proof on market-2 due in 48 min.</p>
        </div>
        <div class="alert">
          <StatusBadge intent="success">All good</StatusBadge>
          <p>No disputes pending. Average resolution within SLA.</p>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import PageHeader from '@/components/PageHeader.vue';
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
  border: 1px solid var(--color-border);
  background: #fff;
}

.holdings strong {
  font-size: 1rem;
}

.holdings p {
  margin: 0.35rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.holdings,
.alerts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert {
  display: grid;
  gap: 0.5rem;
  background: #fff;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: 1rem;
}

.alert p {
  margin: 0;
  color: var(--color-text-secondary);
}
</style>
