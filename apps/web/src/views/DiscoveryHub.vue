<template>
  <div class="page">
    <TopBar
      title="Arrakeen Feed"
      subtitle="Fresh spice bets. Ride the dune or fade it."
      :help-topic="'trader'"
    >
      <template #actions>
        <button class="ghost">Filters</button>
        <button class="cta">Summon Market</button>
      </template>
    </TopBar>

    <section class="hero card">
      <div class="hero__copy">
        <h2>Spice is flowing</h2>
        <ul>
          <li>Real odds. No Guild middlemen.</li>
          <li>zkTLS receipts prove every whisper.</li>
          <li>Share the sietch. Fees flow like melange.</li>
        </ul>
        <div class="hero__tags">
          <span class="pill">AI curated</span>
          <span class="pill">Truth trance verified</span>
          <span class="pill">Solana speed</span>
        </div>
        <button class="ghost hero__learn" @click="openHelp('overview')">Learn more</button>
      </div>
      <div class="hero__carousel">
        <article
          v-for="market in featuredMarkets"
          :key="market.id"
          class="hero__slide"
        >
          <p class="hero__deadline">
            Resolves {{ deadlineLabel(market.resolutionDeadline) }}
          </p>
          <h3>{{ market.question }}</h3>
          <p>{{ market.summary }}</p>
          <RouterLink :to="`/market/${market.id}`" class="cta hero__cta">
            View market
          </RouterLink>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section-heading">
        <h2>Spice storms 🔥</h2>
        <span class="pill">Auto-refreshing</span>
      </div>
      <div class="grid three">
        <MarketCard v-for="market in activeMarkets" :key="market.id" :market="market" />
      </div>
    </section>

    <section class="section">
      <div class="section-heading">
        <h2>Guild metrics</h2>
        <span class="pill">Updated hourly</span>
      </div>
      <div class="grid two">
        <MetricCard
          title="Active markets"
          value="128"
          :delta="14"
          delta-label="vs. last week"
        />
        <MetricCard
          title="Proofs within SLA"
          value="94%"
          :delta="4"
          delta-label="vs. 30d average"
        />
        <MetricCard
          title="Invalid rate"
          value="1.2%"
          :delta="-0.6"
          delta-label="vs. 90d average"
        />
        <MetricCard
          title="Total volume (24h)"
          value="12.4M USDC"
          :delta="18"
          delta-label="vs. prior 24h"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import TopBar from '@/components/TopBar.vue';
import MarketCard from '@/components/MarketCard.vue';
import MetricCard from '@/components/MetricCard.vue';
import { useHelpStore, type HelpTopic } from '@/stores/help';
import { fetchFeaturedMarkets, fetchActiveMarkets } from '@/services/mockApi';

dayjs.extend(relativeTime);

const { data: featuredQuery } = useQuery({
  queryKey: ['featured-markets'],
  queryFn: fetchFeaturedMarkets
});

const { data: activeQuery } = useQuery({
  queryKey: ['active-markets'],
  queryFn: fetchActiveMarkets
});

const featuredMarkets = computed(() => featuredQuery.value ?? []);
const activeMarkets = computed(() => activeQuery.value ?? []);

const deadlineLabel = (iso: string) => dayjs(iso).fromNow();
const help = useHelpStore();
const openHelp = (topic: HelpTopic) => help.show(topic);
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.hero {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: center;
}

.hero__copy h2 {
  margin: 0;
  font-size: 2rem;
}

.hero__copy ul {
  margin: 0.75rem 0 0;
  padding-left: 1.2rem;
  color: var(--color-text-secondary);
  display: grid;
  gap: 0.35rem;
}

.hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.hero__carousel {
  display: grid;
  gap: 1.25rem;
}

.hero__learn {
  margin-top: 1rem;
  padding: 0.45rem 1rem;
  font-size: 0.8rem;
}

.hero__slide {
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: grid;
  gap: 0.75rem;
}

.hero__deadline {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.hero__cta {
  justify-self: start;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
